"""Owner-bound Hermes runs that continue the chat where Live Voice started."""
from __future__ import annotations

import json
import os
import re
import threading
import urllib.error
import urllib.parse
import urllib.request
from collections import OrderedDict
from typing import Any

from .contracts import OwnerBinding
from .errors import ContractError, PublicErrorCode

_RUN_ID=re.compile(r"^run_[A-Za-z0-9_-]{1,120}$")
_TERMINAL={"completed","failed","cancelled","interrupted"}
_MAX_CONTEXT=12_000
_MAX_OUTPUT=12_000
_OWNERS: OrderedDict[str,tuple[str,str,str,str]]=OrderedDict()
_LOCK=threading.RLock()


def _owner_tuple(value: object)->tuple[str,str,str,str]:
    owner=OwnerBinding.from_dict(value)
    if owner.runtime_session_id.startswith("draft:") or owner.stored_session_id.startswith("draft:"):
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    return owner.connection_id,owner.profile,owner.runtime_session_id,owner.stored_session_id


def _base_url(profile: str)->str:
    host,port="127.0.0.1",8642
    try:
        from gateway.config import Platform, load_gateway_config
        from gateway.platforms.api_server import listen_address
        config=load_gateway_config();platform=config.platforms.get(Platform.API_SERVER)
        configured_host,configured_port=listen_address(platform.extra or {}) if platform is not None else (host,port)
        host="127.0.0.1" if configured_host in {"0.0.0.0","::"} else configured_host
        port=configured_port
    except (AttributeError,ImportError,TypeError,ValueError):
        pass
    root=f"http://{host}:{port}"
    return root if profile=="default" else f"{root}/p/{urllib.parse.quote(profile,safe='')}"


def _api_key()->str:
    try:
        from agent.secret_scope import UnscopedSecretError, get_secret
    except ImportError:
        value=os.environ.get("API_SERVER_KEY","")
    else:
        try:value=get_secret("API_SERVER_KEY","") or ""
        except UnscopedSecretError:value=os.environ.get("API_SERVER_KEY","")
    return value.strip()


def _request(owner: tuple[str,str,str,str],method: str,path: str,body: dict[str,Any]|None=None,timeout: float=10)->Any:
    payload=None if body is None else json.dumps(body,separators=(",",":")).encode()
    headers={"Accept":"application/json"}
    key=_api_key()
    if key:headers["Authorization"]=f"Bearer {key}"
    if payload is not None:headers["Content-Type"]="application/json"
    request=urllib.request.Request(_base_url(owner[1])+path,data=payload,headers=headers,method=method)
    try:
        with urllib.request.urlopen(request,timeout=timeout) as response:
            raw=response.read(1_000_001)
    except urllib.error.HTTPError as error:
        error.read(1024)
        raise RuntimeError(f"Hermes run service refused the request ({error.code}).") from None
    except urllib.error.URLError:
        raise RuntimeError("Hermes run service is unavailable.") from None
    if len(raw)>1_000_000:raise RuntimeError("Hermes run service returned an oversized response.")
    try:value=json.loads(raw)
    except (UnicodeDecodeError,json.JSONDecodeError):raise RuntimeError("Hermes run service returned invalid JSON.") from None
    return value


def _entries(payload: object,label: str)->list[dict[str,Any]]:
    if isinstance(payload,list):values=payload
    elif isinstance(payload,dict) and isinstance(payload.get("data"),list):values=payload["data"]
    elif isinstance(payload,dict) and isinstance(payload.get(label),list):values=payload[label]
    else:raise TypeError(f"Hermes returned an invalid {label} catalog.")
    return [item for item in values if isinstance(item,dict)]


