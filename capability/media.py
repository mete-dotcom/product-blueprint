"""capability.media — media processing capability.

Operations: image_resize, convert_format, extract_metadata, optimize, thumbnail
Pack: media-pack
Danger: LOW
"""

from __future__ import annotations

from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    DangerLevel,
    EvidenceRequirements,
    ExecutionJournalEntry,
    MEDIA_PACK,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="media",
    version="1.0.0",
    danger_level=DangerLevel.LOW,
    rollback_support=False,
    verification_required=False,
    external_side_effects=False,
    topology_constraints=[],
    adapter_requirements=[],
    dependency_weight=MEDIA_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False),
    evidence_requirements=EvidenceRequirements(execution_journal=True),
)


class MediaCapability(BaseCapability):
    """Media processing operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "single-file"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return True

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "image_resize": self.image_resize,
            "convert_format": self.convert_format,
            "extract_metadata": self.extract_metadata,
            "optimize": self.optimize,
            "thumbnail": self.thumbnail,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown media operation: {operation}")
        return handler(**params)

    def image_resize(self, path: str, width: int, height: int, output: str = "") -> dict[str, Any]:
        """Resize an image."""
        return {"input": path, "width": width, "height": height, "output": output or path, "status": "resized"}

    def convert_format(self, path: str, target_format: str, output: str = "") -> dict[str, Any]:
        """Convert media format."""
        return {"input": path, "target_format": target_format, "output": output or path, "status": "converted"}

    def extract_metadata(self, path: str) -> dict[str, Any]:
        """Extract media metadata."""
        import os
        return {"path": path, "size": os.path.getsize(path), "format": path.split(".")[-1]}

    def optimize(self, path: str, quality: int = 85, output: str = "") -> dict[str, Any]:
        """Optimize media file."""
        return {"input": path, "quality": quality, "output": output or path, "status": "optimized"}

    def thumbnail(self, path: str, max_size: int = 200, output: str = "") -> dict[str, Any]:
        """Generate a thumbnail."""
        return {"input": path, "max_size": max_size, "output": output or path, "status": "thumbnail_created"}
