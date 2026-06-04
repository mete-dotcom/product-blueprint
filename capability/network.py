"""capability.network — network operations capability.

Operations: http_request, ping, dns_lookup, download, websocket, scrape
Pack: browser-pack
Danger: MEDIUM (external network access)
"""

from __future__ import annotations

from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    BROWSER_PACK,
    DangerLevel,
    EvidenceRequirements,
    ExecutionJournalEntry,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="network",
    version="1.0.0",
    danger_level=DangerLevel.MEDIUM,
    rollback_support=False,
    verification_required=True,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=[],
    dependency_weight=BROWSER_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False, network_access=True),
    evidence_requirements=EvidenceRequirements(verification_required=True, blast_radius_required=True),
)


class NetworkCapability(BaseCapability):
    """Network operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        url = params.get("url", "")
        if isinstance(url, str) and url.startswith(("http://", "https://")):
            return True
        return operation in ("ping", "dns_lookup")

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "external"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return False

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "http_request": self.http_request,
            "ping": self.ping,
            "dns_lookup": self.dns_lookup,
            "download": self.download,
            "websocket": self.websocket,
            "scrape": self.scrape,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown network operation: {operation}")
        return handler(**params)

    def http_request(self, url: str, method: str = "GET", headers: dict[str, str] | None = None, data: Any = None) -> dict[str, Any]:
        """Make an HTTP request using urllib (stdlib)."""
        import json as _json
        import urllib.request
        import urllib.error

        req = urllib.request.Request(url, method=method, data=data, headers=headers or {})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode("utf-8", errors="replace")
                return {"status": resp.status, "body": body, "headers": dict(resp.headers)}
        except urllib.error.HTTPError as e:
            return {"status": e.code, "body": e.read().decode("utf-8", errors="replace"), "error": str(e)}
        except Exception as e:
            return {"error": str(e)}

    def ping(self, host: str, count: int = 3) -> dict[str, Any]:
        """Ping a host."""
        import subprocess
        result = subprocess.run(["ping", "-n", str(count), host], capture_output=True, text=True)
        return {"host": host, "stdout": result.stdout, "returncode": result.returncode}

    def dns_lookup(self, host: str) -> dict[str, Any]:
        """DNS lookup."""
        import socket
        try:
            ip = socket.gethostbyname(host)
            return {"host": host, "ip": ip}
        except socket.gaierror as e:
            return {"host": host, "error": str(e)}

    def download(self, url: str, output_path: str = "") -> dict[str, Any]:
        """Download a file."""
        import urllib.request
        path = output_path or url.split("/")[-1]
        urllib.request.urlretrieve(url, path)
        import os
        return {"url": url, "output": path, "size": os.path.getsize(path)}

    def websocket(self, url: str, message: str = "") -> dict[str, Any]:
        """WebSocket operation (placeholder)."""
        return {"url": url, "status": "websocket_not_available_without_third_party"}

    def scrape(self, url: str, selector: str = "") -> dict[str, Any]:
        """Simple HTML scraping using stdlib."""
        import html.parser
        result = self.http_request(url)
        return {"url": url, "selector": selector, "body_size": len(result.get("body", "")), "status": "scraped"}
