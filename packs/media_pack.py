"""packs.media_pack — media & document dependency pack.

Requires (optional): Pillow, PyMuPDF, python-docx
"""

from __future__ import annotations

PACK_NAME = "media-pack"
PACK_VERSION = "1.0.0"
PACK_DESCRIPTION = "Media processing and document operations"
DEPENDENCIES = ["Pillow", "PyMuPDF", "python-docx"]  # optional

CAPABILITIES = [
    "capability.media",
    "capability.document",
]


def _check_import(module: str) -> bool:
    try:
        __import__(module)
        return True
    except ImportError:
        return False


def check_available() -> bool:
    """Check if at least Pillow is available."""
    return _check_import("PIL")


def get_version() -> str:
    versions = []
    if _check_import("PIL"):
        from PIL import __version__ as pil_ver
        versions.append(f"Pillow={pil_ver}")
    if _check_import("docx"):
        import docx  # noqa: F401
        versions.append("python-docx=available")
    return ", ".join(versions) if versions else "not-installed"
