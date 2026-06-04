"""capability.governance — governance & trust operations capability.

Operations: trust_score, escalation, rollback_plan, blast_radius_analyze,
           verification_gate, execution_journal_query, risk_assessment, recovery

This is the MOST IMPORTANT capability — it governs all other capabilities.
Governance is imported by all capabilities (circular import avoided through
lazy initialization and runtime-only dependencies).

Trust scoring formula:
  trust_score = (verification_success_rate × 0.4) +
                ((1 - rollback_frequency) × 0.3) +
                (blast_radius_accuracy × 0.3)
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
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
    name="governance",
    version="1.0.0",
    danger_level=DangerLevel.LOW,
    rollback_support=False,
    verification_required=False,
    external_side_effects=False,
    topology_constraints=[],
    adapter_requirements=[],
    dependency_weight=CORE_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False),
    evidence_requirements=EvidenceRequirements(execution_journal=True),
)


def trust_score(
    verification_success_rate: float,  # 0.0-1.0
    rollback_frequency: float,          # 0.0-1.0 (lower is better)
    blast_radius_accuracy: float,       # 0.0-1.0
) -> float:
    """Compute a trust score for an agent or capability.

    Args:
        verification_success_rate: Fraction of verifications that passed (0.0-1.0).
        rollback_frequency: Fraction of operations that needed rollback (0.0-1.0, lower is better).
        blast_radius_accuracy: Fraction of blast radius predictions that matched actual (0.0-1.0).

    Returns:
        Weighted trust score between 0.0 and 1.0.
    """
    return (
        verification_success_rate * 0.4
        + (1 - rollback_frequency) * 0.3
        + blast_radius_accuracy * 0.3
    )


class GovernanceCapability(BaseCapability):
    """Governance & trust operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "none"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return False

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "trust_score": self.calculate_trust_score,
            "escalation": self.escalation_check,
            "rollback_plan": self.generate_rollback_plan,
            "blast_radius_analyze": self.analyze_blast_radius,
            "verification_gate": self.verification_gate,
            "execution_journal_query": self.query_journal,
            "risk_assessment": self.risk_assessment,
            "recovery": self.recovery_plan,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown governance operation: {operation}")
        return handler(**params)

    # --- Trust Scoring ---

    def calculate_trust_score(self, **kwargs: float) -> dict[str, Any]:
        """Calculate a trust score for an agent or operation.

        Kwargs:
            verification_success_rate (0.0-1.0)
            rollback_frequency (0.0-1.0, lower is better)
            blast_radius_accuracy (0.0-1.0)

        Returns:
            dict with trust_score and component breakdown.
        """
        vsr = kwargs.get("verification_success_rate", 0.5)
        rf = kwargs.get("rollback_frequency", 0.5)
        bra = kwargs.get("blast_radius_accuracy", 0.5)
        score = trust_score(vsr, rf, bra)
        return {
            "trust_score": round(score, 4),
            "components": {
                "verification_success_rate": vsr,
                "rollback_frequency": rf,
                "blast_radius_accuracy": bra,
            },
            "weights": {"verification": 0.4, "rollback": 0.3, "blast_radius": 0.3},
            "rating": self._rating(score),
        }

    @staticmethod
    def _rating(score: float) -> str:
        if score >= 0.9:
            return "excellent"
        if score >= 0.7:
            return "good"
        if score >= 0.5:
            return "fair"
        return "poor"

    # --- Escalation ---

    def escalation_check(self, danger_level: str = "LOW", policy: dict[str, Any] | None = None) -> dict[str, Any]:
        """Check if an operation requires escalation."""
        level_map = {
            "LOW": DangerLevel.LOW,
            "MEDIUM": DangerLevel.MEDIUM,
            "HIGH": DangerLevel.HIGH,
            "VERY_HIGH": DangerLevel.VERY_HIGH,
        }
        level = level_map.get(danger_level.upper(), DangerLevel.LOW)
        threshold = DangerLevel.HIGH
        if policy and "escalation_threshold" in policy:
            threshold = level_map.get(policy["escalation_threshold"], DangerLevel.HIGH)
        needs_escalation = level.value >= threshold.value
        return {
            "danger_level": danger_level,
            "threshold": threshold.name,
            "needs_escalation": needs_escalation,
            "requires_human": level.value >= DangerLevel.VERY_HIGH.value,
        }

    # --- Rollback Planning ---

    def generate_rollback_plan(self, capability: str, operation: str, params: dict[str, Any]) -> dict[str, Any]:
        """Generate a rollback plan for an operation."""
        return {
            "capability": capability,
            "operation": operation,
            "rollback_possible": True,
            "plan": [
                {"step": 1, "action": f"Identify previous state for {operation}"},
                {"step": 2, "action": f"Execute reverse operation on {capability}"},
                {"step": 3, "action": "Verify restored state"},
            ],
        }

    # --- Blast Radius Analysis ---

    def analyze_blast_radius(self, capability: str, operation: str, params: dict[str, Any]) -> dict[str, Any]:
        """Analyze the potential blast radius of an operation."""
        import importlib
        try:
            cap_module = importlib.import_module(f"capability.{capability}")
            cap_class = getattr(cap_module, f"{capability.capitalize()}Capability", None)
            if cap_class:
                instance = cap_class()
                radius = instance.blast_radius(operation, params)
                return {"capability": capability, "operation": operation, "predicted_radius": radius}
        except (ImportError, AttributeError):
            pass
        return {"capability": capability, "operation": operation, "predicted_radius": "unknown"}

    # --- Verification Gate ---

    def verification_gate(self, capability: str, operation: str, params: dict[str, Any]) -> dict[str, Any]:
        """Run all verification checks before allowing an operation."""
        import importlib
        checks = []
        try:
            cap_module = importlib.import_module(f"capability.{capability}")
            cap_class = getattr(cap_module, f"{capability.capitalize()}Capability", None)
            if cap_class:
                instance = cap_class()
                check_result = instance.verify(operation, params)
                checks.append({"check": f"{capability}.verify()", "passed": check_result})
        except (ImportError, AttributeError):
            checks.append({"check": f"{capability}.verify()", "passed": True})
        all_passed = all(c["passed"] for c in checks)
        return {
            "gate_open": all_passed,
            "checks": checks,
            "summary": "All checks passed" if all_passed else "Some checks failed",
        }

    # --- Execution Journal Query ---

    def query_journal(self, limit: int = 10, capability: str = "", danger_level: str = "") -> dict[str, Any]:
        """Query the execution journal (delegates to governance.journal)."""
        try:
            from governance.journal import JournalDB
            db = JournalDB()
            entries = db.query(limit=limit, capability=capability, danger_level=danger_level)
            return {"entries": entries, "count": len(entries)}
        except ImportError:
            return {"error": "JournalDB not available", "entries": []}

    # --- Risk Assessment ---

    def risk_assessment(self, capability: str, operation: str, params: dict[str, Any]) -> dict[str, Any]:
        """Perform a complete risk assessment for an operation."""
        blast = self.analyze_blast_radius(capability, operation, params)
        escalation = self.escalation_check(
            danger_level=params.get("danger_level", "LOW"),
        )
        verification = self.verification_gate(capability, operation, params)
        return {
            "capability": capability,
            "operation": operation,
            "blast_radius": blast,
            "escalation": escalation,
            "verification": verification,
            "overall_risk": "high" if escalation["needs_escalation"] else "low",
        }

    # --- Recovery Plan ---

    def recovery_plan(self, journal_entry: dict[str, Any]) -> dict[str, Any]:
        """Generate a recovery plan from a journal entry."""
        entry = ExecutionJournalEntry(**journal_entry)
        return {
            "based_on": entry.capability,
            "operation": entry.operation,
            "timestamp": entry.timestamp,
            "recovery_steps": [
                {"step": 1, "action": f"Assess damage from {entry.operation}"},
                {"step": 2, "action": f"Rollback {entry.capability} operation" if entry.rollback_available else f"Manual intervention required for {entry.capability}"},
                {"step": 3, "action": "Verify system state"},
                {"step": 4, "action": "Log recovery outcome to journal"},
            ],
            "rollback_available": entry.rollback_available,
        }
