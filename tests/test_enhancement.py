from __future__ import annotations

import pytest

from dashboard.composer_enhancements.enhancement import enhance, options
from dashboard.composer_enhancements.errors import ContractError

OWNER = {"connectionId": "local", "profile": "default", "runtimeSessionId": "runtime", "storedSessionId": "stored"}


def test_options_are_route_bounded() -> None:
    value = options({"owner": OWNER, "provider": "openai-codex", "model": "gpt-5.6-sol-900k"})
    assert value == {
        "ok": True,
        "provider": "openai-codex",
        "model": "gpt-5.6-sol-900k",
        "levels": ["", "none", "low", "medium", "high", "xhigh", "max"],
    }


def test_enhancement_sends_exact_route_and_reasoning() -> None:
    captured: dict[str, object] = {}

    def caller(**kwargs):
        captured.update(kwargs)
        kwargs["route_info"].update(provider=kwargs["provider"], model=kwargs["model"])
        return {"answer": "Polished request"}

    result = enhance(
        {
            "owner": OWNER,
            "provider": "openai-codex",
            "model": "gpt-5.6-sol-900k",
            "reasoningEffort": "high",
            "instructions": "Rewrite precisely.",
            "input": "rough request",
        },
        caller=caller,
        extractor=lambda response: response["answer"],
    )
    assert result == {"ok": True, "text": "Polished request"}
    assert captured["provider"] == "openai-codex"
    assert captured["model"] == "gpt-5.6-sol-900k"
    assert captured["reasoning_config"] == {"enabled": True, "effort": "high"}
    assert captured["messages"] == [
        {"role": "system", "content": "Rewrite precisely."},
        {"role": "user", "content": "rough request"},
    ]


def test_enhancement_rejects_clamped_or_unknown_effort_before_call() -> None:
    called = False

    def caller(**_kwargs):
        nonlocal called
        called = True

    with pytest.raises(ContractError):
        enhance(
            {
                "owner": OWNER,
                "provider": "openai-codex",
                "model": "gpt-5.6-sol-900k",
                "reasoningEffort": "minimal",
                "instructions": "Rewrite precisely.",
                "input": "rough request",
            },
            caller=caller,
            extractor=lambda _response: "unused",
        )
    assert called is False


def test_enhancement_rejects_route_substitution() -> None:
    def caller(**kwargs):
        kwargs["route_info"].update(provider="other", model=kwargs["model"])
        return {"answer": "should not escape"}

    with pytest.raises(RuntimeError, match="route changed"):
        enhance(
            {
                "owner": OWNER,
                "provider": "openai-codex",
                "model": "gpt-5.6-sol-900k",
                "reasoningEffort": "medium",
                "instructions": "Rewrite precisely.",
                "input": "rough request",
            },
            caller=caller,
            extractor=lambda response: response["answer"],
        )
