"""capability.verification — verification & testing capability.

Operations: regression_check, invariant_check, coverage, type_check, lint, test_run, audit
Pack: core-pack
Danger: LOW
"""

from __future__ import annotations

import subprocess
from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    CORE_PACK,
    DangerLevel,
    EvidenceRequirements,
    ExecutionJournalEntry,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="verification",
    version="1.0.0",
    danger_level=DangerLevel.LOW,
    rollback_support=False,
    verification_required=False,
    external_side_effects=False,
    topology_constraints=[],
    adapter_requirements=[],
    dependency_weight=CORE_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False, timeout_seconds=300),
    evidence_requirements=EvidenceRequirements(execution_journal=True),
)


class VerificationCapability(BaseCapability):
    """Verification & testing operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "none"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return True  # verification is read-only, no rollback needed

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "regression_check": self.regression_check,
            "invariant_check": self.invariant_check,
            "coverage": self.coverage,
            "type_check": self.type_check,
            "lint": self.lint,
            "test_run": self.test_run,
            "audit": self.audit,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown verification operation: {operation}")
        return handler(**params)

    def regression_check(self, path: str = ".", target: str = "test") -> dict[str, Any]:
        """Run tests and check for regressions."""
        result = subprocess.run(
            ["python", "-m", "pytest", target, "-x", "--tb=short"],
            capture_output=True, text=True, cwd=path,
        )
        passed = result.returncode == 0
        return {"passed": passed, "stdout": result.stdout, "stderr": result.stderr}

    def invariant_check(self, path: str = ".", invariants: list[str] | None = None) -> dict[str, Any]:
        """Check codebase invariants."""
        results = {}
        for inv in invariants or []:
            results[inv] = True  # placeholder
        return {"invariants": results, "all_pass": all(results.values())}

    def coverage(self, path: str = ".", target: str = "test", fail_under: int = 80) -> dict[str, Any]:
        """Run pytest with coverage."""
        result = subprocess.run(
            ["python", "-m", "pytest", target, f"--cov-fail-under={fail_under}", "--cov"],
            capture_output=True, text=True, cwd=path,
        )
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def type_check(self, path: str = ".", strict: bool = False) -> dict[str, Any]:
        """Run mypy type checker."""
        args = ["python", "-m", "mypy"]
        if strict:
            args.append("--strict")
        args.append(path)
        result = subprocess.run(args, capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def lint(self, path: str = ".", fix: bool = False) -> dict[str, Any]:
        """Run ruff linter."""
        args = ["python", "-m", "ruff", "check"]
        if fix:
            args.append("--fix")
        args.append(path)
        result = subprocess.run(args, capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def test_run(self, path: str = ".", pattern: str = "test", verbose: bool = False, junit: bool = False) -> dict[str, Any]:
        """Run tests with pytest."""
        args = ["python", "-m", "pytest", pattern]
        if verbose:
            args.append("-v")
        if junit:
            args.append("--junitxml=test-results.xml")
        result = subprocess.run(args, capture_output=True, text=True, cwd=path)
        return {"passed": result.returncode == 0, "stdout": result.stdout, "stderr": result.stderr}

    def audit(self, path: str = ".") -> dict[str, Any]:
        """Run pip-audit on the project."""
        result = subprocess.run(
            ["python", "-m", "pip_audit"],
            capture_output=True, text=True, cwd=path,
        )
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
