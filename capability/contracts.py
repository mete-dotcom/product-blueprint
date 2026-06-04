"""capability.contracts — base types for the capability framework.

Zero external dependencies. stdlib only. Nuitka-compatible.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any


class DangerLevel(Enum):
    """Danger level for an operation."""

    LOW = 1
    MEDIUM = 2
    HIGH = 3
    VERY_HIGH = 4


@dataclass
class SandboxRequirements:
    """Requirements for sandboxing an operation."""

    isolated: bool = False
    network_access: bool = True
    filesystem_write: bool = True
    timeout_seconds: int = 300


@dataclass
class EvidenceRequirements:
    """What evidence must be collected before/after execution."""

    verification_required: bool = False
    blast_radius_required: bool = False
    rollback_plan_required: bool = False
    execution_journal: bool = True


@dataclass
class EscalationPolicy:
    """Policy for human escalation."""

    auto_escalate: bool = True
    escalation_threshold: DangerLevel = DangerLevel.HIGH
    require_human_approval: bool = False
    max_retries: int = 3


# Typed pack names
CORE_PACK = "core-pack"
GIT_PACK = "git-pack"
INFRA_PACK = "infra-pack"
BROWSER_PACK = "browser-pack"
MEDIA_PACK = "media-pack"
SCIENCE_PACK = "science-pack"

PackName = str  # one of the above constants


@dataclass
class CapabilityManifest:
    """Declarative manifest for a capability domain.

    Every capability module MUST export a MANIFEST constant.
    This is the single source of truth for routing, sandboxing, and governance.
    """

    name: str
    version: str
    danger_level: DangerLevel
    rollback_support: bool
    verification_required: bool
    external_side_effects: bool
    topology_constraints: list[str]
    adapter_requirements: list[str]
    dependency_weight: PackName
    sandbox_requirements: SandboxRequirements = field(default_factory=SandboxRequirements)
    evidence_requirements: EvidenceRequirements = field(default_factory=EvidenceRequirements)
    escalation_policy: EscalationPolicy = field(default_factory=EscalationPolicy)

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "version": self.version,
            "danger_level": self.danger_level.name,
            "rollback_support": self.rollback_support,
            "verification_required": self.verification_required,
            "external_side_effects": self.external_side_effects,
            "dependency_weight": self.dependency_weight,
        }


@dataclass
class ExecutionJournalEntry:
    """A single entry in the execution journal.

    Persisted to SQLite by governance.journal.
    """

    timestamp: str
    capability: str
    operation: str
    danger_level: str
    blast_radius_predicted: str
    blast_radius_actual: str
    verification_result: bool | None
    rollback_available: bool
    evidence_hash: str
    metadata: dict[str, Any] = field(default_factory=dict)

    def compute_evidence_hash(self) -> str:
        """SHA-256 hash of the entry's core fields for tamper evidence."""
        payload = json.dumps(
            {
                "timestamp": self.timestamp,
                "capability": self.capability,
                "operation": self.operation,
                "danger_level": self.danger_level,
                "blast_radius_predicted": self.blast_radius_predicted,
            },
            sort_keys=True,
            default=str,
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class BaseCapability:
    """Abstract base for all capability domains.

    Every concrete capability:
      1. Declares a MANIFEST class attribute (CapabilityManifest)
      2. Implements execute() (the actual operation)
      3. Implements verify() (pre/post verification)
      4. Implements blast_radius() (prediction of impact scope)
      5. Implements rollback() (undo operation, if supported)
    """

    manifest: CapabilityManifest

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        """Verify that an operation is safe to execute.

        Returns True if verification passes, False otherwise.
        """
        raise NotImplementedError(f"{type(self).__name__}.verify() not implemented")

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        """Predict the blast radius of an operation.

        Returns a human-readable string like "single-file" | "multi-file" | "repository" | "external".
        """
        raise NotImplementedError(f"{type(self).__name__}.blast_radius() not implemented")

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        """Rollback a previously executed operation.

        Returns True if rollback was successful.
        """
        raise NotImplementedError(f"{type(self).__name__}.rollback() not implemented")

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        """Execute a capability operation.

        This is the main entry point.
        """
        raise NotImplementedError(f"{type(self).__name__}.execute() not implemented")

    def list_operations(self) -> list[str]:
        """Return all operation names this capability supports."""
        return [m for m in dir(type(self)) if not m.startswith("_") and callable(getattr(type(self), m))]


class BaseAdapter:
    """Runtime-specific logic lives here, not in capability.

    Adapters translate capability operations to runtime-specific calls
    (e.g., local subprocess, MCP server, Docker container).
    """

    def run(self, command: list[str], **kwargs: Any) -> Any:
        raise NotImplementedError(f"{type(self).__name__}.run() not implemented")
