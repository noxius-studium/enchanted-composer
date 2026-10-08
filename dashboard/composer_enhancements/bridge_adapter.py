"""Optional Composer bridge adapter; insecure endpoints are limited to loopback development."""
from __future__ import annotations

from urllib.parse import urlparse

_ALLOWED_PROVIDERS={"openai","gemini","huggingface"}

def _secure_endpoint(endpoint: str) -> bool:
    parsed=urlparse(endpoint)
    return bool(parsed.netloc and not parsed.query and not parsed.fragment and (parsed.scheme=="wss" or (parsed.scheme=="ws" and parsed.hostname in {"127.0.0.1","localhost","::1"})))

def preflight(endpoint: str, advertised: object, provider: str) -> dict[str, object]:
    if not _secure_endpoint(endpoint):
        return {"installed":bool(endpoint),"compatible":False,"supported":False,"ready":False,"featureFlags":{"composerBridge":False},"unavailableReason":{"code":"bridge_not_configured","message":"Composer bridge requires wss or an explicit loopback development endpoint."}}
    if not isinstance(advertised,dict) or advertised.get("composerBridge") is not True or advertised.get("protocol")!="composer-bridge-v1" or advertised.get("taskAuthority")!="composer" or advertised.get("authMode")!="composer-bound-token-v1":
        return {"installed":True,"compatible":False,"supported":False,"ready":False,"featureFlags":{"composerBridge":False},"unavailableReason":{"code":"composer_bridge_required","message":"This gateway is not an authenticated Composer bridge."}}
    providers=advertised.get("providers")
    if provider not in _ALLOWED_PROVIDERS or not isinstance(providers,list) or provider not in providers:
        return {"installed":True,"compatible":True,"supported":False,"ready":False,"featureFlags":{"composerBridge":True},"unavailableReason":{"code":"provider_not_advertised","message":"The selected bridge provider is not advertised."}}
    return {"installed":True,"compatible":True,"supported":True,"ready":True,"featureFlags":{"composerBridge":True},"protocol":"composer-bridge-v1"}
