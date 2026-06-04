"""packs.git_pack — Git lifecycle dependency pack.

Requires: git (system binary)
Optional: pygit2 (faster git operations via libgit2)
"""

from __future__ import annotations

import subprocess

PACK_NAME = "git-pack"
PACK_VERSION = "1.0.0"
PACK_DESCRIPTION = "Git lifecycle operations (requires git system binary)"
DEPENDENCIES = ["pygit2"]  # optional, not required

CAPABILITIES = [
    "capability.git",
]

# Import guard
_GIT_AVAILABLE: bool | None = None


def check_available() -> bool:
    """Check if git is available on the system."""
    global _GIT_AVAILABLE
    if _GIT_AVAILABLE is not None:
        return _GIT_AVAILABLE
    try:
        result = subprocess.run(["git", "--version"], capture_output=True, text=True)
        _GIT_AVAILABLE = result.returncode == 0
    except FileNotFoundError:
        _GIT_AVAILABLE = False
    return _GIT_AVAILABLE


def get_version() -> str:
    """Get git version."""
    try:
        result = subprocess.run(["git", "--version"], capture_output=True, text=True)
        return result.stdout.strip()
    except FileNotFoundError:
        return "not-installed"
