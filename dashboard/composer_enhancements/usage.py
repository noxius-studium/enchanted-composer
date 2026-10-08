"""Bounded owner-scoped local voice metering."""
from __future__ import annotations

import json
import time
from datetime import UTC, datetime
from pathlib import Path

MAX_SESSIONS = 2_000


def _load(path: Path) -> list[dict[str, int]]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, list) else []
    except (OSError, ValueError):
        return []


def record(path: Path, duration_ms: int, audio_ms: int) -> dict[str, object]:
    if not 0 < duration_ms <= 24 * 60 * 60 * 1000 or not 0 <= audio_ms <= duration_ms:
        return {"ok": False, "error": {"code": "invalid_usage", "message": "Invalid session duration."}}
    now = int(time.time() * 1000)
    items = [item for item in _load(path) if isinstance(item, dict) and int(item.get("t", 0)) > now - 8 * 86_400_000]
    items.append({"t": now, "durationMs": duration_ms, "audioMs": audio_ms})
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(items[-MAX_SESSIONS:], separators=(",", ":")), encoding="utf-8")
    return {"ok": True}


def summary(path: Path) -> dict[str, object]:
    now = int(time.time() * 1000)
    items = _load(path)

    def bucket(window: int, *, since: int | None = None) -> dict[str, float | int]:
        start = since if since is not None else now - window
        selected = [item for item in items if int(item.get("t", 0)) >= start]
        return {
            "minutes": round(sum(int(item.get("durationMs", 0)) for item in selected) / 60_000, 3),
            "audioMinutes": round(sum(int(item.get("audioMs", 0)) for item in selected) / 60_000, 3),
            "sessions": len(selected),
        }

    midnight = datetime.now(UTC).astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
    return {"ok": True, "today": bucket(0, since=int(midnight.timestamp() * 1000)), "rolling5h": bucket(18_000_000), "rolling24h": bucket(86_400_000), "week": bucket(604_800_000)}
