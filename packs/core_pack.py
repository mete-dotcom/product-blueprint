"""packs.core_pack — core dependency pack.

Zero external dependencies. Always available.
Includes: filesystem, execution, verification, config capabilities.
"""

from __future__ import annotations

PACK_NAME = "core-pack"
PACK_VERSION = "1.0.0"
PACK_DESCRIPTION = "Core deepstrain capabilities (always available)"
DEPENDENCIES: list[str] = []  # stdlib only, zero external deps

CAPABILITIES = [
    "capability.filesystem",
    "capability.execution",
    "capability.verification",
    "capability.config",
    "capability.governance",
]


def check_available() -> bool:
    """Check if the core pack is available (always True)."""
    return True


def get_version() -> str:
    return PACK_VERSION
