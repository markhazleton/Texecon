"""Lifecycle boundary for the local editor service."""

from __future__ import annotations

import socket
import subprocess
import sys
import time
from pathlib import Path


class EditorProcess:
    def __init__(self, script: str | Path, config: str | Path):
        self.script = Path(script).resolve()
        self.config = Path(config).resolve()
        self.process: subprocess.Popen | None = None

    def start(self) -> int:
        if self.process is not None and self.process.poll() is None:
            return self.process.pid
        self.process = subprocess.Popen([sys.executable, str(self.script), '--config', str(self.config)],
                                        stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                                        stderr=subprocess.DEVNULL, close_fds=True)
        return self.process.pid

    def stop(self) -> None:
        if self.process is None or self.process.poll() is not None:
            return
        self.process.terminate()
        try:
            self.process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            self.process.kill()
            self.process.wait(timeout=5)

    @staticmethod
    def available(host: str, port: int) -> bool:
        with socket.socket() as connection:
            connection.settimeout(0.5)
            return connection.connect_ex((host, port)) == 0
