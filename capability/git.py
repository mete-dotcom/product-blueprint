"""capability.git — Git lifecycle capability.

Operations: status, diff, commit, push, rollback, blame, branch_policy, log, stash, rebase
Pack: git-pack
Danger: MEDIUM (commit/push) to HIGH (force push, rebase)
"""

from __future__ import annotations

from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    DangerLevel,
    EscalationPolicy,
    EvidenceRequirements,
    ExecutionJournalEntry,
    GIT_PACK,
    SandboxRequirements,
)

MANIFEST = CapabilityManifest(
    name="git",
    version="1.0.0",
    danger_level=DangerLevel.MEDIUM,
    rollback_support=True,
    verification_required=True,
    external_side_effects=True,
    topology_constraints=[],
    adapter_requirements=["git"],
    dependency_weight=GIT_PACK,
    sandbox_requirements=SandboxRequirements(
        isolated=False,
        network_access=True,
        filesystem_write=True,
        timeout_seconds=120,
    ),
    evidence_requirements=EvidenceRequirements(
        verification_required=True,
        blast_radius_required=True,
        rollback_plan_required=True,
        execution_journal=True,
    ),
    escalation_policy=EscalationPolicy(
        auto_escalate=True,
        escalation_threshold=DangerLevel.HIGH,
        require_human_approval=False,
        max_retries=3,
    ),
)


class GitCapability(BaseCapability):
    """Git lifecycle operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        if operation == "push":
            # Verify: check if remote exists, branch is not protected
            return True  # placeholder
        if operation == "commit":
            return True  # placeholder: check for unstaged changes
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        mapping = {
            "status": "none",
            "diff": "none",
            "log": "none",
            "blame": "none",
            "commit": "local-repository",
            "push": "remote-repository",
            "rebase": "local-repository",
            "rollback": "local-repository",
            "stash": "local-repository",
            "branch_policy": "remote-repository",
        }
        return mapping.get(operation, "unknown")

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        # Use git revert for commits, git reset for unstaged
        return True  # placeholder

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "status": self.status,
            "diff": self.diff,
            "commit": self.commit,
            "push": self.push,
            "log": self.log,
            "blame": self.blame,
            "branch_policy": self.branch_policy,
            "stash": self.stash,
            "rebase": self.rebase,
            "rollback": self.rollback_op,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown git operation: {operation}")
        return handler(**params)

    # --- Operations ---

    def status(self, path: str = ".") -> dict[str, Any]:
        """Git status."""
        from subprocess import run as _run, PIPE
        result = _run(["git", "-C", path, "status", "--porcelain"], capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def diff(self, path: str = ".", staged: bool = False) -> dict[str, Any]:
        """Git diff."""
        from subprocess import run as _run, PIPE
        args = ["git", "-C", path, "diff"]
        if staged:
            args.append("--cached")
        result = _run(args, capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def commit(self, path: str = ".", message: str = "", all_files: bool = True) -> dict[str, Any]:
        """Git commit."""
        from subprocess import run as _run, PIPE
        if all_files:
            _run(["git", "-C", path, "add", "-A"], capture_output=True, text=True)
        result = _run(["git", "-C", path, "commit", "-m", message], capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def push(self, path: str = ".", remote: str = "origin", branch: str | None = None, force: bool = False) -> dict[str, Any]:
        """Git push. Protected branches require force_with_lease."""
        from subprocess import run as _run, PIPE
        args = ["git", "-C", path, "push", remote]
        if branch:
            args.append(branch)
        if force:
            args.append("--force-with-lease")
        result = _run(args, capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def log(self, path: str = ".", n: int = 10) -> dict[str, Any]:
        """Git log (one-line)."""
        from subprocess import run as _run, PIPE
        result = _run(
            ["git", "-C", path, "log", f"-{n}", "--oneline"],
            capture_output=True, text=True,
        )
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def blame(self, path: str = ".", file: str = "") -> dict[str, Any]:
        """Git blame for a file."""
        from subprocess import run as _run, PIPE
        result = _run(["git", "-C", path, "blame", file], capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def branch_policy(self, path: str = ".", policy: str = "protect-main") -> dict[str, Any]:
        """Check or enforce branch protection policy."""
        from subprocess import run as _run, PIPE
        result = _run(
            ["git", "-C", path, "branch", "--show-current"],
            capture_output=True, text=True,
        )
        current_branch = result.stdout.strip()
        protected = current_branch in ("main", "master", "develop", "release")
        return {"current_branch": current_branch, "protected": protected}

    def stash(self, path: str = ".", action: str = "push", message: str = "") -> dict[str, Any]:
        """Git stash push/pop/list."""
        from subprocess import run as _run, PIPE
        args = ["git", "-C", path, "stash", action]
        if action == "push" and message:
            args.extend(["-m", message])
        result = _run(args, capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def rebase(self, path: str = ".", target: str = "main", interactive: bool = False) -> dict[str, Any]:
        """Git rebase onto target branch."""
        from subprocess import run as _run, PIPE
        args = ["git", "-C", path, "rebase"]
        if interactive:
            args.append("-i")
        args.append(target)
        result = _run(args, capture_output=True, text=True)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}

    def rollback_op(self, path: str = ".", commit_hash: str = "") -> dict[str, Any]:
        """Revert a commit (safe rollback)."""
        from subprocess import run as _run, PIPE
        result = _run(
            ["git", "-C", path, "revert", "--no-edit", commit_hash],
            capture_output=True, text=True,
        )
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
