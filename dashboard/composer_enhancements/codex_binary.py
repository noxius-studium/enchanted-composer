"""Codex binary discovery only; it neither starts nor logs an app server."""
from __future__ import annotations

import os
import shutil
from pathlib import Path


def discover_codex_binary() -> str | None:
    explicit = os.environ.get("COMPOSER_CODEX_BINARY", "").strip()
    candidates = [explicit, shutil.which("codex") or ""]
    candidates.extend(str(path) for path in (Path.home() / ".npm-global/bin/codex", Path.home() / ".local/bin/codex"))
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return candidate
    return None


def binary_receipt() -> dict[str, object]:
    binary = discover_codex_binary()
    return {"available": bool(binary), "source": "configured" if os.environ.get("COMPOSER_CODEX_BINARY") else "path"}
