"""governance.journal — SQLite-backed execution journal for the governance layer.

Stores ExecutionJournalEntry records for every irreversible operation.
Provides query, aggregation, and evidence verification.

Zero external dependencies (stdlib sqlite3 only).
Nuitka-compatible.
"""

from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from capability.contracts import ExecutionJournalEntry

# Module-level lock for thread safety
_lock = threading.Lock()
_default_db_path: str | None = None


def get_default_db_path() -> str:
    """Get the default database path (platform-agnostic)."""
    global _default_db_path
    if _default_db_path is None:
        data_dir = Path.home() / ".deepstrain" / "journal"
        data_dir.mkdir(parents=True, exist_ok=True)
        _default_db_path = str(data_dir / "execution_journal.db")
    return _default_db_path


class JournalDB:
    """SQLite-backed execution journal.

    Thread-safe. Creates the database and schema on first use.

    Schema:
        entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            capability TEXT NOT NULL,
            operation TEXT NOT NULL,
            danger_level TEXT NOT NULL,
            blast_radius_predicted TEXT,
            blast_radius_actual TEXT,
            verification_result INTEGER,
            rollback_available INTEGER,
            evidence_hash TEXT,
            metadata TEXT
        )
    """

    def __init__(self, db_path: str = "") -> None:
        self.db_path = db_path or get_default_db_path()
        self._init_schema()

    def _init_schema(self) -> None:
        with _lock:
            conn = sqlite3.connect(self.db_path)
            try:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS entries (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        capability TEXT NOT NULL,
                        operation TEXT NOT NULL,
                        danger_level TEXT NOT NULL,
                        blast_radius_predicted TEXT,
                        blast_radius_actual TEXT,
                        verification_result INTEGER,
                        rollback_available INTEGER,
                        evidence_hash TEXT,
                        metadata TEXT
                    )
                """)
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_timestamp ON entries(timestamp)
                """)
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_capability ON entries(capability)
                """)
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_danger_level ON entries(danger_level)
                """)
                conn.commit()
            finally:
                conn.close()

    def append(self, entry: ExecutionJournalEntry) -> int:
        """Append a journal entry. Returns the row ID."""
        with _lock:
            conn = sqlite3.connect(self.db_path)
            try:
                cur = conn.execute(
                    """
                    INSERT INTO entries
                        (timestamp, capability, operation, danger_level,
                         blast_radius_predicted, blast_radius_actual,
                         verification_result, rollback_available, evidence_hash, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        entry.timestamp,
                        entry.capability,
                        entry.operation,
                        entry.danger_level,
                        entry.blast_radius_predicted,
                        entry.blast_radius_actual,
                        int(entry.verification_result) if entry.verification_result is not None else None,
                        int(entry.rollback_available),
                        entry.evidence_hash,
                        json.dumps(entry.metadata, default=str),
                    ),
                )
                conn.commit()
                return cur.lastrowid or 0
            finally:
                conn.close()

    def query(
        self,
        limit: int = 50,
        offset: int = 0,
        capability: str = "",
        danger_level: str = "",
        operation: str = "",
        since: str = "",
    ) -> list[dict[str, Any]]:
        """Query journal entries with optional filters."""
        with _lock:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            try:
                where_clauses: list[str] = []
                params: list[Any] = []

                if capability:
                    where_clauses.append("capability = ?")
                    params.append(capability)
                if danger_level:
                    where_clauses.append("danger_level = ?")
                    params.append(danger_level)
                if operation:
                    where_clauses.append("operation = ?")
                    params.append(operation)
                if since:
                    where_clauses.append("timestamp >= ?")
                    params.append(since)

                where = " AND ".join(where_clauses) if where_clauses else "1=1"
                sql = f"SELECT * FROM entries WHERE {where} ORDER BY id DESC LIMIT ? OFFSET ?"
                params.extend([limit, offset])

                rows = conn.execute(sql, params).fetchall()
                return [dict(r) for r in rows]
            finally:
                conn.close()

    def get_by_id(self, entry_id: int) -> dict[str, Any] | None:
        """Get a single journal entry by ID."""
        with _lock:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            try:
                row = conn.execute("SELECT * FROM entries WHERE id = ?", (entry_id,)).fetchone()
                return dict(row) if row else None
            finally:
                conn.close()

    def count(self, capability: str = "", danger_level: str = "") -> int:
        """Count entries, optionally filtered."""
        with _lock:
            conn = sqlite3.connect(self.db_path)
            try:
                where_clauses: list[str] = []
                params: list[Any] = []
                if capability:
                    where_clauses.append("capability = ?")
                    params.append(capability)
                if danger_level:
                    where_clauses.append("danger_level = ?")
                    params.append(danger_level)
                where = " AND ".join(where_clauses) if where_clauses else "1=1"
                row = conn.execute(f"SELECT COUNT(*) FROM entries WHERE {where}", params).fetchone()
                return row[0] if row else 0
            finally:
                conn.close()

    def stats(self) -> dict[str, Any]:
        """Get journal statistics."""
        with _lock:
            conn = sqlite3.connect(self.db_path)
            try:
                total = conn.execute("SELECT COUNT(*) FROM entries").fetchone()[0]
                by_capability = conn.execute(
                    "SELECT capability, COUNT(*) as cnt FROM entries GROUP BY capability ORDER BY cnt DESC"
                ).fetchall()
                by_danger = conn.execute(
                    "SELECT danger_level, COUNT(*) as cnt FROM entries GROUP BY danger_level ORDER BY cnt DESC"
                ).fetchall()
                recent = conn.execute(
                    "SELECT timestamp, capability, operation FROM entries ORDER BY id DESC LIMIT 5"
                ).fetchall()
                return {
                    "total_entries": total,
                    "by_capability": {r[0]: r[1] for r in by_capability},
                    "by_danger_level": {r[0]: r[1] for r in by_danger},
                    "recent": [{"timestamp": r[0], "capability": r[1], "operation": r[2]} for r in recent],
                }
            finally:
                conn.close()

    def verify_evidence(self, entry_id: int) -> dict[str, Any]:
        """Verify the evidence hash of a journal entry (tamper detection)."""
        entry = self.get_by_id(entry_id)
        if not entry:
            return {"verified": False, "error": "Entry not found"}

        reconstructed = ExecutionJournalEntry(
            timestamp=entry["timestamp"],
            capability=entry["capability"],
            operation=entry["operation"],
            danger_level=entry["danger_level"],
            blast_radius_predicted=entry["blast_radius_predicted"] or "",
            blast_radius_actual=entry["blast_radius_actual"] or "",
            verification_result=bool(entry["verification_result"]) if entry["verification_result"] is not None else None,
            rollback_available=bool(entry["rollback_available"]),
            evidence_hash=entry["evidence_hash"],
            metadata=json.loads(entry["metadata"]) if entry["metadata"] else {},
        )
        computed_hash = reconstructed.compute_evidence_hash()
        stored_hash = entry["evidence_hash"]

        return {
            "verified": computed_hash == stored_hash,
            "computed_hash": computed_hash,
            "stored_hash": stored_hash,
            "entry_id": entry_id,
        }

    def export_json(self, path: str = "") -> str:
        """Export all entries to JSON file."""
        export_path = path or "journal_export.json"
        entries = self.query(limit=100000)
        Path(export_path).write_text(json.dumps(entries, indent=2, default=str))
        return export_path


def append_entry(
    capability: str,
    operation: str,
    danger_level: str = "LOW",
    blast_radius_predicted: str = "none",
    blast_radius_actual: str = "",
    verification_result: bool | None = None,
    rollback_available: bool = False,
    metadata: dict[str, Any] | None = None,
) -> int:
    """Convenience function to append a journal entry.

    Returns the entry ID.
    """
    entry = ExecutionJournalEntry(
        timestamp=datetime.now(timezone.utc).isoformat(),
        capability=capability,
        operation=operation,
        danger_level=danger_level,
        blast_radius_predicted=blast_radius_predicted,
        blast_radius_actual=blast_radius_actual,
        verification_result=verification_result,
        rollback_available=rollback_available,
        evidence_hash="",
        metadata=metadata or {},
    )
    entry.evidence_hash = entry.compute_evidence_hash()
    db = JournalDB()
    return db.append(entry)
