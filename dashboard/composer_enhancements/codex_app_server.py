"""Correlated, bounded stdio JSON-RPC client for Codex realtime conversations."""
from __future__ import annotations

import json
import os
import subprocess
import threading
import time
from collections import deque
from typing import Any

from .codex_binary import discover_codex_binary
from .runtime_env import read as read_runtime_env

_CHILD_ENV_KEYS = (
    "PATH",
    "HOME",
    "USERPROFILE",
    "SYSTEMROOT",
    "WINDIR",
    "PATHEXT",
    "COMSPEC",
    "TEMP",
    "TMP",
    "LANG",
    "LC_ALL",
    "LC_CTYPE",
)


def _child_environment() -> dict[str, str]:
    """Return only OS launch essentials plus Codex's explicit home."""
    env = {key: value for key in _CHILD_ENV_KEYS if (value := os.environ.get(key))}
    codex_home = read_runtime_env("CODEX_HOME").strip()
    if codex_home:
        env["CODEX_HOME"] = codex_home
    return env


class CodexRpcError(RuntimeError):
    """Internal bounded RPC detail used only for compatibility branches."""
    def __init__(self, code: object, message: object) -> None:
        self.code=str(code)[:64]
        # Do not retain raw provider diagnostics or values that resemble secrets.
        self.message=(str(message)[:240] if message else "Codex app-server rejected the request.")
        if any(token in self.message.lower() for token in ("token", "secret", "authorization", "api key")):
            self.message="Codex app-server rejected the request."
        super().__init__(self.message)


class CodexAppServer:
    def __init__(self, command: list[str] | None = None) -> None:
        self.command = command
        self.process: subprocess.Popen[str] | None = None
        self._condition = threading.Condition()
        self._write_lock = threading.Lock()
        self._next_id = 0
        self._replies: dict[int, dict[str, Any]] = {}
        self._notifications: deque[tuple[int, dict[str, Any]]] = deque(maxlen=512)
        self._notification_seq = 0
        self._diagnostic: deque[str] = deque(maxlen=24)
        self._threads: list[threading.Thread] = []

    def start(self) -> None:
        if self.process and self.process.poll() is None:
            return
        binary = discover_codex_binary()
        if not self.command and not binary:
            raise RuntimeError("Codex CLI is not available.")
        env = _child_environment()
        command = self.command or [binary, "app-server", "--listen", "stdio://", "--enable", "realtime_conversation", "-c", "model_provider=openai", "-c", "suppress_unstable_features_warning=true"]
        self.process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1, env=env)
        process = self.process
        for target in (self._read_stdout, self._read_stderr):
            thread = threading.Thread(target=target, args=(process,), daemon=True)
            thread.start()
            self._threads.append(thread)
        self.request("initialize", {"clientInfo": {"name": "composer-enhancements", "version": "1.0"}, "capabilities": {"experimentalApi": True}}, 25)

    def _read_stdout(self, process: subprocess.Popen[str]) -> None:
        assert process.stdout
        try:
            for line in process.stdout:
                if len(line) > 1_000_000:
                    continue
                try:
                    message = json.loads(line)
                except ValueError:
                    continue
                if not isinstance(message, dict):
                    continue
                with self._condition:
                    if isinstance(message.get("id"), int):
                        self._replies[message["id"]] = message
                    elif isinstance(message.get("method"), str):
                        self._notification_seq += 1
                        self._notifications.append((self._notification_seq, message))
                    self._condition.notify_all()
        finally:
            with self._condition:
                self._condition.notify_all()

    def _read_stderr(self, process: subprocess.Popen[str]) -> None:
        assert process.stderr
        for line in process.stderr:
            self._diagnostic.append("Codex app-server reported an error" if "error" in line.lower() else "Codex app-server diagnostic")

    def request(self, method: str, params: dict[str, Any], timeout: float = 30) -> Any:
        process = self.process
        if not process or process.poll() is not None or not process.stdin:
            raise RuntimeError("Codex app-server is unavailable.")
        with self._condition:
            self._next_id += 1
            request_id = self._next_id
        with self._write_lock:
            process.stdin.write(json.dumps({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}, separators=(",", ":")) + "\n")
            process.stdin.flush()
        deadline = time.monotonic() + timeout
        with self._condition:
            while request_id not in self._replies:
                if process.poll() is not None:
                    raise RuntimeError("Codex app-server exited.")
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise TimeoutError("Codex app-server request timed out.")
                self._condition.wait(min(remaining, .25))
            response = self._replies.pop(request_id)
        if "error" in response:
            error=response.get("error")
            if isinstance(error,dict):
                raise CodexRpcError(error.get("code","rpc_error"),error.get("message",""))
            raise CodexRpcError("rpc_error","")
        return response.get("result")

    def notification_cursor(self) -> int:
        with self._condition:
            return self._notification_seq

    def wait_notification(self, cursor: int, methods: set[str], timeout: float) -> tuple[int, dict[str, Any]]:
        deadline = time.monotonic() + timeout
        with self._condition:
            while True:
                for sequence, message in self._notifications:
                    if sequence > cursor and message.get("method") in methods:
                        return sequence, message
                if self.process is None or self.process.poll() is not None:
                    raise RuntimeError("Codex app-server exited.")
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise TimeoutError("Codex app-server notification timed out.")
                self._condition.wait(min(remaining, .25))

    def close(self) -> None:
        process, self.process = self.process, None
        if process:
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=3)
            for pipe in (process.stdin, process.stdout, process.stderr):
                if pipe:
                    pipe.close()
        for thread in self._threads:
            thread.join(timeout=1)
        self._threads.clear()
        with self._condition:
            self._replies.clear()
            self._notifications.clear()
            self._condition.notify_all()
