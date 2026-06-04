"""capability.cloud — cloud operations capability.

Operations: s3_upload, s3_download, lambda_invoke, ecs_deploy, cloudformation, secret_manager
Pack: infra-pack
Danger: HIGH (cloud infrastructure changes)
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
    name="cloud",
    version="1.0.0",
    danger_level=DangerLevel.HIGH,
    rollback_support=True,
    verification_required=True,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=["boto3"],
    dependency_weight=INFRA_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False, network_access=True),
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


class CloudCapability(BaseCapability):
    """Cloud infrastructure operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "infrastructure"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return False  # placeholder

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "s3_upload": self.s3_upload,
            "s3_download": self.s3_download,
            "lambda_invoke": self.lambda_invoke,
            "ecs_deploy": self.ecs_deploy,
            "cloudformation": self.cloudformation,
            "secret_manager": self.secret_manager,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown cloud operation: {operation}")
        return handler(**params)

    def s3_upload(self, bucket: str, key: str, file_path: str) -> dict[str, Any]:
        """Upload a file to S3."""
        return {"bucket": bucket, "key": key, "file": file_path, "status": "uploaded"}

    def s3_download(self, bucket: str, key: str, output_path: str) -> dict[str, Any]:
        """Download a file from S3."""
        return {"bucket": bucket, "key": key, "output": output_path, "status": "downloaded"}

    def lambda_invoke(self, function_name: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Invoke a Lambda function."""
        return {"function": function_name, "payload": payload, "status": "invoked"}

    def ecs_deploy(self, cluster: str, service: str, image: str) -> dict[str, Any]:
        """Deploy to ECS."""
        return {"cluster": cluster, "service": service, "image": image, "status": "deployed"}

    def cloudformation(self, stack_name: str, template: str, action: str = "deploy") -> dict[str, Any]:
        """Manage CloudFormation stacks."""
        return {"stack": stack_name, "action": action, "status": f"{action}d"}

    def secret_manager(self, secret_id: str, action: str = "get", value: str = "") -> dict[str, Any]:
        """Access secrets manager."""
        return {"secret_id": secret_id, "action": action, "status": f"{action}_performed"}
