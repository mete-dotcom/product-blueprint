"""capability.database — database operations capability.

Operations: query, migrate, backup, restore, seed, schema_inspect, index_optimize
Pack: infra-pack
Danger: HIGH (data modifications)
"""

from __future__ import annotations

import sqlite3
from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    DangerLevel,
    EscalationPolicy,
    EvidenceRequirements,
    ExecutionJournalEntry,
    INFRA_PACK,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="database",
    version="1.0.0",
    danger_level=DangerLevel.HIGH,
    rollback_support=True,
    verification_required=True,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=["sqlite3"],
    dependency_weight=INFRA_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False, filesystem_write=True),
    evidence_requirements=EvidenceRequirements(
        verification_required=True,
        blast_radius_required=True,
        rollback_plan_required=True,
    ),
    escalation_policy=EscalationPolicy(
        escalation_threshold=DangerLevel.HIGH,
        require_human_approval=True,
    ),
)


class DatabaseCapability(BaseCapability):
    """Database operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        if operation in ("query",) and params.get("sql", "").strip().upper().startswith("DROP"):
            return False  # prevent destructive operations
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        if operation in ("backup", "restore", "migrate"):
            return "database"
        if operation == "query":
            return "single-table"
        return "unknown"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return False  # placeholder

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "query": self.query,
            "migrate": self.migrate,
            "backup": self.backup,
            "restore": self.restore,
            "seed": self.seed,
            "schema_inspect": self.schema_inspect,
            "index_optimize": self.index_optimize,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown database operation: {operation}")
        return handler(**params)

    def query(self, dsn: str, sql: str, params: tuple = (), readonly: bool = True) -> dict[str, Any]:
        """Execute a SQL query."""
        if dsn.startswith("sqlite:///"):
            db_path = dsn.replace("sqlite:///", "")
            conn = sqlite3.connect(db_path)
            try:
                cur = conn.cursor()
                cur.execute(sql, params)
                if readonly or sql.strip().upper().startswith("SELECT"):
                    rows = cur.fetchall()
                    columns = [desc[0] for desc in cur.description] if cur.description else []
                    return {"rows": rows, "columns": columns, "rowcount": len(rows)}
                else:
                    conn.commit()
                    return {"rowcount": cur.rowcount, "lastrowid": cur.lastrowid}
            finally:
                conn.close()
        return {"error": f"Unsupported DSN: {dsn}"}

    def migrate(self, dsn: str, migrations_dir: str = "migrations") -> dict[str, Any]:
        """Run database migrations."""
        import os
        if dsn.startswith("sqlite:///"):
            db_path = dsn.replace("sqlite:///", "")
            conn = sqlite3.connect(db_path)
            try:
                cur = conn.cursor()
                # Create migration tracking table
                cur.execute("CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT)")
                applied = {row[0] for row in cur.execute("SELECT name FROM _migrations").fetchall()}
                migrations = sorted(f for f in os.listdir(migrations_dir) if f.endswith(".sql"))
                for m in migrations:
                    if m not in applied:
                        sql = open(os.path.join(migrations_dir, m)).read()
                        cur.executescript(sql)
                        cur.execute("INSERT INTO _migrations VALUES (?, datetime('now'))", (m,))
                        conn.commit()
                return {"applied": [m for m in migrations if m not in applied], "total": len(migrations)}
            finally:
                conn.close()
        return {"error": f"Unsupported DSN: {dsn}"}

    def backup(self, dsn: str, output: str = "") -> dict[str, Any]:
        """Backup a database."""
        import shutil
        if dsn.startswith("sqlite:///"):
            db_path = dsn.replace("sqlite:///", "")
            output_path = output or db_path + ".backup"
            shutil.copy2(db_path, output_path)
            return {"source": db_path, "destination": output_path}
        return {"error": f"Unsupported DSN: {dsn}"}

    def restore(self, dsn: str, backup_path: str) -> dict[str, Any]:
        """Restore a database from backup."""
        import shutil
        if dsn.startswith("sqlite:///"):
            db_path = dsn.replace("sqlite:///", "")
            shutil.copy2(backup_path, db_path)
            return {"source": backup_path, "destination": db_path}
        return {"error": f"Unsupported DSN: {dsn}"}

    def seed(self, dsn: str, seed_data: list[dict[str, Any]], table: str = "") -> dict[str, Any]:
        """Seed a table with data."""
        if dsn.startswith("sqlite:///"):
            db_path = dsn.replace("sqlite:///", "")
            conn = sqlite3.connect(db_path)
            try:
                cur = conn.cursor()
                count = 0
                for row in seed_data:
                    cols = ", ".join(row.keys())
                    placeholders = ", ".join(["?" for _ in row])
                    cur.execute(f"INSERT OR IGNORE INTO {table} ({cols}) VALUES ({placeholders})", tuple(row.values()))
                    count += 1
                conn.commit()
                return {"table": table, "rows_inserted": count}
            finally:
                conn.close()
        return {"error": f"Unsupported DSN: {dsn}"}

    def schema_inspect(self, dsn: str) -> dict[str, Any]:
        """Inspect database schema."""
        if dsn.startswith("sqlite:///"):
            db_path = dsn.replace("sqlite:///", "")
            conn = sqlite3.connect(db_path)
            try:
                cur = conn.cursor()
                tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
                schema: dict[str, Any] = {}
                for (table_name,) in tables:
                    columns = cur.execute(f"PRAGMA table_info({table_name})").fetchall()
                    schema[table_name] = [
                        {"name": col[1], "type": col[2], "notnull": bool(col[3]), "pk": bool(col[5])}
                        for col in columns
                    ]
                return {"tables": schema}
            finally:
                conn.close()
        return {"error": f"Unsupported DSN: {dsn}"}

    def index_optimize(self, dsn: str) -> dict[str, Any]:
        """Optimize database indexes."""
        if dsn.startswith("sqlite:///"):
            db_path = dsn.replace("sqlite:///", "")
            conn = sqlite3.connect(db_path)
            try:
                cur = conn.cursor()
                cur.execute("ANALYZE")
                cur.execute("REINDEX")
                return {"status": "optimized"}
            finally:
                conn.close()
        return {"error": f"Unsupported DSN: {dsn}"}
