"""capability.filesystem — filesystem operations capability.

Operations: read, write, move, diff, archive, compress, snapshot, search, list
Pack: core-pack
Danger: MEDIUM (write/delete operations)
"""

from __future__ import annotations

import difflib
import filecmp
import hashlib
import json
import os
import shutil
import tarfile
import zipfile
from pathlib import Path
from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    CORE_PACK,
    DangerLevel,
    EscalationPolicy,
    EvidenceRequirements,
    ExecutionJournalEntry,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="filesystem",
    version="1.0.0",
    danger_level=DangerLevel.MEDIUM,
    rollback_support=True,
    verification_required=True,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=[],
    dependency_weight=CORE_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False, filesystem_write=True),
    evidence_requirements=EvidenceRequirements(
        verification_required=True,
        blast_radius_required=True,
        rollback_plan_required=True,
    ),
    escalation_policy=EscalationPolicy(escalation_threshold=DangerLevel.HIGH),
)


class FilesystemCapability(BaseCapability):
    """Filesystem operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        path = params.get("path", "")
        if operation in ("write", "move", "delete"):
            if not path or not os.path.exists(os.path.dirname(os.path.abspath(path))):
                return False
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        path = params.get("path", "")
        if operation == "snapshot":
            return "repository"
        if operation in ("archive", "compress"):
            return "multi-file"
        if operation in ("write", "move", "delete"):
            return "single-file" if os.path.isfile(path) else "multi-file"
        return "none"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        metadata = journal_entry.metadata
        if "backup_path" in metadata and "original_path" in metadata:
            shutil.copy2(metadata["backup_path"], metadata["original_path"])
            return True
        return False

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "read": self.read_file,
            "write": self.write_file,
            "move": self.move,
            "diff": self.diff_files,
            "archive": self.archive,
            "compress": self.compress,
            "snapshot": self.snapshot,
            "search": self.search,
            "list": self.list_dir,
            "delete": self.delete,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown filesystem operation: {operation}")
        return handler(**params)

    def read_file(self, path: str, start: int = 1, end: int | None = None) -> dict[str, Any]:
        """Read file contents, optionally a line range."""
        lines = Path(path).read_text(encoding="utf-8").splitlines(keepends=True)
        if end is not None:
            lines = lines[start - 1 : end]
        else:
            lines = lines[start - 1 :]
        return {"content": "".join(lines), "total_lines": len(lines)}

    def write_file(self, path: str, content: str, create_backup: bool = True) -> dict[str, Any]:
        """Write content to a file with optional backup."""
        path_obj = Path(path)
        backup_path = None
        if create_backup and path_obj.exists():
            backup_path = str(path_obj.with_suffix(path_obj.suffix + ".bak"))
            shutil.copy2(path, backup_path)
        path_obj.parent.mkdir(parents=True, exist_ok=True)
        path_obj.write_text(content, encoding="utf-8")
        return {"path": path, "bytes_written": len(content.encode("utf-8")), "backup_path": backup_path}

    def move(self, source: str, destination: str, overwrite: bool = False) -> dict[str, Any]:
        """Move/rename a file or directory."""
        if not overwrite and os.path.exists(destination):
            return {"error": "Destination exists", "success": False}
        shutil.move(source, destination)
        return {"source": source, "destination": destination, "success": True}

    def diff_files(self, path1: str, path2: str) -> dict[str, Any]:
        """Compare two files, return unified diff."""
        text1 = Path(path1).read_text(encoding="utf-8").splitlines(keepends=True)
        text2 = Path(path2).read_text(encoding="utf-8").splitlines(keepends=True)
        diff = list(difflib.unified_diff(text1, text2, fromfile=path1, tofile=path2))
        return {"diff": "".join(diff), "lines_changed": len(diff)}

    def archive(self, source: str, output: str, format: str = "zip") -> dict[str, Any]:
        """Create an archive (zip or tar)."""
        if format == "zip":
            with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as zf:
                if os.path.isdir(source):
                    for root, _, files in os.walk(source):
                        for fn in files:
                            zf.write(os.path.join(root, fn))
                else:
                    zf.write(source)
        elif format in ("tar", "gz", "bz2"):
            mode = f"w:{format}" if format in ("gz", "bz2") else "w"
            with tarfile.open(output, mode) as tf:
                tf.add(source)
        else:
            return {"error": f"Unsupported format: {format}"}
        return {"output": output, "format": format}

    def compress(self, path: str) -> dict[str, Any]:
        """Compress a file using gzip."""
        import gzip
        output = path + ".gz"
        with open(path, "rb") as f_in:
            with gzip.open(output, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)
        return {"input": path, "output": output}

    def snapshot(self, path: str = ".") -> dict[str, Any]:
        """Create a content-addressed snapshot of a directory."""
        snapshot: dict[str, str] = {}
        for root, _, files in os.walk(path):
            for fn in files:
                fpath = os.path.join(root, fn)
                try:
                    h = hashlib.sha256(Path(fpath).read_bytes()).hexdigest()
                    snapshot[fpath] = h
                except (OSError, PermissionError):
                    continue
        return {"files": len(snapshot), "snapshot": snapshot}

    def search(self, pattern: str, path: str = ".", file_pattern: str = "*") -> dict[str, Any]:
        """Search files using ripgrep or fallback."""
        import subprocess
        try:
            result = subprocess.run(
                ["rg", "-n", pattern, path, "-g", file_pattern],
                capture_output=True, text=True,
            )
            return {"matches": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except FileNotFoundError:
            return {"error": "ripgrep not installed"}

    def list_dir(self, path: str = ".") -> dict[str, Any]:
        """List directory contents."""
        entries = sorted(os.listdir(path))
        details = []
        for entry in entries:
            full = os.path.join(path, entry)
            details.append({
                "name": entry,
                "type": "dir" if os.path.isdir(full) else "file",
                "size": os.path.getsize(full) if os.path.isfile(full) else 0,
            })
        return {"path": path, "entries": details, "count": len(details)}

    def delete(self, path: str, recursive: bool = False, backup: bool = True) -> dict[str, Any]:
        """Delete a file or directory."""
        backup_path = None
        if backup and os.path.exists(path):
            backup_path = path + ".deleted-backup"
            if os.path.isdir(path):
                shutil.copytree(path, backup_path)
            else:
                shutil.copy2(path, backup_path)

        if os.path.isdir(path) and recursive:
            shutil.rmtree(path)
        elif os.path.isfile(path):
            os.remove(path)
        else:
            return {"error": "Path does not exist", "success": False}

        return {"path": path, "deleted": True, "backup_path": backup_path}
