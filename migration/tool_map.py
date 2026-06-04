"""migration.tool_map — mapping from legacy 52 tools to 18 capability domains.

Every legacy tool gets:
  - capability domain tag
  - adapter wrapper for backward compatibility
  - operation mapping

The old tool names continue to work as aliases via the CapabilityRouter's
custom route registration.
"""

from __future__ import annotations

from typing import Any

# ─── Legacy Tool → Capability Domain Mapping ─────────────────────────────────

TOOL_MAP: dict[str, dict[str, Any]] = {
    # ── Filesystem tools (12 tools) ──
    "read_file": {
        "capability": "filesystem",
        "operation": "read",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Read a file from disk, optionally a line range.",
        "backward_compat": True,
    },
    "write_file": {
        "capability": "filesystem",
        "operation": "write",
        "danger_level": "MEDIUM",
        "pack": "core-pack",
        "description": "Write (overwrite) a file with the given content.",
        "backward_compat": True,
    },
    "patch_file": {
        "capability": "filesystem",
        "operation": "diff",
        "danger_level": "MEDIUM",
        "pack": "core-pack",
        "description": "Surgical text replacement using unique matching.",
        "backward_compat": True,
    },
    "smart_patch": {
        "capability": "filesystem",
        "operation": "diff",
        "danger_level": "MEDIUM",
        "pack": "core-pack",
        "description": "patch_file with fuzzy fallback.",
        "backward_compat": True,
    },
    "surgical_read": {
        "capability": "filesystem",
        "operation": "read",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Extract ONLY the target function/class from a file.",
        "backward_compat": True,
    },
    "surgical_patch": {
        "capability": "filesystem",
        "operation": "diff",
        "danger_level": "MEDIUM",
        "pack": "core-pack",
        "description": "AST-based symbol replacement.",
        "backward_compat": True,
    },
    "list_dir": {
        "capability": "filesystem",
        "operation": "list",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "List files and folders in a directory.",
        "backward_compat": True,
    },
    "find_files": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Find files by glob pattern.",
        "backward_compat": True,
    },
    "chunk_read": {
        "capability": "filesystem",
        "operation": "read",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Read a large file in chunks.",
        "backward_compat": True,
    },
    "file_outline": {
        "capability": "filesystem",
        "operation": "read",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Fast file structure: class/def/import lines with numbers.",
        "backward_compat": True,
    },
    "locate": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Find WHERE a symbol or concept lives.",
        "backward_compat": True,
    },
    "audit_md_notes": {
        "capability": "filesystem",
        "operation": "snapshot",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Scan a directory for .md files and return structured data.",
        "backward_compat": True,
    },

    # ── Execution tools (9 tools) ──
    "run_command": {
        "capability": "execution",
        "operation": "run",
        "danger_level": "HIGH",
        "pack": "core-pack",
        "description": "Run a shell command and return stdout/stderr.",
        "backward_compat": True,
    },
    "grant_permission": {
        "capability": "execution",
        "operation": "run",
        "danger_level": "HIGH",
        "pack": "core-pack",
        "description": "Grant blanket write/shell permission.",
        "backward_compat": True,
    },
    "ask_user": {
        "capability": "governance",
        "operation": "escalation",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Pause and ask the user a question.",
        "backward_compat": True,
    },
    "checkpoint": {
        "capability": "notification",
        "operation": "log",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Log a progress milestone.",
        "backward_compat": True,
    },
    "run_tests": {
        "capability": "verification",
        "operation": "test_run",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Run pytest.",
        "backward_compat": True,
    },
    "worker": {
        "capability": "execution",
        "operation": "run",
        "danger_level": "MEDIUM",
        "pack": "core-pack",
        "description": "Run a worker function from agent_workers.py.",
        "backward_compat": True,
    },
    "plugin_tool": {
        "capability": "execution",
        "operation": "run",
        "danger_level": "MEDIUM",
        "pack": "core-pack",
        "description": "Run a custom plugin from agent_tools/ directory.",
        "backward_compat": True,
    },
    "spawn_agents": {
        "capability": "execution",
        "operation": "run",
        "danger_level": "MEDIUM",
        "pack": "core-pack",
        "description": "Run multiple analysis tasks in parallel sub-agents.",
        "backward_compat": True,
    },
    "delegate": {
        "capability": "execution",
        "operation": "run",
        "danger_level": "MEDIUM",
        "pack": "core-pack",
        "description": "Delegate a complex analysis task to a specialist sub-agent.",
        "backward_compat": True,
    },

    # ── Web tools (8 tools) ──
    "search_in_files": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Search for a regex pattern across files.",
        "backward_compat": True,
    },
    "grep_files": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Regex search across any file type.",
        "backward_compat": True,
    },
    "find_symbols": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "List all function and class definitions in a Python file.",
        "backward_compat": True,
    },
    "find_definition": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Find where a function/class/variable is defined.",
        "backward_compat": True,
    },
    "find_usages": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Find all usages of a symbol across files.",
        "backward_compat": True,
    },
    "verify_symbol": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Quick check if a symbol exists anywhere.",
        "backward_compat": True,
    },
    "read_patterns": {
        "capability": "filesystem",
        "operation": "read",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Extract code conventions from existing files.",
        "backward_compat": True,
    },
    "project_context": {
        "capability": "filesystem",
        "operation": "snapshot",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Compress project into ~1500 token signal.",
        "backward_compat": True,
    },

    # ── Git tools (7 tools) ──
    "git_diff": {
        "capability": "git",
        "operation": "diff",
        "danger_level": "LOW",
        "pack": "git-pack",
        "description": "Show git diff (unstaged or staged).",
        "backward_compat": True,
    },
    "git_log": {
        "capability": "git",
        "operation": "log",
        "danger_level": "LOW",
        "pack": "git-pack",
        "description": "Show recent git commits.",
        "backward_compat": True,
    },
    "git_commit": {
        "capability": "git",
        "operation": "commit",
        "danger_level": "MEDIUM",
        "pack": "git-pack",
        "description": "Stage all changes and commit.",
        "backward_compat": True,
    },
    "git_push": {
        "capability": "git",
        "operation": "push",
        "danger_level": "MEDIUM",
        "pack": "git-pack",
        "description": "Push the current branch to a remote.",
        "backward_compat": True,
    },

    # ── Reasoning tools (6 tools) ──
    "detect_duplicates": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Find copy-paste code blocks.",
        "backward_compat": True,
    },
    "interface_check": {
        "capability": "verification",
        "operation": "invariant_check",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Find missing/mismatched methods between abstract class and implementation.",
        "backward_compat": True,
    },
    "dead_code": {
        "capability": "verification",
        "operation": "lint",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Find defined but never-used functions and classes.",
        "backward_compat": True,
    },
    "circular_deps": {
        "capability": "verification",
        "operation": "invariant_check",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Detect circular import cycles via AST.",
        "backward_compat": True,
    },
    "import_graph": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Show import dependencies of a file.",
        "backward_compat": True,
    },
    "schema_check": {
        "capability": "verification",
        "operation": "invariant_check",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Compare migration SQL against schema.",
        "backward_compat": True,
    },

    # ── System tools (5 tools) ──
    "remember": {
        "capability": "config",
        "operation": "set",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Store a key-value pair in session RAM.",
        "backward_compat": True,
    },
    "recall": {
        "capability": "config",
        "operation": "get",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Read a value from session RAM by key.",
        "backward_compat": True,
    },
    "save_note": {
        "capability": "filesystem",
        "operation": "write",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Append a persistent note.",
        "backward_compat": True,
    },
    "read_notes": {
        "capability": "filesystem",
        "operation": "read",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Read all previously saved notes.",
        "backward_compat": True,
    },
    "list_permissions": {
        "capability": "config",
        "operation": "get",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Show which permissions have been granted.",
        "backward_compat": True,
    },

    # ── Memory tools (4 tools) ──
    "strain_project": {
        "capability": "filesystem",
        "operation": "snapshot",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Composite single-pass project analysis.",
        "backward_compat": True,
    },
    "link_project": {
        "capability": "config",
        "operation": "set",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Register an external project directory by alias.",
        "backward_compat": True,
    },
    "cross_project": {
        "capability": "filesystem",
        "operation": "search",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Send a read-only analysis task to a linked project.",
        "backward_compat": True,
    },
    "save_project_note": {
        "capability": "filesystem",
        "operation": "write",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Append a timestamped note to project notes file.",
        "backward_compat": True,
    },
    "read_project_notes": {
        "capability": "filesystem",
        "operation": "read",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Read project notes file.",
        "backward_compat": True,
    },

    # ── Analysis tools (remaining) ──
    "detect_stack": {
        "capability": "verification",
        "operation": "invariant_check",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Auto-detect tech stack.",
        "backward_compat": True,
    },
    "project_summary": {
        "capability": "filesystem",
        "operation": "snapshot",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Project map with directory tree and file/line counts.",
        "backward_compat": True,
    },
    "make_plan": {
        "capability": "governance",
        "operation": "risk_assessment",
        "danger_level": "LOW",
        "pack": "core-pack",
        "description": "Display a numbered step-by-step plan.",
        "backward_compat": True,
    },
}


