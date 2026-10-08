"""Bounded profile identity for voice instructions; no ambient owner selection."""
from __future__ import annotations

import re
from pathlib import Path

MAX_IDENTITY_CHARS = 4_000
_SAFE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


def _safe_profile_home(home: Path, profile: str) -> Path | None:
    if not _SAFE.fullmatch(profile):
        return None
    candidate = home if profile == "default" else home / "profiles" / profile
    return candidate if candidate.is_dir() else None


def profile_identity(home: Path, profile: str, language: str) -> dict[str, str]:
    """Return a bounded identity receipt without paths, credentials, or raw config."""
    root = _safe_profile_home(home, profile)
    if root is None:
        return {"displayName": profile[:64], "persona": "", "language": "en" if language == "en" else "es"}
    text = ""
    try:
        text = (root / "SOUL.md").read_text(encoding="utf-8", errors="replace")[:MAX_IDENTITY_CHARS]
    except OSError:
        pass
    title = next((line.lstrip("# ").strip() for line in text.splitlines() if line.strip()), profile)
    title = re.sub(r"[^\w .,'-]", "", title)[:64] or profile[:64]
    return {"displayName": title, "persona": text, "language": "en" if language == "en" else "es"}
