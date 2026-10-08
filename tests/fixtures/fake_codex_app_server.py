"""Stdio fixture for the real CodexAppServer process wrapper."""
import json
import sys

for line in sys.stdin:
    request = json.loads(line)
    method = request["method"]
    ident = request["id"]
    if method == "thread/realtime/start":
        assert request["params"]["clientManagedHandoffs"] is True
        assert "Never claim execution" in request["params"]["realtimeStartInstructions"]
        assert "terminal: Run commands." in request["params"]["realtimeStartInstructions"]
        assert "bound to the Hermes chat where it started" in request["params"]["realtimeStartInstructions"]
        assert "without touching the Composer or creating another chat" in request["params"]["realtimeStartInstructions"]
        assert "stop, skip, cancel, or change of direction" in request["params"]["realtimeStartInstructions"]
        print(json.dumps({"jsonrpc": "2.0", "method": "thread/realtime/sdp", "params": {"sdp": "answer-sdp"}}), flush=True)
    result = {"thread": {"id": "fake-thread"}} if method == "thread/start" else {}
    print(json.dumps({"jsonrpc": "2.0", "id": ident, "result": result}), flush=True)
    print("diagnostic token=SECRET", file=sys.stderr, flush=True)
