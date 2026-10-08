"""Immutable, secret-free normalized contracts shared by Composer backends."""

from __future__ import annotations

import math
import re
from collections.abc import Mapping
from dataclasses import dataclass, replace
from enum import StrEnum
from types import MappingProxyType
from typing import Final

from .errors import ContractError, PublicErrorCode

CONTRACT_VERSION: Final = "1"
MAX_IDENTIFIER_LENGTH: Final = 128
MAX_EVENT_STRING_LENGTH: Final = 512
MAX_PAYLOAD_DEPTH: Final = 4
MAX_PAYLOAD_ITEMS: Final = 32
_SECRET_KEY: Final = re.compile(
    r"(?:token|secret|credential|password|authorization|api[-_]?key|access[-_]?key|sdp|raw[-_]?provider)",
    re.IGNORECASE,
)


class BackendId(StrEnum):
    """The only normalized backend identities."""

    ENCHANTED_REALTIME = "enchanted-realtime"
    ENCHANTED_BRIDGE = "enchanted-bridge"

    @classmethod
    def parse(cls, value: object) -> BackendId:
        if isinstance(value, cls):
            return value
        if isinstance(value, str):
            try:
                return cls(value)
            except ValueError:
                pass
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)


class SessionState(StrEnum):
    """States permitted by the transport-independent voice session lifecycle."""

    CREATED = "created"
    STARTING = "starting"
    ACTIVE = "active"
    STOPPING = "stopping"
    STOPPED = "stopped"
    FAILED = "failed"


class VoiceEventType(StrEnum):
    """Events that can cross the normalized public event boundary."""

    SESSION_STARTED = "sessionStarted"
    TRANSCRIPT = "transcript"
    SESSION_STOPPED = "sessionStopped"
    ERROR = "error"


def _exact_mapping(value: object, keys: set[str], error: PublicErrorCode) -> Mapping[str, object]:
    if not isinstance(value, Mapping) or set(value) != keys or not all(isinstance(key, str) for key in value):
        raise ContractError(error)
    return value


def _bounded_string(value: object, limit: int, error: PublicErrorCode) -> str:
    if not isinstance(value, str) or not value or len(value) > limit:
        raise ContractError(error)
    return value


def _is_secret_key(value: str) -> bool:
    return bool(_SECRET_KEY.search(value))


def _freeze_public(value: object, *, depth: int = 0) -> object:
    if depth > MAX_PAYLOAD_DEPTH:
        raise ContractError(PublicErrorCode.INVALID_EVENT)
    if value is None or isinstance(value, (bool, int)):
        return value
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ContractError(PublicErrorCode.INVALID_EVENT)
        return value
    if isinstance(value, str):
        return _bounded_string(value, MAX_EVENT_STRING_LENGTH, PublicErrorCode.INVALID_EVENT)
    if isinstance(value, Mapping):
        if len(value) > MAX_PAYLOAD_ITEMS:
            raise ContractError(PublicErrorCode.INVALID_EVENT)
        frozen: dict[str, object] = {}
        for key, item in value.items():
            if not isinstance(key, str) or not key or len(key) > MAX_IDENTIFIER_LENGTH or _is_secret_key(key):
                raise ContractError(PublicErrorCode.INVALID_EVENT)
            frozen[key] = _freeze_public(item, depth=depth + 1)
        return MappingProxyType(frozen)
    if isinstance(value, (list, tuple)):
        if len(value) > MAX_PAYLOAD_ITEMS:
            raise ContractError(PublicErrorCode.INVALID_EVENT)
        return tuple(_freeze_public(item, depth=depth + 1) for item in value)
    raise ContractError(PublicErrorCode.INVALID_EVENT)


def _thaw_public(value: object) -> object:
    if isinstance(value, Mapping):
        return {key: _thaw_public(item) for key, item in value.items()}
    if isinstance(value, tuple):
        return [_thaw_public(item) for item in value]
    return value


def redact_secrets(value: object) -> object:
    """Return a detached diagnostic-safe value with secret-shaped values redacted."""
    if isinstance(value, Mapping):
        return {
            str(key): "[REDACTED]" if isinstance(key, str) and _is_secret_key(key) else redact_secrets(item)
            for key, item in value.items()
        }
    if isinstance(value, (list, tuple)):
        return [redact_secrets(item) for item in value]
    return value


@dataclass(frozen=True, slots=True)
class OwnerBinding:
    """Exact ownership binding required for every public voice session."""

    connection_id: str
    profile: str
    runtime_session_id: str
    stored_session_id: str

    def __post_init__(self) -> None:
        for value in (self.connection_id, self.profile, self.runtime_session_id, self.stored_session_id):
            _bounded_string(value, MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT)

    @classmethod
    def from_dict(cls, value: object) -> OwnerBinding:
        data = _exact_mapping(
            value,
            {"connectionId", "profile", "runtimeSessionId", "storedSessionId"},
            PublicErrorCode.INVALID_CONTRACT,
        )
        return cls(
            connection_id=_bounded_string(data["connectionId"], MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT),
            profile=_bounded_string(data["profile"], MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT),
            runtime_session_id=_bounded_string(
                data["runtimeSessionId"], MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT
            ),
            stored_session_id=_bounded_string(
                data["storedSessionId"], MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT
            ),
        )

    def to_dict(self) -> dict[str, str]:
        return {
            "connectionId": self.connection_id,
            "profile": self.profile,
            "runtimeSessionId": self.runtime_session_id,
            "storedSessionId": self.stored_session_id,
        }


