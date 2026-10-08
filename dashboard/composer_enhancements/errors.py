"""Bounded public errors for normalized Enchanted Composer contracts."""

from __future__ import annotations

from enum import StrEnum
from typing import Final


class PublicErrorCode(StrEnum):
    """Stable, secret-free error categories exposed by contract validation."""

    INVALID_CONTRACT = "invalid_contract"
    INVALID_EVENT = "invalid_event"
    BACKEND_NOT_READY = "backend_not_ready"
    ENGINE_NOT_AVAILABLE = "engine_not_available"
    COMPOSER_BRIDGE_REQUIRED = "composer_bridge_required"
    ILLEGAL_SESSION_TRANSITION = "illegal_session_transition"


_PUBLIC_MESSAGES: Final[dict[PublicErrorCode, str]] = {
    PublicErrorCode.INVALID_CONTRACT: "The supplied public contract is invalid.",
    PublicErrorCode.INVALID_EVENT: "The supplied voice event is invalid.",
    PublicErrorCode.BACKEND_NOT_READY: "The selected backend is not ready.",
    PublicErrorCode.ENGINE_NOT_AVAILABLE: "The selected engine is not available.",
    PublicErrorCode.COMPOSER_BRIDGE_REQUIRED: "The selected backend requires composerBridge.",
    PublicErrorCode.ILLEGAL_SESSION_TRANSITION: "The requested session transition is not allowed.",
}


class ContractError(ValueError):
    """A bounded error that never includes provider or caller supplied values."""

    def __init__(self, code: PublicErrorCode) -> None:
        self.code = code
        self.message = _PUBLIC_MESSAGES[code]
        super().__init__(self.message)

    def to_dict(self) -> dict[str, str]:
        """Return the complete safe error shape for a public boundary."""
        return {"code": self.code.value, "message": self.message}
