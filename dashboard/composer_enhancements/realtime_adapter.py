"""Primary Enchanted Realtime HTTP/session adapter with explicit billing and owner fences."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .credential_relay import billing_receipt
from .errors import ContractError, PublicErrorCode
from .identity import profile_identity
from .paths import hermes_home
from .voice_options import validate_voice_selection


@dataclass(frozen=True, slots=True)
class EnchantedRealtimeAdapter:
    """Builds secret-free start receipts; actual SDP negotiation stays server-side."""
    backend: str = "enchanted-realtime"

    def capabilities(self, billing_lane: str) -> dict[str, object]:
        auth = billing_receipt(billing_lane)
        compatible = billing_lane in {"subscription", "api"}
        return {"backend": self.backend, "installed": True, "compatible": compatible, "supported": compatible, "ready": compatible and auth.ready, "featureFlags": {"composerBridge": False}, "version": "0.21.0", "protocol": "composer-v1", "auth": auth.to_dict()}

    def start(self, request: dict[str, Any]) -> dict[str, object]:
        owner = request.get("owner")
        if not isinstance(owner, dict) or not all(isinstance(owner.get(key), str) and owner[key] for key in ("connectionId", "profile", "runtimeSessionId", "storedSessionId")):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        billing = str(request.get("billingLane") or "")
        engine = str(request.get("engine") or "")
        provider = str(request.get("provider") or "")
        voice = str(request.get("voice") or "")
        validate_voice_selection(self.backend, provider, billing, engine, voice)
        auth = billing_receipt(billing)
        if billing not in {"subscription", "api"} or not auth.ready:
            raise ContractError(PublicErrorCode.BACKEND_NOT_READY)
        language = "en" if request.get("language") == "en" else "es"
        identity = profile_identity(hermes_home(), owner["profile"], language)
        # SDP is consumed by the server's live layer and intentionally omitted from receipts.
        return {"ok": True, "backend": self.backend, "engine": engine, "billingLane": billing, "ownerFence": "|".join(owner[key] for key in ("connectionId", "profile", "runtimeSessionId", "storedSessionId")), "identity": identity, "transport": "webrtc", "resultCapture": str(request.get("resultCapture") or "final-poll")}

ADAPTER = EnchantedRealtimeAdapter()
