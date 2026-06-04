"""deepstrain.capability — 18 canonical capability domains.

Every capability is:
  - topology-blind (no knowledge of other capabilities)
  - dependency-flat (stdlib + explicit pack deps only)
  - self-verifying (implements verify() and blast_radius())
  - governance-aware (reports to ExecutionJournal)

Pack system (binary bloat solution):
  core-pack | git-pack | infra-pack | browser-pack | media-pack | science-pack

Nuitka-compatible: dynamic imports minimized, stdlib preferred.
"""

from __future__ import annotations

from capability.contracts import (
    BaseAdapter,
    BaseCapability,
    CapabilityManifest,
    DangerLevel,
    EscalationPolicy,
    EvidenceRequirements,
    ExecutionJournalEntry,
    SandboxRequirements,
)

__all__ = [
    "BaseAdapter",
    "BaseCapability",
    "CapabilityManifest",
    "DangerLevel",
    "EscalationPolicy",
    "EvidenceRequirements",
    "ExecutionJournalEntry",
    "SandboxRequirements",
]
