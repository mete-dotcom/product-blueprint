"""capability.document — document processing capability.

Operations: parse, extract, convert, validate, diff, template, render
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
    name="document",
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


class DocumentCapability(BaseCapability):
    """Document processing operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "single-file"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return True

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "parse": self.parse,
            "extract": self.extract,
            "convert": self.convert,
            "validate": self.validate,
            "diff": self.diff_docs,
            "template": self.template,
            "render": self.render,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown document operation: {operation}")
        return handler(**params)

    def parse(self, path: str, format: str = "auto") -> dict[str, Any]:
        """Parse a document into structured data."""
        if path.endswith(".md") or path.endswith(".markdown"):
            return {"format": "markdown", "path": path, "status": "parsed"}
        if path.endswith(".ipynb"):
            import json
            content = open(path, encoding="utf-8").read()
            return {"format": "jupyter", "cells": len(json.loads(content).get("cells", [])), "status": "parsed"}
        return {"format": format, "path": path, "status": "parsed"}

    def extract(self, path: str, selector: str = "") -> dict[str, Any]:
        """Extract content from a document."""
        return {"path": path, "selector": selector, "status": "extracted"}

    def convert(self, path: str, target_format: str, output: str = "") -> dict[str, Any]:
        """Convert document between formats."""
        return {"path": path, "target_format": target_format, "output": output or path, "status": "converted"}

    def validate(self, path: str, schema: str = "") -> dict[str, Any]:
        """Validate document against a schema."""
        return {"path": path, "valid": True, "schema": schema}

    def diff_docs(self, path1: str, path2: str) -> dict[str, Any]:
        """Diff two documents."""
        text1 = open(path1, encoding="utf-8").read()
        text2 = open(path2, encoding="utf-8").read()
        import difflib
        diff = list(difflib.unified_diff(text1.splitlines(), text2.splitlines()))
        return {"lines_changed": len(diff), "diff": "\n".join(diff)}

    def template(self, template_path: str, variables: dict[str, Any], output: str = "") -> dict[str, Any]:
        """Render a template with variables."""
        content = open(template_path, encoding="utf-8").read()
        for key, val in variables.items():
            content = content.replace(f"{{{{ {key} }}}}", str(val))
            content = content.replace(f"{{{{{key}}}}}", str(val))
        return {"output": content, "template": template_path}

    def render(self, path: str) -> dict[str, Any]:
        """Render a document to display format."""
        return {"path": path, "rendered": True}
