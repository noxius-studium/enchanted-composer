from __future__ import annotations

import json
from pathlib import Path

import pytest

from dashboard.composer_enhancements.codex_live import CodexLiveRegistry, LiveSession
from dashboard.composer_enhancements.errors import ContractError
from dashboard.composer_enhancements.settings import Settings, load, save


def test_settings_save_is_atomic_and_preserves_previous_on_replace_failure(tmp_path: Path, monkeypatch):
    from dashboard.composer_enhancements import settings

    path = tmp_path / 'settings.json'
    save(path, Settings())
    original = path.read_bytes()
    monkeypatch.setattr(settings.os, 'replace', lambda *_: (_ for _ in ()).throw(OSError('disk unavailable')))
    with pytest.raises(OSError):
        save(path, Settings(input_device_id='usb'))
    assert path.read_bytes() == original
    assert not list(tmp_path.glob('.settings-*.tmp'))


def test_settings_roundtrip_and_non_string_rejection(tmp_path: Path):
    path = tmp_path / 'settings.json'
    value = Settings(input_device_id='usb', output_device_id='speakers')
    save(path, value)
    assert load(path) == value
    payload = json.loads(path.read_text())
    payload['input_device_id'] = None
    with pytest.raises(ContractError):
        Settings.from_dict(payload)


def test_voice_process_health_is_owner_fenced_and_secret_free():
    class Process:
        def poll(self):
            return 1

    class App:
        process = Process()

    registry = CodexLiveRegistry()
    owner = {'connectionId': 'local', 'profile': 'default', 'runtimeSessionId': 'r', 'storedSessionId': 's'}
    registry._sessions['voice'] = LiveSession('voice', registry.fence({'owner': owner}), 'g', 'subscription', 't', App())
    body = {'owner': owner, 'sessionId': 'voice', 'generation': 'g'}
    assert registry.health(body) == {'ok': True, 'alive': False}
    with pytest.raises(ContractError):
        registry.health({**body, 'owner': {**owner, 'profile': 'other'}})
