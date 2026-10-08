from __future__ import annotations

import sys
from pathlib import Path

import pytest

from dashboard.composer_enhancements import hermes_runs
from dashboard.composer_enhancements.codex_app_server import CodexAppServer, _child_environment
from dashboard.composer_enhancements.codex_live import CodexLiveRegistry, _post_offer
from dashboard.composer_enhancements.errors import ContractError

FIXTURE = Path(__file__).parent / "fixtures" / "fake_codex_app_server.py"
OWNER = {"connectionId": "local", "profile": "default", "runtimeSessionId": "r", "storedSessionId": "s"}


def test_app_server_offer_fence_commands_result_and_teardown(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("dashboard.composer_enhancements.codex_live.capability_context",lambda _owner:"Tools:\n- terminal: Run commands.\nSkills:\n- github")
    registry = CodexLiveRegistry()
    registry.app_factory = lambda: CodexAppServer([sys.executable, str(FIXTURE)])
    request = {"owner": OWNER, "generation": "g1", "billingLane": "subscription", "provider": "codex", "engine": "gpt-live-1-codex", "voice": "cove", "language": "en", "offer": "offer-sdp"}
    receipt = registry.offer(request)
    assert receipt["answer"] == "answer-sdp"
    fenced = {"owner": OWNER, "generation": "g1", "sessionId": receipt["sessionId"]}
    assert registry.command({**fenced, "command": "interrupt", "turnId": "turn-1"}) == {"ok": True}
    assert registry.result({**fenced, "correlationId": "delegation-1", "text": "done"}) == {"ok": True}
    assert registry.result({**fenced, "correlationId": "delegation-1", "text": "done"})["duplicate"] is True
    with pytest.raises(ContractError):
        registry.command({**fenced, "generation": "g2", "command": "mute"})
    with pytest.raises(ContractError):
        registry.close({**fenced, "owner": {**OWNER, "connectionId": "other"}})
    process = registry._sessions[receipt["sessionId"]].app.process
    assert registry.close(fenced) == {"ok": True}
    assert process.poll() is not None


def test_explicit_api_lane_never_uses_subscription(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("COMPOSER_REALTIME_OFFER_URL", raising=False)
    monkeypatch.setenv("COMPOSER_OPENAI_API_KEY", "key")
    registry = CodexLiveRegistry()
    registry.app_factory = lambda: (_ for _ in ()).throw(AssertionError("subscription fallback"))
    with pytest.raises(ContractError):
        registry.offer({"owner": OWNER, "generation": "g", "billingLane": "api", "provider": "openai", "engine": "gpt-realtime-2.1", "voice": "cedar", "language": "en", "offer": "sdp"})


def test_codex_child_environment_is_minimal_and_excludes_provider_keys(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PATH", "bin")
    monkeypatch.setenv("HOME", "home")
    monkeypatch.setenv("CODEX_HOME", "codex-home")
    monkeypatch.setenv("OPENAI_API_KEY", "must-not-leak")
    monkeypatch.setenv("UNRELATED_SECRET", "must-not-leak")
    environment = _child_environment()
    assert environment["PATH"] == "bin"
    assert environment["HOME"] == "home"
    assert environment["CODEX_HOME"] == "codex-home"
    assert "OPENAI_API_KEY" not in environment
    assert "UNRELATED_SECRET" not in environment


def test_api_offer_uses_no_redirect_handler_and_keeps_bearer_on_one_request(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    class Response:
        def __enter__(self): return self
        def __exit__(self, *_args): return None
        def read(self, limit: int) -> bytes:
            assert limit == 200_001
            return b"answer-sdp"

    class Opener:
        def open(self, request, timeout: int):
            captured["request"] = request
            assert timeout == 30
            return Response()

    def build_opener(handler):
        captured["handler"] = handler
        return Opener()

    monkeypatch.setattr("dashboard.composer_enhancements.codex_live.urllib.request.build_opener", build_opener)
    assert _post_offer("https://api.example/realtime?model=gpt-realtime-2.1", "offer-sdp", "secret") == "answer-sdp"
    request = captured["request"]
    assert request.get_header("Authorization") == "Bearer secret"
    assert captured["handler"].redirect_request(request, None, 307, "redirect", {}, "https://evil.example") is None


def test_capability_catalog_comes_from_api_server_skills_and_enabled_toolsets(monkeypatch: pytest.MonkeyPatch) -> None:
    def request(_owner,method,path,body=None,timeout=10):
        assert method=="GET" and body is None and timeout==10
        if path=="/v1/skills":return {"object":"list","data":[{"name":"github-code-review","category":"github","description":"Review pull requests."}]}
        if path=="/v1/toolsets":return {"object":"list","data":[{"name":"web","description":"Web tools","enabled":True,"tools":["web_search","web_extract"]},{"name":"disabled","enabled":False,"tools":["unused"]}]}
        raise AssertionError(path)
    monkeypatch.setattr(hermes_runs,"_request",request)
    result=hermes_runs.capability_context(OWNER)
    assert "github / github-code-review: Review pull requests." in result
    assert "web_search, web_extract" in result
    assert "unused" not in result


def test_run_targets_only_the_chat_where_live_voice_started_and_is_owner_fenced(monkeypatch: pytest.MonkeyPatch) -> None:
    hermes_runs._OWNERS.clear();calls=[]
    def request(_owner,method,path,body=None,timeout=10):
        calls.append((method,path,body,timeout))
        if path=="/v1/runs":return {"run_id":"run_abc"}
        if path=="/v1/runs/run_abc":return {"status":"completed","output":"working tree clean"}
        if path=="/v1/runs/run_abc/steer":return {"status":"accepted"}
        if path=="/v1/runs/run_abc/stop":return {"status":"stopping"}
        raise AssertionError(path)
    monkeypatch.setattr(hermes_runs,"_request",request)
    receipt=hermes_runs.start({"owner":OWNER,"text":"check git status","voiceContext":"User: Please inspect it."})
    assert receipt=={"ok":True,"runId":"run_abc","status":"queued"}
    submitted=calls[0][2]
    assert submitted["input"]=="check git status"
    assert submitted["session_id"]==OWNER["storedSessionId"]
    assert "Recent ephemeral Live Voice context" in submitted["instructions"]
    assert "Do not create or switch sessions" in submitted["instructions"]
    assert hermes_runs.status({"owner":OWNER,"runId":"run_abc"})["output"]=="working tree clean"
    with pytest.raises(ContractError):hermes_runs.status({"owner":{**OWNER,"storedSessionId":"other"},"runId":"run_abc"})
    assert hermes_runs.steer({"owner":OWNER,"runId":"run_abc","text":"use the other branch"})["status"]=="accepted"
    assert calls[-1][2]=={"input":"use the other branch"}
    assert hermes_runs.stop({"owner":OWNER,"runId":"run_abc"})["status"]=="stopping"
