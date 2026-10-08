"""Profile-scoped plugin configuration and secret reads.

Hermes installs an active secret scope for every routed dashboard request.  Under
multiplexing, reading credentials directly from ``os.environ`` could select the
launch profile instead of the chat owner, so all declared plugin variables pass
through ``agent.secret_scope.get_secret``.  The environment fallback exists only
for standalone package tests where Hermes is not importable.
"""
from __future__ import annotations

import os


def read(name: str, default: str = "") -> str:
    try:
        from agent.secret_scope import UnscopedSecretError, get_secret
    except ImportError:  # Standalone package tests do not install Hermes.
        value = os.environ.get(name, default)
    else:
        try:
            value = get_secret(name, default)
        except UnscopedSecretError:
            # Fail closed rather than crossing profile boundaries.
            value = default
    return value if isinstance(value, str) else default
