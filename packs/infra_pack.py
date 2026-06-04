"""packs.infra_pack — infrastructure dependency pack.

Requires (optional): docker, kubectl, terraform, boto3
"""

from __future__ import annotations

import shutil

PACK_NAME = "infra-pack"
PACK_VERSION = "1.0.0"
PACK_DESCRIPTION = "Infrastructure, database, cloud, and container operations"
DEPENDENCIES = ["boto3", "kubernetes"]  # optional

CAPABILITIES = [
    "capability.infra",
    "capability.database",
    "capability.cloud",
    "capability.security",
]

# Lazy availability checks
_BINARY_CACHE: dict[str, bool] = {}


def _binary_available(name: str) -> bool:
    if name not in _BINARY_CACHE:
        _BINARY_CACHE[name] = shutil.which(name) is not None
    return _BINARY_CACHE[name]


def check_available() -> bool:
    """Check if at least some infra tools are available."""
    return any(_binary_available(t) for t in ["docker", "kubectl", "terraform"])


def get_version() -> str:
    versions = []
    for tool in ["docker", "kubectl", "terraform", "helm"]:
        if _binary_available(tool):
            import subprocess
            try:
                result = subprocess.run([tool, "version"], capture_output=True, text=True, timeout=5)
                versions.append(f"{tool}={result.stdout[:50].strip()}")
            except Exception:
                versions.append(f"{tool}=unknown")
    return ", ".join(versions) if versions else "not-installed"