@dataclass(frozen=True, slots=True)
class EngineRequest:
    """An explicit backend, engine, and billing lane selection."""

    backend: BackendId
    engine: str
    billing_lane: str

    def __post_init__(self) -> None:
        if not isinstance(self.backend, BackendId):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        _bounded_string(self.engine, MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT)
        _bounded_string(self.billing_lane, MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT)

    def to_dict(self) -> dict[str, str]:
        return {"backend": self.backend.value, "engine": self.engine, "billingLane": self.billing_lane}


@dataclass(frozen=True, slots=True)
class EngineDescriptor:
    """A normalized engine inventory entry with no provider configuration."""

    backend: BackendId
    engine: str
    billing_lane: str

    def __post_init__(self) -> None:
        EngineRequest(self.backend, self.engine, self.billing_lane)

    @classmethod
    def from_dict(cls, value: object) -> EngineDescriptor:
        data = _exact_mapping(value, {"backend", "engine", "billingLane"}, PublicErrorCode.INVALID_CONTRACT)
        return cls(
            backend=BackendId.parse(data["backend"]),
            engine=_bounded_string(data["engine"], MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT),
            billing_lane=_bounded_string(data["billingLane"], MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT),
        )

    def to_dict(self) -> dict[str, str]:
        return EngineRequest(self.backend, self.engine, self.billing_lane).to_dict()


_ALLOWED_TRANSITIONS: Final[dict[SessionState, frozenset[SessionState]]] = {
    SessionState.CREATED: frozenset({SessionState.STARTING, SessionState.FAILED}),
    SessionState.STARTING: frozenset({SessionState.ACTIVE, SessionState.STOPPING, SessionState.FAILED}),
    SessionState.ACTIVE: frozenset({SessionState.STOPPING, SessionState.FAILED}),
    SessionState.STOPPING: frozenset({SessionState.STOPPED, SessionState.FAILED}),
    SessionState.STOPPED: frozenset(),
    SessionState.FAILED: frozenset(),
}


@dataclass(frozen=True, slots=True)
class VoiceSession:
    """Immutable public voice session identity and legal lifecycle state."""

    backend: BackendId
    engine: str
    owner: OwnerBinding
    state: SessionState = SessionState.CREATED

    def __post_init__(self) -> None:
        if not isinstance(self.backend, BackendId) or not isinstance(self.owner, OwnerBinding):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        _bounded_string(self.engine, MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_CONTRACT)
        if not isinstance(self.state, SessionState):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)

    def transition(self, target: SessionState) -> VoiceSession:
        if not isinstance(target, SessionState) or target not in _ALLOWED_TRANSITIONS[self.state]:
            raise ContractError(PublicErrorCode.ILLEGAL_SESSION_TRANSITION)
        return replace(self, state=target)

    def to_dict(self) -> dict[str, object]:
        return {
            "backend": self.backend.value,
            "engine": self.engine,
            "owner": self.owner.to_dict(),
            "state": self.state.value,
        }


@dataclass(frozen=True, slots=True)
class VoiceEvent:
    """Validated event with bounded immutable payload and no provider fields."""

    event_type: VoiceEventType
    session_id: str
    payload: Mapping[str, object]

    def __post_init__(self) -> None:
        if not isinstance(self.event_type, VoiceEventType):
            raise ContractError(PublicErrorCode.INVALID_EVENT)
        _bounded_string(self.session_id, MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_EVENT)
        if not isinstance(self.payload, Mapping):
            raise ContractError(PublicErrorCode.INVALID_EVENT)
        frozen = _freeze_public(self.payload)
        if not isinstance(frozen, Mapping):
            raise ContractError(PublicErrorCode.INVALID_EVENT)
        object.__setattr__(self, "payload", frozen)

    @classmethod
    def from_dict(cls, value: object) -> VoiceEvent:
        data = _exact_mapping(value, {"type", "sessionId", "payload"}, PublicErrorCode.INVALID_EVENT)
        try:
            event_type = VoiceEventType(data["type"])
        except (TypeError, ValueError):
            raise ContractError(PublicErrorCode.INVALID_EVENT) from None
        return cls(
            event_type=event_type,
            session_id=_bounded_string(data["sessionId"], MAX_IDENTIFIER_LENGTH, PublicErrorCode.INVALID_EVENT),
            payload=data["payload"] if isinstance(data["payload"], Mapping) else _invalid_event_payload(),
        )

    def to_dict(self) -> dict[str, object]:
        return {"type": self.event_type.value, "sessionId": self.session_id, "payload": _thaw_public(self.payload)}


def _invalid_event_payload() -> Mapping[str, object]:
    raise ContractError(PublicErrorCode.INVALID_EVENT)
