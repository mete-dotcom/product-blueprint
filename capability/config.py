"""capability.config — configuration management capability.

Operations: get, set, list, validate, import_env, export_env, schema_validate
Pack: core-pack
Danger: LOW
"""

from __future__ import annotations

import json
import os
from pathlib import Path
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
    name="config",
    version="1.0.0",
    danger_level=DangerLevel.LOW,
    rollback_support=True,
    verification_required=False,
    external_side_effects=False,
    topology_constraints=[],
    adapter_requirements=[],
    dependency_weight=CORE_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False),
    evidence_requirements=EvidenceRequirements(execution_journal=True),
)


class ConfigCapability(BaseCapability):
    """Configuration management operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "single-file"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        metadata = journal_entry.metadata
        if "backup_config" in metadata:
            path = metadata.get("path", "")
            Path(path).write_text(json.dumps(metadata["backup_config"], indent=2))
            return True
        return False

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "get": self.get,
            "set": self.set,
            "list": self.list_config,
            "validate": self.validate,
            "import_env": self.import_env,
            "export_env": self.export_env,
            "schema_validate": self.schema_validate,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown config operation: {operation}")
        return handler(**params)

    def get(self, key: str, default: Any = None, source: str = "config.json") -> Any:
        """Get a config value."""
        path = Path(source)
        if not path.exists():
            return default
        config = json.loads(path.read_text())
        return config.get(key, default)

    def set(self, key: str, value: Any, source: str = "config.json") -> dict[str, Any]:
        """Set a config value with backup."""
        path = Path(source)
        backup = None
        if path.exists():
            backup = json.loads(path.read_text())
        config = backup or {}
        config[key] = value
        path.write_text(json.dumps(config, indent=2))
        return {"key": key, "value": value, "source": source, "backup_config": backup}

    def list_config(self, source: str = "config.json") -> dict[str, Any]:
        """List all config values."""
        path = Path(source)
        if not path.exists():
            return {"source": source, "config": {}, "error": "File not found"}
        return {"source": source, "config": json.loads(path.read_text())}

    def validate(self, source: str = "config.json", schema: dict[str, Any] | None = None) -> dict[str, Any]:
        """Validate config against a schema."""
        if schema is None:
            return {"source": source, "valid": True}
        path = Path(source)
        if not path.exists():
            return {"source": source, "valid": False, "error": "File not found"}
        config = json.loads(path.read_text())
        errors = []
        for key, expected_type in schema.items():
            if key in config:
                if not isinstance(config[key], expected_type):
                    errors.append(f"{key}: expected {expected_type.__name__}, got {type(config[key]).__name__}")
        return {"source": source, "valid": len(errors) == 0, "errors": errors}

    def import_env(self, env_file: str = ".env") -> dict[str, Any]:
        """Import environment variables from a .env file."""
        path = Path(env_file)
        if not path.exists():
            return {"env_file": env_file, "imported": 0}
        count = 0
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                os.environ[key.strip()] = val.strip().strip("\"'")
                count += 1
        return {"env_file": env_file, "imported": count}

    def export_env(self, env_file: str = ".env", keys: list[str] | None = None) -> dict[str, Any]:
        """Export environment variables to a .env file."""
        export_keys = keys or list(os.environ.keys())
        lines = [f"{k}={os.environ[k]}" for k in export_keys if k in os.environ]
        Path(env_file).write_text("\n".join(lines) + "\n")
        return {"env_file": env_file, "exported": len(lines)}

    def schema_validate(self, data: dict[str, Any], schema: dict[str, Any]) -> dict[str, Any]:
        """Validate a dictionary against a JSON-like schema."""
        return self.validate(source="", schema=schema)
