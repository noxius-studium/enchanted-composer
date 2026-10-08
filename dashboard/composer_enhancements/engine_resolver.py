"""Exact backend/engine/billing selection with no fallback behavior."""

from __future__ import annotations

from collections.abc import Iterable

from .capabilities import BackendCapabilities
from .contracts import BackendId, EngineDescriptor, EngineRequest
from .errors import ContractError, PublicErrorCode


def resolve_engine(
    request: EngineRequest,
    capabilities: Iterable[BackendCapabilities],
    engines: Iterable[EngineDescriptor],
) -> EngineDescriptor:
    """Resolve only the exact requested tuple or raise a bounded public error.

    This function deliberately never selects a nearby backend, alternate engine,
    or different billing lane. Callers must make a new explicit request instead.
    """
    if not isinstance(request, EngineRequest):
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)

    selected_capability: BackendCapabilities | None = None
    for capability in capabilities:
        if not isinstance(capability, BackendCapabilities):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        if capability.backend == request.backend:
            if selected_capability is not None:
                raise ContractError(PublicErrorCode.INVALID_CONTRACT)
            selected_capability = capability

    if selected_capability is None or not selected_capability.ready:
        raise ContractError(PublicErrorCode.BACKEND_NOT_READY)
    if request.backend is BackendId.ENCHANTED_BRIDGE and not selected_capability.feature_flags.composer_bridge:
        raise ContractError(PublicErrorCode.COMPOSER_BRIDGE_REQUIRED)

    for engine in engines:
        if not isinstance(engine, EngineDescriptor):
            raise ContractError(PublicErrorCode.INVALID_CONTRACT)
        if (
            engine.backend == request.backend
            and engine.engine == request.engine
            and engine.billing_lane == request.billing_lane
        ):
            return engine

    raise ContractError(PublicErrorCode.ENGINE_NOT_AVAILABLE)
