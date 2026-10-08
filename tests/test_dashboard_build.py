from __future__ import annotations

import asyncio
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_dashboard_surface_is_visible_built_and_user_facing() -> None:
    result = subprocess.run(
        [sys.executable, "scripts/build_dashboard.py", "--check"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr or result.stdout

    manifest = json.loads((ROOT / "dashboard" / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["tab"] == {"path": "/enchanted-composer", "position": "end"}
    assert manifest["entry"] == "dist/index.js"
    assert manifest["css"] == "dist/style.css"
    assert manifest["icon"] == "Sparkles"

    runtime = (ROOT / "dashboard" / "dist" / "index.js").read_text(encoding="utf-8")
    assert 'registry.register("composer-enhancements", ComposerDashboard)' in runtime
    assert "Plugin-owned controls for the focused chat" not in runtime
    assert "/v1/voice/options" in runtime
    assert 'method: "POST"' in runtime


def test_voice_options_route_is_mounted_for_post() -> None:
    from fastapi import FastAPI

    from dashboard.plugin_api import router

    app = FastAPI()
    app.include_router(router, prefix="/api/plugins/composer-enhancements")
    payload = json.dumps(
        {
            "owner": {
                "connectionId": "test",
                "profile": "default",
                "runtimeSessionId": "runtime",
                "storedSessionId": "stored",
            }
        }
    ).encode()
    sent: list[dict[str, object]] = []
    delivered = False

    async def receive() -> dict[str, object]:
        nonlocal delivered
        if delivered:
            return {"type": "http.disconnect"}
        delivered = True
        return {"type": "http.request", "body": payload, "more_body": False}

    async def send(message: dict[str, object]) -> None:
        sent.append(message)

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "POST",
        "scheme": "http",
        "path": "/api/plugins/composer-enhancements/v1/voice/options",
        "raw_path": b"/api/plugins/composer-enhancements/v1/voice/options",
        "query_string": b"",
        "headers": [(b"content-type", b"application/json")],
        "client": ("test", 1),
        "server": ("test", 80),
    }
    asyncio.run(app(scope, receive, send))
    start = next(message for message in sent if message["type"] == "http.response.start")
    body = b"".join(
        message.get("body", b"")
        for message in sent
        if message["type"] == "http.response.body"
    )
    assert start["status"] == 200, body.decode()
    assert json.loads(body)["ok"] is True
