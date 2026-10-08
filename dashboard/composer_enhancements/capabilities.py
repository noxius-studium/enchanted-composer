"""Normalized backend capability snapshots with independent readiness axes."""
from __future__ import annotations

import os
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Final

from .bridge_adapter import preflight
from .codex_binary import discover_codex_binary
from .contracts import BackendId
from .credential_relay import billing_receipt
from .errors import ContractError, PublicErrorCode
from .settings import Settings


@dataclass(frozen=True, slots=True)
class FeatureFlags:
    composer_bridge: bool = False
    def __post_init__(self) -> None:
        if type(self.composer_bridge) is not bool: raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    @classmethod
    def from_dict(cls, value: object) -> FeatureFlags:
        if not isinstance(value, Mapping) or set(value) != {"composerBridge"}: raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        return cls(composer_bridge=value["composerBridge"])
    def to_dict(self) -> dict[str, bool]: return {"composerBridge": self.composer_bridge}

@dataclass(frozen=True, slots=True)
class BackendCapabilities:
    backend: BackendId
    installed: bool
    compatible: bool
    supported: bool
    ready: bool
    feature_flags: FeatureFlags
    def __post_init__(self) -> None:
        if not isinstance(self.backend, BackendId) or not isinstance(self.feature_flags, FeatureFlags) or any(type(value) is not bool for value in (self.installed, self.compatible, self.supported, self.ready)) or (self.ready and not (self.installed and self.compatible and self.supported)):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    @classmethod
    def from_dict(cls, value: object) -> BackendCapabilities:
        required={"backend","installed","compatible","supported","ready","featureFlags"}
        if not isinstance(value, Mapping) or set(value) != required: raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        return cls(BackendId.parse(value["backend"]), value["installed"], value["compatible"], value["supported"], value["ready"], FeatureFlags.from_dict(value["featureFlags"]))
    def to_dict(self) -> dict[str, object]:
        return {"backend":self.backend.value,"installed":self.installed,"compatible":self.compatible,"supported":self.supported,"ready":self.ready,"featureFlags":self.feature_flags.to_dict()}

_UNIMPLEMENTED_FLAGS: Final = FeatureFlags(composer_bridge=False)

def known_backend_capabilities(settings: Settings | None = None, bridge_capabilities: object = None) -> tuple[BackendCapabilities, ...]:
    """Discover status without inferring provider/billing or exposing secret state."""
    selected = settings or Settings()
    receipt = billing_receipt(selected.billing_lane)
    talk_installed = bool(discover_codex_binary()) if selected.billing_lane == "subscription" else True
    configured_api = bool(os.environ.get("COMPOSER_REALTIME_OFFER_URL", "").startswith("https://"))
    talk_ready = talk_installed and receipt.ready and (selected.billing_lane == "subscription" or (selected.billing_lane == "api" and configured_api))
    talk = BackendCapabilities(BackendId.ENCHANTED_REALTIME, talk_installed, selected.billing_lane in {"subscription", "api"}, True, talk_ready, _UNIMPLEMENTED_FLAGS)
    live = preflight(selected.bridge_endpoint, bridge_capabilities, selected.provider)
    live_cap = BackendCapabilities(BackendId.ENCHANTED_BRIDGE, bool(live["installed"]), bool(live["compatible"]), bool(live["supported"]), bool(live["ready"]), FeatureFlags(composer_bridge=bool(live["featureFlags"]["composerBridge"])))
    return (talk, live_cap)
