from __future__ import annotations

from pathlib import Path

from dashboard.composer_enhancements.paths import owner_state_dir
from dashboard.composer_enhancements.usage import record, summary

OWNER_A = {"connectionId": "connection-a", "profile": "same", "runtimeSessionId": "runtime-a", "storedSessionId": "stored-a"}
OWNER_B = {"connectionId": "connection-b", "profile": "same", "runtimeSessionId": "runtime-b", "storedSessionId": "stored-b"}


def test_voice_usage_uses_hashed_connection_and_profile_scope(monkeypatch, tmp_path: Path) -> None:
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    path_a = owner_state_dir(OWNER_A) / "usage.json"
    path_b = owner_state_dir(OWNER_B) / "usage.json"
    assert path_a != path_b
    assert "same" not in str(path_a)
    assert path_a.is_relative_to(tmp_path / "plugin-data" / "enchanted-composer")
    assert record(path_a, 120_000, 60_000) == {"ok": True}
    assert summary(path_a)["today"]["sessions"] == 1
    assert summary(path_b)["today"]["sessions"] == 0
