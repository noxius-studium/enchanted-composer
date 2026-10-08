"""Versioned owner-scoped routes returning bounded public receipts."""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException, Request

from .bridge_adapter import preflight as live_preflight
from .bridge_proof import mint as mint_bridge_proof
from .codex_live import REGISTRY
from .credential_relay import billing_receipt
from .enhancement import enhance as enhance_prompt
from .enhancement import options as enhancement_options
from .errors import ContractError
from .hermes_runs import start as start_hermes_run
from .hermes_runs import status as hermes_run_status
from .hermes_runs import steer as steer_hermes_run
from .hermes_runs import stop as stop_hermes_run
from .paths import owner_state_dir
from .realtime_adapter import ADAPTER as talk
from .settings import import_settings, load, save
from .usage import record, summary
from .voice_options import voice_options as discover_voice_options

router=APIRouter()

def _public(operation,body: dict) -> dict[str,object]:
    try:return operation(body)
    except ContractError as error:raise HTTPException(status_code=400,detail=error.to_dict()) from None
    except TimeoutError:raise HTTPException(status_code=504,detail={"code":"provider_timeout","message":"Voice provider timed out."}) from None
    except (OSError,RuntimeError,ValueError):raise HTTPException(status_code=502,detail={"code":"provider_error","message":"Voice provider could not complete the request."}) from None

async def _body(request: Request) -> dict:
    try:value=await request.json()
    except (TypeError,ValueError):return {}
    return value if isinstance(value,dict) else {}

def _state(body: dict): return owner_state_dir(body.get("owner"))

@router.post("/v1/settings/read")
async def get_settings(request: Request) -> dict[str,object]:
    body=await _body(request);path=_state(body)/"settings.json";return {"ok":True,"exists":path.is_file(),"settings":load(path).public_dict()}

@router.put("/v1/settings")
async def put_settings(request: Request) -> dict[str,object]:
    value=await _body(request)
    try:
        path=_state(value)/"settings.json"
        settings=load(path).from_dict(value.get("settings",value))
        return {"ok":True,"settings":save(path,settings).public_dict()}
    except ContractError as error:
        raise HTTPException(status_code=400,detail=error.to_dict()) from None

@router.post("/v1/settings/import")
async def settings_import(request: Request) -> dict[str,object]:
    body=await _body(request);result=import_settings(body.get("settings"),dry_run=bool(body.get("dryRun",True)))
    if not result["dryRun"]:save(_state(body)/"settings.json",load(_state(body)/"settings.json").from_dict(result["settings"]))
    return result

@router.post("/v1/capabilities")
async def scoped_capabilities(request: Request) -> dict[str,object]:
    from .capabilities import known_backend_capabilities
    body=await _body(request);settings=load(_state(body)/"settings.json")
    return {"ok":True,"backends":[item.to_dict() for item in known_backend_capabilities(settings)]}

@router.post("/v1/voice/options")
async def voice_options_route(request: Request) -> dict[str,object]:
    body=await _body(request);_state(body)
    return discover_voice_options(body.get("owner"))

@router.post("/v1/enhance/options")
async def enhancement_options_route(request: Request) -> dict[str,object]:
    body=await _body(request);_state(body);return _public(enhancement_options,body)

@router.post("/v1/enhance")
async def enhancement_route(request: Request) -> dict[str,object]:
    body=await _body(request);_state(body);return await asyncio.to_thread(_public,enhance_prompt,body)

@router.post("/v1/codex/status")
async def codex_status(request: Request) -> dict[str,object]:
    body=await _body(request);_state(body);owner=body.get("owner")
    return {"ok":True,"subscription":billing_receipt("subscription",owner).to_dict(),"api":billing_receipt("api").to_dict()}

@router.post("/v1/talk/start")
async def talk_start(request: Request) -> dict[str,object]:
    body=await _body(request);_public(talk.start,body);return await asyncio.to_thread(_public,REGISTRY.offer,body)
@router.post("/v1/talk/health")
async def talk_health(request: Request) -> dict[str,object]:
    return await asyncio.to_thread(_public,REGISTRY.health,await _body(request))

@router.post("/v1/talk/command")
async def talk_command(request: Request) -> dict[str,object]:return await asyncio.to_thread(_public,REGISTRY.command,await _body(request))
@router.post("/v1/talk/result")
async def talk_result(request: Request) -> dict[str,object]:return await asyncio.to_thread(_public,REGISTRY.result,await _body(request))
@router.post("/v1/talk/close")
async def talk_close(request: Request) -> dict[str,object]:return await asyncio.to_thread(_public,REGISTRY.close,await _body(request))

@router.post("/v1/run/start")
async def run_start(request: Request) -> dict[str,object]:return await asyncio.to_thread(_public,start_hermes_run,await _body(request))
@router.post("/v1/run/status")
async def run_status(request: Request) -> dict[str,object]:return await asyncio.to_thread(_public,hermes_run_status,await _body(request))
@router.post("/v1/run/stop")
async def run_stop(request: Request) -> dict[str,object]:return await asyncio.to_thread(_public,stop_hermes_run,await _body(request))
@router.post("/v1/run/steer")
async def run_steer(request: Request) -> dict[str,object]:return await asyncio.to_thread(_public,steer_hermes_run,await _body(request))

@router.post("/v1/live/preflight")
async def live_preflight_route(request: Request) -> dict[str,object]:
    body=await _body(request);_state(body);return live_preflight(str(body.get("endpoint") or ""),body.get("capabilities"),str(body.get("provider") or ""))
@router.post("/v1/live/bridge-proof")
async def bridge_proof(request: Request) -> dict[str,object]:
    body=await _body(request)
    try:return mint_bridge_proof(body.get("owner"),body.get("endpoint"),body.get("provider"),body.get("sessionId"),body.get("nonce"))
    except ContractError as error:raise HTTPException(status_code=400,detail=error.to_dict()) from None

@router.post("/v1/usage/read")
async def voice_usage(request: Request) -> dict[str,object]:return summary(_state(await _body(request))/"usage.json")
@router.post("/v1/usage")
async def voice_usage_record(request: Request) -> dict[str,object]:
    body=await _body(request);return record(_state(body)/"usage.json",int(body.get("durationMs") or 0),int(body.get("audioMs") or 0))
