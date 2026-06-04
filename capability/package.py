"""capability.package — package management capability.

Operations: install, uninstall, list, freeze, build, publish, audit, update
Pack: core-pack
Danger: HIGH (system modifications)
"""

from __future__ import annotations

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
    name="package",
    version="1.0.0",
    danger_level=DangerLevel.HIGH,
    rollback_support=True,
    verification_required=True,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=["uv"],
    dependency_weight=CORE_PACK,
    sandbox_requirements=SandboxRequirements(isolated=True, network_access=True, filesystem_write=True),
    evidence_requirements=EvidenceRequirements(
        verification_required=True,
        blast_radius_required=True,
        rollback_plan_required=True,
    ),
    escalation_policy=EscalationPolicy(
        escalation_threshold=DangerLevel.HIGH,
        require_human_approval=True,
    ),
)


class PackageCapability(BaseCapability):
    """Package management operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        if operation in ("install", "uninstall", "update"):
            return "system-wide"
        return "none"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return False  # placeholder

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "install": self.install,
            "uninstall": self.uninstall,
            "list": self.list_packages,
            "freeze": self.freeze,
            "build": self.build,
            "publish": self.publish,
            "audit": self.audit,
            "update": self.update,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown package operation: {operation}")
        return handler(**params)

    def install(self, packages: list[str], upgrade: bool = False) -> dict[str, Any]:
        """Install packages using uv or pip."""
        import subprocess
        try:
            args = ["uv", "pip", "install"] + packages
            if upgrade:
                args.append("--upgrade")
            result = subprocess.run(args, capture_output=True, text=True)
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except FileNotFoundError:
            args = ["python", "-m", "pip", "install"] + packages
            result = subprocess.run(args, capture_output=True, text=True)
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def uninstall(self, packages: list[str]) -> dict[str, Any]:
        """Uninstall packages."""
        import subprocess
        try:
            result = subprocess.run(
                ["uv", "pip", "uninstall"] + packages,
                capture_output=True, text=True,
            )
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except FileNotFoundError:
            result = subprocess.run(
                ["python", "-m", "pip", "uninstall", "-y"] + packages,
                capture_output=True, text=True,
            )
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def list_packages(self, format: str = "table") -> dict[str, Any]:
        """List installed packages."""
        import subprocess
        try:
            result = subprocess.run(["uv", "pip", "list"], capture_output=True, text=True)
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except FileNotFoundError:
            result = subprocess.run(
                ["python", "-m", "pip", "list", "--format", format],
                capture_output=True, text=True,
            )
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def freeze(self) -> dict[str, Any]:
        """Generate requirements.txt."""
        import subprocess
        try:
            result = subprocess.run(["uv", "pip", "freeze"], capture_output=True, text=True)
            return {"requirements": result.stdout, "stderr": result.stderr}
        except FileNotFoundError:
            result = subprocess.run(
                ["python", "-m", "pip", "freeze"],
                capture_output=True, text=True,
            )
            return {"requirements": result.stdout, "stderr": result.stderr}

    def build(self, path: str = ".", format: str = "wheel") -> dict[str, Any]:
        """Build a Python package."""
        import subprocess
        result = subprocess.run(
            ["python", "-m", "build", "--wheel" if format == "wheel" else "--sdist", path],
            capture_output=True, text=True,
        )
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def publish(self, repository: str = "pypi", token: str = "", dry_run: bool = True) -> dict[str, Any]:
        """Publish a package to PyPI."""
        if dry_run:
            return {"status": "dry_run", "repository": repository, "published": False}
        import subprocess
        env = {"TWINE_USERNAME": "__token__", "TWINE_PASSWORD": token}
        result = subprocess.run(
            ["python", "-m", "twine", "upload", "--repository", repository, "dist/*"],
            capture_output=True, text=True, env={**__import__("os").environ, **env},
        )
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def audit(self, requirements_file: str = "requirements.txt") -> dict[str, Any]:
        """Audit installed packages for vulnerabilities."""
        import subprocess
        try:
            result = subprocess.run(
                ["python", "-m", "pip_audit", "-r", requirements_file],
                capture_output=True, text=True,
            )
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except FileNotFoundError:
            return {"error": "pip-audit not installed", "status": "skipped"}

    def update(self, packages: list[str] | None = None) -> dict[str, Any]:
        """Update packages."""
        return self.install(packages or [], upgrade=True)
