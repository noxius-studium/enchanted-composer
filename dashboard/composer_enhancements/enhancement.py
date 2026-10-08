"""Exact, owner-scoped prompt enhancement with bounded public contracts."""
from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import Any, Final

from .contracts import OwnerBinding
from .errors import ContractError, PublicErrorCode

MAX_INPUT_CHARS: Final = 12_000
MAX_INSTRUCTION_CHARS: Final = 12_000
MAX_OUTPUT_CHARS: Final = 12_000
MAX_IDENTIFIER_CHARS: Final = 128


def _text(value: object, limit: int) -> str:
    if not isinstance(value, str):
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    result = value.strip()
    if not result or len(result) > limit:
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    return result


def _efforts(provider: str, model: str) -> tuple[str, ...]:
    try:
        from agent.reasoning_effort import route_supported_efforts
    except ModuleNotFoundError:  # Standalone package tests do not install Hermes.
        if provider == "openai-codex":
            bare = model.lower().rsplit("/", 1)[-1]
            if bare in {"gpt-6-astra", "gpt-6-astra-900k"}:
                return ("low", "medium", "high", "xhigh", "max")
            if "gpt-5.6" in bare or bare.startswith(("gpt-6-sol", "gpt-6-luna")):
                return ("none", "low", "medium", "high", "xhigh", "max")
            return ("none", "low", "medium", "high", "xhigh")
        return ("none", "minimal", "low", "medium", "high", "xhigh", "max")
    return tuple(str(value) for value in route_supported_efforts(provider, model))


def options(body: object) -> dict[str, object]:
    if not isinstance(body, Mapping):
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    OwnerBinding.from_dict(body.get("owner"))
    provider = _text(body.get("provider"), MAX_IDENTIFIER_CHARS)
    model = _text(body.get("model"), MAX_IDENTIFIER_CHARS)
    return {
        "ok": True,
        "provider": provider,
        "model": model,
        "levels": ["", *_efforts(provider, model)],
    }


def _reasoning_config(effort: str) -> dict[str, object] | None:
    if not effort:
        return None
    if effort == "none":
        return {"enabled": False}
    return {"enabled": True, "effort": effort}


def enhance(
    body: object,
    *,
    caller: Callable[..., Any] | None = None,
    extractor: Callable[[Any], str | None] | None = None,
) -> dict[str, object]:
    if not isinstance(body, Mapping):
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    OwnerBinding.from_dict(body.get("owner"))
    provider = _text(body.get("provider"), MAX_IDENTIFIER_CHARS)
    model = _text(body.get("model"), MAX_IDENTIFIER_CHARS)
    instructions = _text(body.get("instructions"), MAX_INSTRUCTION_CHARS)
    user_input = _text(body.get("input"), MAX_INPUT_CHARS)
    raw_effort = body.get("reasoningEffort", "")
    if not isinstance(raw_effort, str) or len(raw_effort) > 16:
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    effort = raw_effort.strip().lower()
    supported = _efforts(provider, model)
    if effort and effort not in supported:
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)

    if caller is None or extractor is None:
        from agent.auxiliary_client import call_llm, extract_content_or_reasoning

        caller = caller or call_llm
        extractor = extractor or extract_content_or_reasoning

    route_info: dict[str, str] = {}
    response = caller(
        task="title_generation",
        provider=provider,
        model=model,
        messages=[{"role": "system", "content": instructions}, {"role": "user", "content": user_input}],
        temperature=0.2,
        max_tokens=4096,
        timeout=60,
        reasoning_config=_reasoning_config(effort),
        route_info=route_info,
    )
    if route_info and (route_info.get("provider") != provider or route_info.get("model") != model):
        raise RuntimeError("Enhancement route changed unexpectedly.")
    text = (extractor(response) or "").strip()
    if not text:
        raise RuntimeError("Enhancement returned no text.")
    return {"ok": True, "text": text[:MAX_OUTPUT_CHARS]}
