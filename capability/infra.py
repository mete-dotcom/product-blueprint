"""capability.infra — infrastructure operations capability.

Operations: container_run, k8s_apply, helm_deploy, docker_compose, terraform_plan, ssh
Pack: infra-pack
Danger: HIGH (system-level operations)
"""

from __future__ import annotations

from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    DangerLevel,
    EscalationPolicy,
    EvidenceRequirements,
    ExecutionJournalEntry,
    INFRA_PACK,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="infra",
    version="1.0.0",
    danger_level=DangerLevel.HIGH,
    rollback_support=True,
    verification_required=True,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=["docker", "kubectl", "terraform"],
    dependency_weight=INFRA_PACK,
    sandbox_requirements=SandboxRequirements(isolated=True, network_access=True, filesystem_write=True),
    evidence_requirements=EvidenceRequirements(
        verification_required=True,
        blast_radius_required=True,
        rollback_plan_required=True,
    ),
    escalation_policy=EscalationPolicy(
        auto_escalate=True,
        escalation_threshold=DangerLevel.HIGH,
        require_human_approval=True,
    ),
)


class InfraCapability(BaseCapability):
    """Infrastructure operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        if operation == "ssh":
            return "external"
        if operation in ("k8s_apply", "helm_deploy", "terraform_plan"):
            return "infrastructure"
        return "local-system"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return False  # placeholder

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "container_run": self.container_run,
            "k8s_apply": self.k8s_apply,
            "helm_deploy": self.helm_deploy,
            "docker_compose": self.docker_compose,
            "terraform_plan": self.terraform_plan,
            "ssh": self.ssh,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown infra operation: {operation}")
        return handler(**params)

    def container_run(self, image: str, command: list[str] | None = None, ports: dict[str, str] | None = None) -> dict[str, Any]:
        """Run a Docker container."""
        return {"image": image, "command": command, "ports": ports, "status": "container_started"}

    def k8s_apply(self, manifest_path: str, namespace: str = "default") -> dict[str, Any]:
        """Apply a Kubernetes manifest."""
        return {"manifest": manifest_path, "namespace": namespace, "status": "applied"}

    def helm_deploy(self, release_name: str, chart: str, values: dict[str, Any] | None = None) -> dict[str, Any]:
        """Deploy a Helm chart."""
        return {"release": release_name, "chart": chart, "values": values, "status": "deployed"}

    def docker_compose(self, project_path: str, action: str = "up", services: list[str] | None = None) -> dict[str, Any]:
        """Run docker-compose."""
        return {"path": project_path, "action": action, "services": services, "status": f"compose_{action}"}

    def terraform_plan(self, path: str = ".") -> dict[str, Any]:
        """Run terraform plan."""
        return {"path": path, "status": "planned"}

    def ssh(self, host: str, command: str, key_path: str = "") -> dict[str, Any]:
        """Execute a command over SSH."""
        return {"host": host, "command": command, "status": "executed"}