def capability_context(owner_value: object)->str:
    owner=_owner_tuple(owner_value)
    try:skills=_entries(_request(owner,"GET","/v1/skills"),"skills")
    except RuntimeError:
        try:
            from tools.skills_tool import _find_all_skills
            skills=[item for item in _find_all_skills() if isinstance(item,dict)]
        except (ImportError,OSError,RuntimeError,TypeError,ValueError):raise RuntimeError("Hermes skill catalog is unavailable.") from None
    toolsets=_entries(_request(owner,"GET","/v1/toolsets"),"toolsets")
    lines=["Hermes capabilities available through the chat-bound Live Voice execution handoff.","Installed skills:"]
    for skill in skills:
        name=str(skill.get("name") or "").strip()[:128]
        description=str(skill.get("description") or "").strip().replace("\n"," ")[:240]
        category=str(skill.get("category") or "general").strip()[:128]
        if name:lines.append(f"- {category} / {name}"+(f": {description}" if description else ""))
    lines.append("Enabled toolsets and concrete tools:")
    for toolset in toolsets:
        if toolset.get("enabled") is not True:continue
        name=str(toolset.get("name") or "").strip()[:128]
        description=str(toolset.get("description") or "").strip().replace("\n"," ")[:240]
        tools=[str(value).strip()[:128] for value in toolset.get("tools",[]) if isinstance(value,str) and value.strip()]
        lines.append(f"- {name}"+(f": {description}" if description else "")+(f"; tools: {', '.join(tools)}" if tools else ""))
    result="\n".join(lines)
    if len(result)>32_000:raise RuntimeError("Hermes capability catalog is too large for Live Voice.")
    if not skills and len(lines)<=3:raise RuntimeError("Hermes exposed no skills or tools to Live Voice.")
    return result


def _remember(run_id: str,owner: tuple[str,str,str,str])->None:
    with _LOCK:
        _OWNERS[run_id]=owner;_OWNERS.move_to_end(run_id)
        while len(_OWNERS)>256:_OWNERS.popitem(last=False)


def _owned(body: dict[str,Any])->tuple[tuple[str,str,str,str],str]:
    owner=_owner_tuple(body.get("owner"));run_id=body.get("runId")
    if not isinstance(run_id,str) or not _RUN_ID.fullmatch(run_id):raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    with _LOCK:expected=_OWNERS.get(run_id)
    if expected!=owner:raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    return owner,run_id


def start(body: dict[str,Any])->dict[str,object]:
    owner=_owner_tuple(body.get("owner"));text=body.get("text");context=body.get("voiceContext","")
    if not isinstance(text,str) or not text.strip() or len(text)>8_000 or not isinstance(context,str) or len(context)>_MAX_CONTEXT:
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    instructions="This request came from Live Voice bound to this Hermes chat. Use the appropriate Hermes tools and skills, preserve the existing chat context, and return a concise factual result suitable for spoken delivery. Do not create or switch sessions. Do not call the clarify tool: when information is missing, return one concise question as the final result so Live Voice can ask it without blocking the run."
    if context.strip():instructions+="\n\nRecent ephemeral Live Voice context:\n"+context.strip()
    receipt=_request(owner,"POST","/v1/runs",{"input":text.strip(),"session_id":owner[3],"instructions":instructions},10)
    run_id=receipt.get("run_id") if isinstance(receipt,dict) else None
    if not isinstance(run_id,str) or not _RUN_ID.fullmatch(run_id):raise RuntimeError("Hermes returned an invalid run receipt.")
    _remember(run_id,owner)
    return {"ok":True,"runId":run_id,"status":"queued"}


def status(body: dict[str,Any])->dict[str,object]:
    owner,run_id=_owned(body);result=_request(owner,"GET",f"/v1/runs/{urllib.parse.quote(run_id,safe='')}",timeout=10)
    if not isinstance(result,dict):raise TypeError("Hermes returned an invalid run status.")
    state=str(result.get("status") or "unknown")[:64]
    response: dict[str,object]={"ok":True,"runId":run_id,"status":state}
    if state=="completed":response["output"]=str(result.get("output") or "")[:_MAX_OUTPUT]
    elif state in {"failed","cancelled","interrupted"}:response["error"]=str(result.get("error") or f"Hermes run {state}.")[:512]
    elif state=="waiting_for_approval":response["approvalRequired"]=True
    return response


def stop(body: dict[str,Any])->dict[str,object]:
    owner,run_id=_owned(body)
    result=_request(owner,"POST",f"/v1/runs/{urllib.parse.quote(run_id,safe='')}/stop",{},10)
    return {"ok":True,"runId":run_id,"status":str(result.get("status") or "stopping")[:64] if isinstance(result,dict) else "stopping"}


def steer(body: dict[str,Any])->dict[str,object]:
    owner,run_id=_owned(body);text=body.get("text")
    if not isinstance(text,str) or not text.strip() or len(text)>8_000:raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    result=_request(owner,"POST",f"/v1/runs/{urllib.parse.quote(run_id,safe='')}/steer",{"input":text.strip()},10)
    status=str(result.get("status") or "accepted")[:64] if isinstance(result,dict) else "accepted"
    return {"ok":True,"runId":run_id,"status":status}
