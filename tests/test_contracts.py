from __future__ import annotations

from pathlib import Path

import pytest

from dashboard.composer_enhancements.bridge_adapter import preflight
from dashboard.composer_enhancements.capabilities import BackendCapabilities, FeatureFlags
from dashboard.composer_enhancements.contracts import (
    BackendId,
    EngineDescriptor,
    EngineRequest,
    OwnerBinding,
    SessionState,
    VoiceEvent,
    VoiceSession,
    redact_secrets,
)
from dashboard.composer_enhancements.engine_resolver import resolve_engine
from dashboard.composer_enhancements.errors import ContractError, PublicErrorCode
from dashboard.composer_enhancements.identity import profile_identity
from dashboard.composer_enhancements.realtime_adapter import ADAPTER
from dashboard.composer_enhancements.settings import Settings, import_settings, load, save
from dashboard.composer_enhancements.usage import record, summary


def owner() -> OwnerBinding: return OwnerBinding('connection-a','default','runtime-a','stored-a')
def test_contracts_are_immutable_and_proto_safe() -> None:
    event=VoiceEvent.from_dict({'type':'transcript','sessionId':'s','payload':{'__proto__':{'safe':True},'text':'hello'}})
    assert event.to_dict()['payload']['__proto__']=={'safe':True}
    assert redact_secrets({'nested':{'accessToken':'value'}})=={'nested':{'accessToken':'[REDACTED]'}}
    session=VoiceSession(BackendId.ENCHANTED_REALTIME,'gpt-live-1-codex',owner())
    assert session.transition(SessionState.STARTING).transition(SessionState.ACTIVE).state is SessionState.ACTIVE
    with pytest.raises(ContractError): session.transition(SessionState.ACTIVE)

def test_exact_engine_resolution_never_falls_back() -> None:
    capability=BackendCapabilities(BackendId.ENCHANTED_REALTIME,True,True,True,True,FeatureFlags())
    engine=EngineDescriptor(BackendId.ENCHANTED_REALTIME,'codex','subscription')
    assert resolve_engine(EngineRequest(BackendId.ENCHANTED_REALTIME,'codex','subscription'),[capability],[engine])==engine
    with pytest.raises(ContractError) as error: resolve_engine(EngineRequest(BackendId.ENCHANTED_REALTIME,'codex','api'),[capability],[engine])
    assert error.value.code is PublicErrorCode.ENGINE_NOT_AVAILABLE

def test_settings_are_versioned_nonsecret_and_migration_is_dry_run(tmp_path:Path) -> None:
    settings=Settings(backend=BackendId.ENCHANTED_BRIDGE,provider='openai',billing_lane='local',voice='alloy',language='en',bridge_endpoint='https://bridge.example')
    path=tmp_path/'settings.json';save(path,settings)
    assert load(path)==settings
    receipt=import_settings(settings.public_dict(),dry_run=True)
    assert receipt['dryRun'] is True and 'Credentials' in receipt['migration']
    with pytest.raises(ContractError): import_settings({'token':'never'},dry_run=True)

def test_usage_is_bounded_and_local(tmp_path:Path) -> None:
    path=tmp_path/'usage.json'
    assert record(path,1000,800)['ok'] is True
    assert summary(path)['rolling24h']['sessions']==1
    assert record(path,0,0)['ok'] is False

def test_live_bridge_requires_advertised_composer_contract() -> None:
    stock=preflight('https://bridge.example',{'protocol':'v6'},'openai')
    assert stock['ready'] is False and stock['unavailableReason']['code']=='bridge_not_configured'
    insecure=preflight('ws://bridge.example',{'protocol':'composer-bridge-v1'},'openai')
    assert insecure['ready'] is False
    bridge=preflight('wss://bridge.example',{'composerBridge':True,'providers':['openai'],'protocol':'composer-bridge-v1','taskAuthority':'composer','authMode':'composer-bound-token-v1'},'openai')
    assert bridge['ready'] is True and bridge['featureFlags']['composerBridge'] is True

def test_talk_adapter_rejects_unknown_billing_and_does_not_create_work() -> None:
    with pytest.raises(ContractError): ADAPTER.start({'owner':owner().to_dict(),'billingLane':'local'})
    source=Path(ADAPTER.__class__.__module__.replace('.','/')+'.py')
    assert not source.exists() or 'prompt.submit' not in source.read_text(encoding='utf-8')


def test_profile_identity_loads_default_and_named_souls_without_crossing_profile_boundaries(tmp_path: Path) -> None:
    (tmp_path/'SOUL.md').write_text('# Zero Two\nDefault soul.',encoding='utf-8')
    named=tmp_path/'profiles'/'john';named.mkdir(parents=True)
    (named/'SOUL.md').write_text('# John\nEngineer soul.',encoding='utf-8')
    assert profile_identity(tmp_path,'default','en')['persona']=='# Zero Two\nDefault soul.'
    assert profile_identity(tmp_path,'john','en')['persona']=='# John\nEngineer soul.'
    assert profile_identity(tmp_path,'../john','en')['persona']==''
