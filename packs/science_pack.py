"""packs.science_pack — science & math dependency pack.

Requires (optional): numpy, scipy, sentence-transformers, onnxruntime
"""

from __future__ import annotations

PACK_NAME = "science-pack"
PACK_VERSION = "1.0.0"
PACK_DESCRIPTION = "Mathematical, statistical, and NLP operations"
DEPENDENCIES = ["numpy", "scipy", "sentence-transformers", "onnxruntime"]  # optional

CAPABILITIES = [
    "capability.math",
    "capability.nlp",
]


def _check_import(module: str) -> bool:
    try:
        __import__(module)
        return True
    except ImportError:
        return False


def check_available() -> bool:
    """Check if numpy is available (minimum for science pack)."""
    return _check_import("numpy")


def get_version() -> str:
    versions = []
    if _check_import("numpy"):
        import numpy as np
        versions.append(f"numpy={np.__version__}")
    if _check_import("scipy"):
        import scipy
        versions.append(f"scipy={scipy.__version__}")
    if _check_import("sentence_transformers"):
        import sentence_transformers
        versions.append(f"sentence-transformers={sentence_transformers.__version__}")
    if _check_import("onnxruntime"):
        import onnxruntime
        versions.append(f"onnxruntime={onnxruntime.__version__}")
    return ", ".join(versions) if versions else "not-installed"
