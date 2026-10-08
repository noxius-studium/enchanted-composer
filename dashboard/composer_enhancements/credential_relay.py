"""Server-side readiness receipts without reading another client's credential store."""
from __future__ import annotations

import os
from dataclasses import dataclass

from .codex_binary import discover_codex_binary


@dataclass(frozen=True, slots=True)
class CredentialReceipt:
    lane: str
    ready: bool
    detail: str

    def to_dict(self) -> dict[str, object]:
        return {"lane": self.lane, "ready": self.ready, "detail": self.detail}


def billing_receipt(billing_lane: str, owner: object | None = None) -> CredentialReceipt:
    """Check only explicitly selected lanes; never inspect or mutate OAuth files."""
    del owner
    if billing_lane == "subscription":
        ready = discover_codex_binary() is not None
        detail = "Codex CLI detected; it verifies its own login when voice starts" if ready else "Codex CLI required"
        return CredentialReceipt("subscription", ready, detail)
    if billing_lane == "api":
        for name in ("COMPOSER_OPENAI_API_KEY", "OPENAI_API_KEY"):
            if name in os.environ:
                return CredentialReceipt("api", bool(os.environ[name].strip()), f"{name} configured" if os.environ[name].strip() else f"{name} is blank")
        return CredentialReceipt("api", False, "API key required")
    if billing_lane == "local":
        return CredentialReceipt("local", True, "Local bridge owns provider credentials")
    return CredentialReceipt(billing_lane, False, "Unknown billing lane")
