from __future__ import annotations

import asyncio
import json
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def test_manifest_and_generated_runtime_are_current() -> None:
    manifest=(ROOT/'plugin.yaml').read_text(encoding='utf-8')
    assert 'name: composer-enhancements' in manifest and 'kind: backend' in manifest
    result=subprocess.run([sys.executable,'scripts/build_desktop.py','--check'],cwd=ROOT,text=True,capture_output=True,check=False)
    assert result.returncode==0,result.stderr

def test_release_zip_is_deterministic_and_clean_profile_shaped(tmp_path:Path) -> None:
    first,second=tmp_path/'one.zip',tmp_path/'two.zip'
    for output in (first,second):
        result=subprocess.run([sys.executable,'scripts/package.py','--output',str(output)],cwd=ROOT,text=True,capture_output=True,check=False)
        assert result.returncode==0,result.stderr
    assert first.read_bytes()==second.read_bytes()
    with zipfile.ZipFile(first) as archive:
        assert archive.testzip() is None
        names=archive.namelist()
        assert names==sorted(names)
        assert all(name.startswith('composer-enhancements/') for name in names)
        assert all(info.date_time==(1980,1,1,0,0,0) for info in archive.infolist())
        assert 'composer-enhancements/desktop/plugin.js' in names
        assert 'composer-enhancements/dashboard/composer_enhancements/bridge_proof.py' in names
        assert 'composer-enhancements/dashboard/composer_enhancements/voice_options.py' in names
        assert 'composer-enhancements/dashboard/composer_enhancements/enhancement.py' in names
        assert 'composer-enhancements/dashboard/dist/index.js' in names
        assert 'composer-enhancements/dashboard/dist/style.css' in names
        assert 'composer-enhancements/docs/installation.md' in names
        forbidden=('talk-desktop/ui','prompt-enhance/desktop/plugin.js','dashboard/assets','floating-panel')
        assert not any(any(token in name.lower() for token in forbidden) for name in names)

def test_backend_health_and_routes_are_secret_free() -> None:
    from dashboard.composer_enhancements.router import router as v1_router
    from dashboard.plugin_api import capabilities, health, router
    class ScopedRequest:
        async def json(self): return {'owner':{'connectionId':'test','profile':'default','runtimeSessionId':'r','storedSessionId':'s'}}
    assert asyncio.run(health())=={'ok':True,'plugin':'composer-enhancements','contractVersion':'1'}
    payload=asyncio.run(capabilities(ScopedRequest()))
    assert payload['ok'] and {item['backend'] for item in payload['backends']}=={'enchanted-realtime','enchanted-bridge'}
    serialized=json.dumps(payload).lower()
    assert not any(value in serialized for value in ('access_token','authorization','rawprovider','sdp'))
    paths={route.path for route in (*router.routes,*v1_router.routes) if hasattr(route,'path')}
    assert {'/health','/capabilities','/v1/settings','/v1/voice/options','/v1/enhance/options','/v1/enhance','/v1/talk/start','/v1/live/preflight','/v1/usage'}<=paths

def test_backend_api_imports_through_hermes_standalone_loader() -> None:
    import importlib.util

    module_name='hermes_dashboard_plugin_composer_enhancements_runtime_test'
    spec=importlib.util.spec_from_file_location(module_name,ROOT/'dashboard'/'plugin_api.py')
    assert spec and spec.loader
    module=importlib.util.module_from_spec(spec)
    sys.modules[module_name]=module
    try:
        spec.loader.exec_module(module)
        paths={route.path for route in (*module.router.routes,*module.v1_router.routes) if hasattr(route,'path')}
        assert {'/health','/v1/voice/options'}<=paths
    finally:
        sys.modules.pop(module_name,None)

def test_desktop_static_verifier() -> None:
    result=subprocess.run(['node','scripts/verify_desktop.mjs','desktop/plugin.js'],cwd=ROOT,text=True,capture_output=True,check=False)
    assert result.returncode==0,result.stderr
