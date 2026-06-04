"""capability.notification — notification & messaging capability.

Operations: send_email, send_slack, send_discord, send_webhook, log, alert
Pack: core-pack
Danger: LOW
"""

from __future__ import annotations

import json
import smtplib
import urllib.request
from email.mime.text import MIMEText
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
    name="notification",
    version="1.0.0",
    danger_level=DangerLevel.LOW,
    rollback_support=False,
    verification_required=False,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=[],
    dependency_weight=CORE_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False, network_access=True),
    evidence_requirements=EvidenceRequirements(execution_journal=True),
)


class NotificationCapability(BaseCapability):
    """Notification operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "external"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return False

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "send_email": self.send_email,
            "send_slack": self.send_slack,
            "send_discord": self.send_discord,
            "send_webhook": self.send_webhook,
            "log": self.log,
            "alert": self.alert,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown notification operation: {operation}")
        return handler(**params)

    def send_email(self, to: str, subject: str, body: str, smtp_server: str = "localhost", port: int = 25) -> dict[str, Any]:
        """Send an email."""
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["To"] = to
        try:
            with smtplib.SMTP(smtp_server, port, timeout=10) as s:
                s.send_message(msg)
            return {"to": to, "subject": subject, "status": "sent"}
        except Exception as e:
            return {"to": to, "subject": subject, "error": str(e), "status": "failed"}

    def send_slack(self, webhook_url: str, message: str, channel: str = "") -> dict[str, Any]:
        """Send a Slack message via webhook."""
        payload = {"text": message}
        if channel:
            payload["channel"] = channel
        data = json.dumps(payload).encode("utf-8")
        try:
            req = urllib.request.Request(webhook_url, data=data, headers={"Content-Type": "application/json"})
            urllib.request.urlopen(req, timeout=10)
            return {"status": "sent", "message": message[:50]}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    def send_discord(self, webhook_url: str, content: str) -> dict[str, Any]:
        """Send a Discord message via webhook."""
        return self.send_webhook(webhook_url, {"content": content})

    def send_webhook(self, url: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Send a generic webhook."""
        data = json.dumps(payload).encode("utf-8")
        try:
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
            urllib.request.urlopen(req, timeout=10)
            return {"url": url, "status": "sent"}
        except Exception as e:
            return {"url": url, "status": "failed", "error": str(e)}

    def log(self, level: str = "info", message: str = "", source: str = "") -> dict[str, Any]:
        """Log a message."""
        import logging
        logger = logging.getLogger(source or "deepstrain")
        getattr(logger, level.lower(), logger.info)(message)
        return {"level": level, "message": message, "logged": True}

    def alert(self, severity: str = "warning", message: str = "", channels: list[str] | None = None) -> dict[str, Any]:
        """Send an alert through all configured channels."""
        results: dict[str, Any] = {}
        if channels is None:
            channels = ["log"]
        if "log" in channels:
            results["log"] = self.log(level="ERROR" if severity == "critical" else "WARNING", message=message)
        return {"severity": severity, "message": message, "results": results}
