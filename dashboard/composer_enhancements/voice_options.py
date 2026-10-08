"""Secret-free voice provider discovery and exact tuple validation.

The catalogs mirror the pinned Enchanted Realtime transport contracts. Availability is
resolved locally from backend-owned authentication and endpoint configuration;
credentials never cross this boundary.
"""
from __future__ import annotations

import os
from collections.abc import Mapping
from urllib.parse import urlparse

from .codex_binary import discover_codex_binary
from .credential_relay import billing_receipt
from .errors import ContractError, PublicErrorCode

CODEX_MODELS = ("gpt-live-1-codex",)
CODEX_VOICES = (
    "arbor",
    "breeze",
    "cove",
    "ember",
    "juniper",
    "maple",
    "sol",
    "spruce",
    "vale",
)
OPENAI_MODELS = ("gpt-realtime-2.1",)
OPENAI_VOICES = (
    "alloy",
    "ash",
    "ballad",
    "beacon",
    "bossa",
    "cedar",
    "cinder",
    "coral",
    "delta",
    "echo",
    "gleam",
    "marin",
    "meridian",
    "quartz",
    "ripple",
    "sage",
    "shimmer",
    "stone",
    "tempo",
    "verse",
    "vesper",
    "willow",
)

_TALK_CATALOG = {
    "codex": {
        "name": "Codex subscription",
        "billingLane": "subscription",
        "models": CODEX_MODELS,
        "voices": CODEX_VOICES,
        "defaultModel": CODEX_MODELS[0],
        "defaultVoice": "cove",
    },
    "openai": {
        "name": "OpenAI API",
        "billingLane": "api",
        "models": OPENAI_MODELS,
        "voices": OPENAI_VOICES,
        "defaultModel": OPENAI_MODELS[0],
        "defaultVoice": "marin",
    },
}
_BRIDGE_PROVIDERS = frozenset({"openai", "gemini", "huggingface"})


def _offer_endpoint_ready() -> bool:
    value = os.environ.get("COMPOSER_REALTIME_OFFER_URL", "").strip()
    try:
        parsed = urlparse(value)
    except ValueError:
        return False
    return bool(
        parsed.scheme == "https"
        and parsed.netloc
        and not parsed.username
        and not parsed.password
        and not parsed.fragment
    )


def _provider_receipt(provider: str, owner: object) -> tuple[bool, str]:
    if provider == "codex":
        auth = billing_receipt("subscription", owner)
        binary = bool(discover_codex_binary())
        if not auth.ready:
            return False, auth.detail
        if not binary:
            return False, "Codex executable required"
        return True, "Codex login and executable are ready"
    auth = billing_receipt("api")
    if not auth.ready:
        return False, auth.detail
    if not _offer_endpoint_ready():
        return False, "Realtime API offer endpoint required"
    return True, "API credential and offer endpoint are ready"


def voice_options(owner: object) -> dict[str, object]:
    """Return bounded selectable voice options without serializing credentials."""

    providers: list[dict[str, object]] = []
    for provider_id, descriptor in _TALK_CATALOG.items():
        ready, detail = _provider_receipt(provider_id, owner)
        providers.append(
            {
                "id": provider_id,
                "name": descriptor["name"],
                "billingLane": descriptor["billingLane"],
                "ready": ready,
                "detail": detail,
                "models": list(descriptor["models"]),
                "voices": list(descriptor["voices"]),
                "defaultModel": descriptor["defaultModel"],
                "defaultVoice": descriptor["defaultVoice"],
            }
        )
    return {
        "ok": True,
        "backends": [
            {"backend": "enchanted-realtime", "providers": providers},
            {
                "backend": "enchanted-bridge",
                "providers": [],
                "detail": "Configure and authenticate a compatible Composer bridge before checking its advertised providers.",
            },
        ],
    }


def validate_voice_selection(
    backend: str,
    provider: str,
    billing_lane: str,
    engine: str,
    voice: str,
) -> None:
    """Reject impossible static provider/billing/model/voice combinations."""

    if backend == "enchanted-realtime":
        descriptor = _TALK_CATALOG.get(provider)
        if (
            descriptor is None
            or billing_lane != descriptor["billingLane"]
            or engine not in descriptor["models"]
            or voice not in descriptor["voices"]
        ):
            raise ContractError(PublicErrorCode.ENGINE_NOT_AVAILABLE)
        return
    if backend == "enchanted-bridge":
        if (
            provider not in _BRIDGE_PROVIDERS
            or billing_lane != "local"
            or not engine
            or not voice
        ):
            raise ContractError(PublicErrorCode.ENGINE_NOT_AVAILABLE)
        return
    raise ContractError(PublicErrorCode.INVALID_CONTRACT)


def normalize_legacy_settings(value: Mapping[str, object]) -> dict[str, object]:
    """Upgrade the one shipped invalid Codex default while keeping changes visible to UI."""

    normalized = dict(value)
    normalized.setdefault("engine", "gpt-live-1-codex")
    if (
        normalized.get("backend") == "enchanted-realtime"
        and normalized.get("provider") == "codex"
        and normalized.get("billing_lane") == "subscription"
        and normalized.get("engine") == "gpt-live-1-codex"
        and normalized.get("voice") == "cedar"
    ):
        normalized["voice"] = "cove"
    return normalized


__all__ = [
    "CODEX_MODELS",
    "CODEX_VOICES",
    "OPENAI_MODELS",
    "OPENAI_VOICES",
    "normalize_legacy_settings",
    "validate_voice_selection",
    "voice_options",
]
