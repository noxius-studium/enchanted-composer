from __future__ import annotations

import json
from pathlib import Path

import pytest

from dashboard.composer_enhancements import voice_options as options
from dashboard.composer_enhancements.credential_relay import CredentialReceipt
from dashboard.composer_enhancements.errors import ContractError, PublicErrorCode
from dashboard.composer_enhancements.settings import Settings, load

OWNER = {
    "connectionId": "local",
    "profile": "default",
    "runtimeSessionId": "runtime",
    "storedSessionId": "stored",
}


def test_voice_catalog_checks_each_provider_and_keeps_lanes_separate(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(options, "discover_codex_binary", lambda: Path("codex.exe"))
    monkeypatch.setattr(
        options,
        "billing_receipt",
        lambda lane, owner=None: CredentialReceipt(
            lane,
            lane == "subscription",
            "Codex login" if lane == "subscription" else "API key required",
        ),
    )
    monkeypatch.delenv("COMPOSER_REALTIME_OFFER_URL", raising=False)

    payload = options.voice_options(OWNER)
    talk = next(item for item in payload["backends"] if item["backend"] == "enchanted-realtime")
    providers = {item["id"]: item for item in talk["providers"]}

    assert providers["codex"]["ready"] is True
    assert providers["codex"]["billingLane"] == "subscription"
    assert providers["codex"]["models"] == ["gpt-live-1-codex"]
    assert providers["codex"]["defaultVoice"] == "cove"
    assert "cedar" not in providers["codex"]["voices"]
    assert providers["openai"]["ready"] is False
    assert providers["openai"]["billingLane"] == "api"
    assert "cedar" in providers["openai"]["voices"]
    serialized = json.dumps(payload).lower()
    assert not any(name in serialized for name in ("access_token", "api_key", "authorization"))


def test_api_provider_requires_auth_and_offer_endpoint(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(options, "discover_codex_binary", lambda: None)
    monkeypatch.setattr(
        options,
        "billing_receipt",
        lambda lane, owner=None: CredentialReceipt(lane, lane == "api", "configured"),
    )
    monkeypatch.setenv("COMPOSER_REALTIME_OFFER_URL", "https://api.example/v1/realtime/calls")

    payload = options.voice_options(OWNER)
    providers = {
        item["id"]: item
        for item in payload["backends"][0]["providers"]
    }
    assert providers["codex"]["ready"] is False
    assert providers["openai"]["ready"] is True


def test_invalid_codex_voice_is_rejected_and_legacy_default_migrates(tmp_path: Path) -> None:
    with pytest.raises(ContractError) as error:
        Settings(voice="cedar")
    assert error.value.code is PublicErrorCode.ENGINE_NOT_AVAILABLE

    legacy = Settings().public_dict()
    legacy.pop("engine")
    legacy["voice"] = "cedar"
    path = tmp_path / "settings.json"
    path.write_text(json.dumps(legacy), encoding="utf-8")

    migrated = load(path)
    assert migrated.engine == "gpt-live-1-codex"
    assert migrated.voice == "cove"


def test_provider_model_voice_billing_combinations_are_exact() -> None:
    options.validate_voice_selection(
        "enchanted-realtime", "codex", "subscription", "gpt-live-1-codex", "cove"
    )
    options.validate_voice_selection(
        "enchanted-realtime", "openai", "api", "gpt-realtime-2.1", "cedar"
    )
    for invalid in (
        ("enchanted-realtime", "codex", "api", "gpt-live-1-codex", "cove"),
        ("enchanted-realtime", "codex", "subscription", "gpt-realtime-2.1", "cove"),
        ("enchanted-realtime", "codex", "subscription", "gpt-live-1-codex", "cedar"),
    ):
        with pytest.raises(ContractError):
            options.validate_voice_selection(*invalid)
