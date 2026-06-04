"""capability.execution — command execution capability.

Operations: run, sandbox, timeout, stream, retry, isolate, shell, script
Pack: core-pack
Danger: HIGH (can run arbitrary commands)
"""

from __future__ import annotations

import asyncio
import os
import subprocess
import tempfile
from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    CORE_PACK,
    DangerLevel,
    EscalationPolicy,
    EvidenceRequirements,
    ExecutionJournalEntry,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="execution",
    version="1.0.0",
    danger_level=DangerLevel.HIGH,
    rollback_support=False,
    verification_required=True,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=[],
    dependency_weight=CORE_PACK,
    sandbox_requirements=SandboxRequirements(
        isolated=True, network_access=False, filesystem_write=False, timeout_seconds=60,
    ),
    evidence_requirements=EvidenceRequirements(
        verification_required=True,
        blast_radius_required=True,
        rollback_plan_required=True,
        execution_journal=True,
    ),
    escalation_policy=EscalationPolicy(
        auto_escalate=True,
        escalation_threshold=DangerLevel.HIGH,
        require_human_approval=True,
        max_retries=0,
    ),
)


class ExecutionCapability(BaseCapability):
    """Command execution operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        command = params.get("command", "")
        if isinstance(command, str):
            dangerous_patterns = ["rm -rf /", "> /dev/sda", "dd if=", ":(){ :|:& };:"]
            for pattern in dangerous_patterns:
                if pattern in command:
                    return False
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        if operation in ("run", "shell", "script"):
            return "system-wide"
        return "single-process"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return False  # execution is generally not rollbackable

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "run": self.run,
            "sandbox": self.sandbox,
            "timeout": self.timeout,
            "stream": self.stream_output,
            "retry": self.retry,
            "isolate": self.isolate,
            "shell": self.shell,
            "script": self.run_script,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown execution operation: {operation}")
        return handler(**params)

    def run(self, command: list[str] | str, cwd: str = ".", capture_output: bool = True) -> dict[str, Any]:
        """Run a command synchronously."""
        if isinstance(command, str):
            command = command.split()
        result = subprocess.run(command, capture_output=True, text=True, cwd=cwd)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def sandbox(self, command: list[str], timeout: int = 30, allow_network: bool = False) -> dict[str, Any]:
        """Run a command with sandbox constraints."""
        env = os.environ.copy()
        if not allow_network:
            env["NO_NETWORK"] = "1"
        try:
            result = subprocess.run(
                command, capture_output=True, text=True, timeout=timeout, env=env,
            )
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except subprocess.TimeoutExpired as e:
            return {"stdout": e.stdout or "", "stderr": e.stderr or "", "returncode": -1, "timeout": True}

    def timeout(self, command: list[str], seconds: int = 30) -> dict[str, Any]:
        """Run a command with a timeout."""
        return self.sandbox(command, timeout=seconds)

    def stream_output(self, command: list[str], **kwargs: Any) -> Any:
        """Stream output of a long-running command."""
        return subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    async def stream_async(self, command: list[str]) -> Any:
        """Async stream output."""
        proc = await asyncio.create_subprocess_exec(
            *command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
        )
        return proc

    def retry(self, command: list[str], max_retries: int = 3, delay: int = 1) -> dict[str, Any]:
        """Retry a command on failure."""
        import time
        for attempt in range(max_retries):
            result = self.run(command)
            if result["returncode"] == 0:
                return {**result, "attempts": attempt + 1}
            if attempt < max_retries - 1:
                time.sleep(delay)
        return {**result, "attempts": max_retries, "failed": True}  # type: ignore[possibly-undefined]

    def isolate(self, command: list[str]) -> dict[str, Any]:
        """Run in an isolated temporary directory."""
        with tempfile.TemporaryDirectory() as tmpdir:
            result = self.run(command, cwd=tmpdir)
            return result

    def shell(self, command: str, cwd: str = ".") -> dict[str, Any]:
        """Run a shell command string."""
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def run_script(self, script_content: str, interpreter: str = "python", cwd: str = ".") -> dict[str, Any]:
        """Run an inline script."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, dir=cwd) as f:
            f.write(script_content)
            script_path = f.name
        try:
            result = subprocess.run([interpreter, script_path], capture_output=True, text=True, cwd=cwd)
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        finally:
            os.unlink(script_path)
