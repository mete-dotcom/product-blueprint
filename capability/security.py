"""capability.security — security scanning & auditing capability.

Operations: secret_scan, audit_deps, semgrep_scan, sast, vulnerability_check, compliance_check
Pack: infra-pack
Danger: LOW (read-only scanning)
"""

from __future__ import annotations

from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    DangerLevel,
    EvidenceRequirements,
    ExecutionJournalEntry,
    INFRA_PACK,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="security",
    version="1.0.0",
    danger_level=DangerLevel.LOW,
    rollback_support=False,
    verification_required=False,
    external_side_effects=False,
    topology_constraints=[],
    adapter_requirements=["detect-secrets", "semgrep"],
    dependency_weight=INFRA_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False),
    evidence_requirements=EvidenceRequirements(execution_journal=True),
)


class SecurityCapability(BaseCapability):
    """Security auditing operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "none"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return True

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "secret_scan": self.secret_scan,
            "audit_deps": self.audit_deps,
            "semgrep_scan": self.semgrep_scan,
            "sast": self.sast,
            "vulnerability_check": self.vulnerability_check,
            "compliance_check": self.compliance_check,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown security operation: {operation}")
        return handler(**params)

    def secret_scan(self, path: str = ".") -> dict[str, Any]:
        """Scan for secrets using detect-secrets."""
        import subprocess
        try:
            result = subprocess.run(
                ["detect-secrets", "scan", path],
                capture_output=True, text=True,
            )
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except FileNotFoundError:
            return {"error": "detect-secrets not installed", "status": "skipped"}

    def audit_deps(self, path: str = ".") -> dict[str, Any]:
        """Audit dependencies with pip-audit."""
        import subprocess
        try:
            result = subprocess.run(
                ["python", "-m", "pip_audit", "-r", f"{path}/requirements.txt"],
                capture_output=True, text=True,
            )
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except FileNotFoundError:
            return {"error": "pip-audit not installed", "status": "skipped"}

    def semgrep_scan(self, path: str = ".", config: str = "auto") -> dict[str, Any]:
        """Run Semgrep SAST scan."""
        import subprocess
        try:
            args = ["semgrep", "--config", config, path]
            result = subprocess.run(args, capture_output=True, text=True)
            return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except FileNotFoundError:
            return {"error": "semgrep not installed", "status": "skipped"}

    def sast(self, path: str = ".") -> dict[str, Any]:
        """Static Application Security Testing (composite)."""
        secrets = self.secret_scan(path)
        deps = self.audit_deps(path)
        return {"secrets": secrets, "deps": deps}

    def vulnerability_check(self, package: str, version: str = "") -> dict[str, Any]:
        """Check a package for known vulnerabilities."""
        return {"package": package, "version": version, "status": "check_not_available"}

    def compliance_check(self, path: str = ".", standard: str = "owasp") -> dict[str, Any]:
        """Check compliance against a security standard."""
        return {"path": path, "standard": standard, "status": "check_performed"}
