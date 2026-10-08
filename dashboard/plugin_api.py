"""Secret-free dashboard routes for the Enchanted Composer backend."""
from __future__ import annotations

import importlib
import sys
from collections.abc import AsyncIterator
from pathlib import Path
from types import ModuleType
from typing import Final

from fastapi import APIRouter, Depends, HTTPException, Request


def _backend_module(name: str) -> ModuleType:
    """Load the sibling package when Hermes imports this file standalone."""
    package_name = "hermes_dashboard_plugin_composer_enhancements_backend"
    if package_name not in sys.modules:
        package = ModuleType(package_name)
        package.__package__ = package_name
        package.__path__ = [str(Path(__file__).with_name("composer_enhancements"))]
        sys.modules[package_name] = package
    return importlib.import_module(f"{package_name}.{name}")


known_backend_capabilities = _backend_module("capabilities").known_backend_capabilities
CONTRACT_VERSION = _backend_module("contracts").CONTRACT_VERSION
ContractError = _backend_module("errors").ContractError
owner_state_dir = _backend_module("paths").owner_state_dir
v1_router = _backend_module("router").router
load = _backend_module("settings").load

PLUGIN_ID: Final="composer-enhancements"


async def _profile_scope(profile: str | None = None) -> AsyncIterator[None]:
    """Bind Dashboard requests to the profile selected in the web UI."""
    if profile is None:
        yield
        return
    from agent.secret_scope import build_profile_secret_scope, reset_secret_scope, set_secret_scope
    from hermes_cli.env_loader import hydrate_profile_secret_sources
    from hermes_cli.profiles import get_profile_dir, profile_exists, validate_profile_name
    from hermes_constants import reset_hermes_home_override, set_hermes_home_override

    try:
        validate_profile_name(profile)
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Invalid profile") from error
    if not profile_exists(profile):
        raise HTTPException(status_code=404, detail="Profile not found")
    profile_home = get_profile_dir(profile)
    token = set_hermes_home_override(profile_home)
    secret_token = None
    try:
        hydrate_profile_secret_sources(profile_home)
        secret_token = set_secret_scope(build_profile_secret_scope(profile_home),profile_home=str(profile_home))
        yield
    finally:
        if secret_token is not None:
            reset_secret_scope(secret_token)
        reset_hermes_home_override(token)


router=APIRouter(dependencies=[Depends(_profile_scope)])
router.include_router(v1_router)

@router.get("/health")
async def health() -> dict[str,object]:return {"ok":True,"plugin":PLUGIN_ID,"contractVersion":CONTRACT_VERSION}

@router.post("/capabilities")
async def capabilities(request: Request) -> dict[str,object]:
    try:body=await request.json()
    except (TypeError,ValueError):body={}
    try:settings=load(owner_state_dir(body.get("owner"))/"settings.json")
    except ContractError as error:raise HTTPException(status_code=400,detail=error.to_dict()) from None
    return {"ok":True,"plugin":PLUGIN_ID,"contractVersion":CONTRACT_VERSION,"backends":[item.to_dict() for item in known_backend_capabilities(settings)]}
