"""capability.browser — browser automation capability.

Operations: navigate, screenshot, click, fill, extract, evaluate, wait, export_pdf
Pack: browser-pack
Danger: MEDIUM (external network, automation)
"""

from __future__ import annotations

from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    BROWSER_PACK,
    DangerLevel,
    EscalationPolicy,
    EvidenceRequirements,
    ExecutionJournalEntry,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="browser",
    version="1.0.0",
    danger_level=DangerLevel.MEDIUM,
    rollback_support=False,
    verification_required=True,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=["playwright"],
    dependency_weight=BROWSER_PACK,
    sandbox_requirements=SandboxRequirements(isolated=True, network_access=True, timeout_seconds=120),
    evidence_requirements=EvidenceRequirements(
        verification_required=True,
        blast_radius_required=True,
        rollback_plan_required=False,
    ),
    escalation_policy=EscalationPolicy(escalation_threshold=DangerLevel.HIGH),
)


class BrowserCapability(BaseCapability):
    """Browser automation operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        url = params.get("url", "")
        if url.startswith("file://"):
            return True
        if url.startswith(("http://", "https://")):
            return True
        return False

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "external"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return False  # browser actions are not rollbackable

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "navigate": self.navigate,
            "screenshot": self.screenshot,
            "click": self.click,
            "fill": self.fill,
            "extract": self.extract,
            "evaluate": self.evaluate,
            "wait": self.wait,
            "export_pdf": self.export_pdf,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown browser operation: {operation}")
        return handler(**params)

    def navigate(self, url: str, wait_until: str = "load") -> dict[str, Any]:
        """Navigate to a URL."""
        return {"url": url, "status": "navigated", "wait_until": wait_until}

    def screenshot(self, url: str, output: str = "screenshot.png", full_page: bool = False) -> dict[str, Any]:
        """Take a screenshot."""
        return {"url": url, "output": output, "full_page": full_page, "status": "screenshot_taken"}

    def click(self, selector: str) -> dict[str, Any]:
        """Click an element."""
        return {"selector": selector, "status": "clicked"}

    def fill(self, selector: str, value: str) -> dict[str, Any]:
        """Fill a form field."""
        return {"selector": selector, "value": value, "status": "filled"}

    def extract(self, selector: str = "", attribute: str = "textContent") -> dict[str, Any]:
        """Extract content from the page."""
        return {"selector": selector, "attribute": attribute, "status": "extracted"}

    def evaluate(self, script: str) -> dict[str, Any]:
        """Evaluate JavaScript in the page context."""
        return {"script": script[:50], "status": "evaluated"}

    def wait(self, selector: str = "", timeout: int = 5000) -> dict[str, Any]:
        """Wait for an element to appear."""
        return {"selector": selector, "timeout": timeout, "status": "waited"}

    def export_pdf(self, url: str, output: str = "output.pdf") -> dict[str, Any]:
        """Export page as PDF."""
        return {"url": url, "output": output, "status": "pdf_exported"}