# ─── Capability Domain → Legacy Tool Reverse Map ─────────────────────────────

CAPABILITY_TO_TOOLS: dict[str, list[str]] = {}
for tool_name, mapping in TOOL_MAP.items():
    cap = mapping["capability"]
    if cap not in CAPABILITY_TO_TOOLS:
        CAPABILITY_TO_TOOLS[cap] = []
    CAPABILITY_TO_TOOLS[cap].append(tool_name)


# ─── Pack → Tool Map ─────────────────────────────────────────────────────────

PACK_TO_TOOLS: dict[str, list[str]] = {}
for tool_name, mapping in TOOL_MAP.items():
    pack = mapping["pack"]
    if pack not in PACK_TO_TOOLS:
        PACK_TO_TOOLS[pack] = []
    PACK_TO_TOOLS[pack].append(tool_name)


# ─── Stats ───────────────────────────────────────────────────────────────────

def get_stats() -> dict[str, Any]:
    """Get migration statistics."""
    return {
        "total_tools": len(TOOL_MAP),
        "capability_domains": len(CAPABILITY_TO_TOOLS),
        "by_capability": {k: len(v) for k, v in sorted(CAPABILITY_TO_TOOLS.items())},
        "by_pack": {k: len(v) for k, v in sorted(PACK_TO_TOOLS.items())},
        "backward_compatible": sum(1 for t in TOOL_MAP.values() if t["backward_compat"]),
    }


# ─── Backward Compat Adapter ─────────────────────────────────────────────────

class ToolAdapter:
    """Adapter that wraps legacy tool calls through the capability framework.

    Allows old tool names to work as aliases for new capability operations.
    """

    def __init__(self) -> None:
        from pipeline.router import CapabilityRouter
        self._router = CapabilityRouter()
        # Register all legacy tools as custom routes
        for tool_name, mapping in TOOL_MAP.items():
            if mapping["backward_compat"]:
                self._router.register_route(
                    tool_name,
                    mapping["capability"],
                    mapping["operation"],
                )

    def resolve(self, tool_name: str) -> dict[str, Any] | None:
        """Resolve a legacy tool name to its capability mapping."""
        return TOOL_MAP.get(tool_name)

    def route(self, tool_name: str) -> dict[str, Any]:
        """Route a legacy tool name through the capability framework."""
        result = self._router.route(tool_name)
        mapping = self.resolve(tool_name)
        if mapping:
            result["pack"] = mapping["pack"]
            result["danger_level"] = mapping["danger_level"]
        return result

    def list_backward_compat(self) -> list[str]:
        """List all tools with backward compatibility."""
        return sorted(name for name, t in TOOL_MAP.items() if t["backward_compat"])
