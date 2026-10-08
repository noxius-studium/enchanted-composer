"""Short-lived, backend-minted Composer bridge proofs; shared secret never leaves backend."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from urllib.parse import urlparse

from .contracts import OwnerBinding
from .errors import ContractError, PublicErrorCode


def _origin(endpoint: object) -> str:
    if not isinstance(endpoint,str) or len(endpoint)>2048:
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    parsed=urlparse(endpoint)
    loopback=parsed.hostname in {"127.0.0.1","localhost","::1"}
    if parsed.query or parsed.fragment or not parsed.netloc or not (parsed.scheme=="wss" or (parsed.scheme=="ws" and loopback)):
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    return f"{parsed.scheme}://{parsed.netloc}"


def mint(owner_value: object, endpoint: object, provider: object, session_id: object, nonce: object, *, clock=time.time) -> dict[str, object]:
    owner=OwnerBinding.from_dict(owner_value)
    secret=os.environ.get("COMPOSER_BRIDGE_SHARED_SECRET", "").strip()
    if not secret:
        raise ContractError(PublicErrorCode.BACKEND_NOT_READY)
    if not isinstance(provider,str) or not 0<len(provider)<=128 or not isinstance(session_id,str) or not 0<len(session_id)<=128 or not isinstance(nonce,str) or not 0<len(nonce)<=256:
        raise ContractError(PublicErrorCode.INVALID_CONTRACT)
    expires_at=int(clock())+60
    claims={"owner":owner.to_dict(),"origin":_origin(endpoint),"provider":provider,"sessionId":session_id,"nonce":nonce,"expiresAt":expires_at}
    payload=json.dumps(claims,sort_keys=True,separators=(",",":")).encode()
    encoded=base64.urlsafe_b64encode(payload).rstrip(b"=").decode()
    signature=hmac.new(secret.encode(),encoded.encode(),hashlib.sha256).hexdigest()
    return {"proof":f"v1.{encoded}.{signature}","expiresAt":expires_at}
