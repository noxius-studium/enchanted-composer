"""Validated non-secret settings and explicit migration/import workflow."""
from __future__ import annotations

import json
import os
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path

from .contracts import BackendId
from .errors import ContractError, PublicErrorCode
from .voice_options import normalize_legacy_settings, validate_voice_selection

SCHEMA_VERSION = 1
MAX_SETTINGS_BYTES = 32_768
_ALLOWED_BILLING = {"subscription", "api", "local"}
_ALLOWED_LANGUAGES = {"en", "es"}


@dataclass(frozen=True, slots=True)
class Settings:
    backend: BackendId = BackendId.ENCHANTED_REALTIME
    provider: str = "codex"
    billing_lane: str = "subscription"
    engine: str = "gpt-live-1-codex"
    voice: str = "cove"
    language: str = "en"
    input_device_id: str = "default"
    output_device_id: str = "default"
    bridge_endpoint: str = ""

    def __post_init__(self) -> None:
        if self.billing_lane not in _ALLOWED_BILLING or self.language not in _ALLOWED_LANGUAGES:
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        if not all(isinstance(value, str) and len(value) <= 256 for value in asdict(self).values() if not isinstance(value, BackendId)):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        validate_voice_selection(
            self.backend.value,
            self.provider,
            self.billing_lane,
            self.engine,
            self.voice,
        )

    def public_dict(self) -> dict[str, str]:
        result = asdict(self)
        result["backend"] = self.backend.value
        return result

    @classmethod
    def from_dict(cls, value: object, *, migrate_legacy: bool = False) -> Settings:
        if not isinstance(value, dict):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        expected = set(cls().public_dict())
        legacy = expected - {"engine"}
        if set(value) == legacy and migrate_legacy:
            value = normalize_legacy_settings(value)
        elif set(value) != expected:
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        if any(not isinstance(item, str) for item in value.values()):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        return cls(backend=BackendId.parse(value["backend"]), provider=str(value["provider"]), billing_lane=str(value["billing_lane"]), engine=str(value["engine"]), voice=str(value["voice"]), language=str(value["language"]), input_device_id=str(value["input_device_id"]), output_device_id=str(value["output_device_id"]), bridge_endpoint=str(value["bridge_endpoint"]))


def load(path: Path) -> Settings:
    try:
        return Settings.from_dict(json.loads(path.read_text(encoding="utf-8")), migrate_legacy=True)
    except (OSError, ValueError, ContractError):
        return Settings()


def save(path: Path, settings: Settings) -> Settings:
    payload = json.dumps(settings.public_dict(), sort_keys=True, separators=(",", ":"))
    if len(payload.encode()) > MAX_SETTINGS_BYTES:
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, prefix=".settings-", suffix=".tmp", delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(payload)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return settings


def import_settings(value: object, *, dry_run: bool) -> dict[str, object]:
    settings = Settings.from_dict(value)
    return {"ok": True, "dryRun": dry_run, "settings": settings.public_dict(), "migration": "Credentials and other plugin storage are never imported; disable hermes-live-voice and prompt-enhance after verifying Enchanted Composer."}
