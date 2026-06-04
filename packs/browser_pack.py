"""packs.browser_pack — browser & network dependency pack.

Requires: playwright (optional)
"""

from __future__ import annotations

PACK_NAME = "browser-pack"
PACK_VERSION = "1.0.0"
PACK_DESCRIPTION = "Browser automation and network operations"
DEPENDENCIES = ["playwright"]  # optional, heavy

CAPABILITIES = [
    "capability.browser",
    "capability.network",
]


def _import_playwright() -> bool:
    try:
        import playwright  # noqa: F401
        return True
    except ImportError:
        return False


def check_available() -> bool:
    """Check if playwright is available."""
    return _import_playwright()


def get_version() -> str:
    try:
        import playwright
        v = getattr(playwright, "__version__", "unknown")
        return f"playwright={v}"
    except ImportError:
        return "not-installed"
