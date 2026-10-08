"""Owner-fenced WebRTC negotiation and command dispatch."""
from __future__ import annotations

import secrets
import threading
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from typing import Any

from .codex_app_server import CodexAppServer, CodexRpcError
from .errors import ContractError, PublicErrorCode
from .hermes_runs import capability_context
from .identity import profile_identity
from .paths import hermes_home
from .runtime_env import read as read_runtime_env
from .voice_options import validate_voice_selection


class _RefuseRedirects(urllib.request.HTTPRedirectHandler):
    """Keep Bearer credentials on the explicitly configured HTTPS origin."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # type: ignore[no-untyped-def]
        return None


def _post_offer(url: str, offer: str, key: str) -> str:
    request = urllib.request.Request(
        url,
        offer.encode(),
        {"Authorization": f"Bearer {key}", "Content-Type": "application/sdp"},
        method="POST",
    )
    opener = urllib.request.build_opener(_RefuseRedirects())
    with opener.open(request, timeout=30) as response:
        return response.read(200_001).decode()


@dataclass(slots=True)
class LiveSession:
    id: str
    owner_fence: tuple[str, str, str, str]
    generation: str
    billing_lane: str
    thread_id: str | None
    app: CodexAppServer | None
    results: set[str] = field(default_factory=set)


class CodexLiveRegistry:
    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._sessions: dict[str, LiveSession] = {}
        self.app_factory = CodexAppServer

    @staticmethod
    def fence(request: dict[str, Any]) -> tuple[str, str, str, str]:
        owner = request.get("owner")
        if not isinstance(owner, dict):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        keys = ("connectionId", "profile", "runtimeSessionId", "storedSessionId")
        result = tuple(owner.get(key) for key in keys)
        if any(not isinstance(value, str) or not 0 < len(value) <= 128 for value in result):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        return result  # type: ignore[return-value]

    @staticmethod
    def _compatibility(error: CodexRpcError) -> str:
        message=f"{error.code} {error.message}".lower()
        if "clientmanagedhandoff" in message or ("handoff" in message and ("unknown" in message or "unsupported" in message)):
            return "handoff"
        if "delegationackfiller" in message and ("unknown" in message or "optional" in message or "invalid" in message):
            return "ack_filler"
        if "thread" in message and ("stale" in message or "missing" in message or "not found" in message):
            return "stale_thread"
        if "already" in message and "active" in message:
            return "already_active"
        return "other"

    def _start_subscription_realtime(self, app: CodexAppServer, owner: tuple[str,str,str,str], offer: str, voice: str, language: str, capabilities: str) -> tuple[str,str]:
        def new_thread() -> str:
            thread=app.request("thread/start",{"cwd":str(hermes_home()),"modelProvider":"openai"},30)
            thread_id=((thread or {}).get("thread") or {}).get("id")
            if not isinstance(thread_id,str) or not thread_id: raise RuntimeError("Codex thread was not created.")
            return thread_id
        thread_id=new_thread();identity=profile_identity(hermes_home(),owner[1],language)
        instructions="Stay in the profile identity supplied in the prompt. Keep ordinary conversation in ephemeral live context. This Live Voice session is permanently bound to the Hermes chat where it started. When a request needs an available tool or skill, use the client-managed Hermes execution handoff with the complete task and relevant recent conversation. The handoff continues that exact Hermes chat without touching the Composer or creating another chat. After creating a handoff, route every user correction, follow-up, stop, skip, cancel, or change of direction through another client-managed handoff; never merely acknowledge a task-control request in speech. Preserve the user's exact control words at the start of that handoff. Never claim execution before Hermes returns its result.\n\n"+capabilities
        params={"threadId":thread_id,"transport":{"type":"webrtc","sdp":offer},"outputModality":"audio","version":"v3","voice":voice,"prompt":identity["persona"][:4000],"realtimeStartInstructions":instructions,"clientManagedHandoffs":True,"delegationAckFiller":True}
        stale_retried=active_retried=ack_retried=False
        while True:
            try:
                cursor=app.notification_cursor();app.request("thread/realtime/start",params,25);break
            except CodexRpcError as error:
                mode=self._compatibility(error)
                if mode=="handoff": raise RuntimeError("Codex is incompatible: client-managed handoff cannot be enforced.") from None
                if mode=="ack_filler" and not ack_retried: params.pop("delegationAckFiller",None);ack_retried=True;continue
                if mode=="stale_thread" and not stale_retried: thread_id=new_thread();params["threadId"]=thread_id;stale_retried=True;continue
                if mode=="already_active" and not active_retried:
                    try: app.request("thread/realtime/stop",{"threadId":thread_id},10)
                    except (CodexRpcError,TimeoutError): pass
                    active_retried=True;continue
                raise RuntimeError("Codex realtime negotiation failed.") from None
        answer=None
        for _ in range(2):
            cursor,notification=app.wait_notification(cursor,{"thread/realtime/sdp","thread/realtime/error"},45)
            if notification["method"]=="thread/realtime/error": raise RuntimeError("Codex realtime negotiation failed.")
            candidate=(notification.get("params") or {}).get("sdp")
            if isinstance(candidate,str) and candidate: answer=candidate;break
        if not answer: raise RuntimeError("Codex realtime answer was absent.")
        return thread_id,answer

    def offer(self, request: dict[str, Any]) -> dict[str, Any]:
        owner = self.fence(request)
        offer = request.get("offer")
        generation = request.get("generation")
        billing = request.get("billingLane")
        engine = request.get("engine")
        provider = request.get("provider")
        voice = request.get("voice")
        language = request.get("language")
        if not isinstance(offer, str) or not 0 < len(offer) <= 200_000 or not isinstance(generation, str) or not 0 < len(generation) <= 128 or language not in ("en", "es") or not isinstance(voice, str) or not 0 < len(voice) <= 64:
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        validate_voice_selection(
            "enchanted-realtime",
            str(provider or ""),
            str(billing or ""),
            str(engine or ""),
            voice,
        )
        app = None
        thread_id = None
        if billing == "subscription" and engine == "gpt-live-1-codex":
            app = self.app_factory()
            try:
                app.start()
                capabilities=capability_context(request.get("owner"))
                thread_id,answer=self._start_subscription_realtime(app,owner,offer,voice,language,capabilities)
            except BaseException:
                app.close()
                raise
        elif billing == "api" and engine.startswith("gpt-realtime"):
            key = read_runtime_env("COMPOSER_OPENAI_API_KEY").strip() or read_runtime_env("OPENAI_API_KEY").strip()
            endpoint = read_runtime_env("COMPOSER_REALTIME_OFFER_URL").strip()
            parsed = urllib.parse.urlparse(endpoint)
            if (
                not key
                or len(endpoint) > 2048
                or parsed.scheme != "https"
                or not parsed.netloc
                or parsed.username is not None
                or parsed.password is not None
                or parsed.fragment
            ):
                raise ContractError(PublicErrorCode.BACKEND_NOT_READY)
            url = endpoint + ("&" if "?" in endpoint else "?") + urllib.parse.urlencode({"model": engine})
            answer = _post_offer(url, offer, key)
            if not answer or len(answer) > 200_000:
                raise RuntimeError("API realtime answer was invalid.")
        else:
            raise ContractError(PublicErrorCode.ENGINE_NOT_AVAILABLE)
        session = LiveSession(secrets.token_urlsafe(18), owner, generation, billing, thread_id, app)
        with self._lock:
            self._sessions[session.id] = session
        return {"ok": True, "sessionId": session.id, "answer": answer, "resultCapture": request.get("resultCapture") if request.get("resultCapture") in ("streaming", "final-poll") else "final-poll", "handoff": "client", "healthCheck": True}

    def _get(self, request: dict[str, Any]) -> LiveSession:
        owner = self.fence(request)
        session = self._sessions.get(request.get("sessionId"))
        if not session or session.owner_fence != owner or session.generation != request.get("generation"):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        return session

    def health(self, request: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            session = self._get(request)
            alive = session.app is None or (session.app.process is not None and session.app.process.poll() is None)
        return {"ok": True, "alive": alive}

    def command(self, request: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            session = self._get(request)
            command = request.get("command")
            if command == "interrupt" and session.app and session.thread_id:
                turn = request.get("turnId")
                if not isinstance(turn, str) or not turn:
                    raise ContractError(PublicErrorCode.INVALID_CONTRACT)
                session.app.request("turn/interrupt", {"threadId": session.thread_id, "turnId": turn}, 8)
            elif command != "mute":
                raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        return {"ok": True}

    def result(self, request: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            session = self._get(request)
            correlation = request.get("correlationId")
            text = request.get("text")
            if not isinstance(correlation, str) or not 0 < len(correlation) <= 128 or not isinstance(text, str) or len(text) > 8000:
                raise ContractError(PublicErrorCode.INVALID_CONTRACT)
            if correlation in session.results:
                return {"ok": True, "duplicate": True}
            # The voice protocol carries this response over the browser data channel.
            # This route only fences and records the correlated receipt.
            session.results.add(correlation)
            return {"ok": True}

    def close(self, request: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            session = self._get(request)
            self._sessions.pop(session.id)
        if session.app:
            try:
                if session.thread_id:
                    session.app.request("thread/realtime/stop", {"threadId": session.thread_id}, 10)
            finally:
                session.app.close()
        return {"ok": True}


REGISTRY = CodexLiveRegistry()
