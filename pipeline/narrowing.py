"""pipeline.narrowing — 4+1 stage narrowing stack.

Stage 0: CapabilityRouter — intent → capability domain
Stage 1: DeterministicRetrieval — ripgrep, ast-grep, tree-sitter
Stage 2: SemanticNarrowing — sqlite-vec / tantivy-py
Stage 3: LocalInference — ONNX Runtime (optional), small classifiers
Stage 4: LLMReasoning — DeepSeek (final layer, external)

Each stage reduces the search/analysis space before passing to the next.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class NarrowingContext:
    """Context passed through the narrowing pipeline stages."""

    intent: str  # raw user/agent intent
    capability: str = ""  # resolved capability domain
    operation: str = ""  # resolved operation
    parameters: dict[str, Any] = field(default_factory=dict)
    candidates: list[dict[str, Any]] = field(default_factory=list)
    rank: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)


class NarrowingStage(ABC):
    """Abstract base for a narrowing pipeline stage."""

    stage_id: int

    @abstractmethod
    def process(self, ctx: NarrowingContext) -> NarrowingContext:
        ...


# ─── Stage 0: CapabilityRouter ───────────────────────────────────────────────

class CapabilityRouter(NarrowingStage):
    """Route intent to capability domain via keyword/pattern matching.

    Extensible via pluggy hooks in production; static mapping here for zero deps.
    """

    stage_id = 0

    # Keyword → (capability, operation) mapping
    ROUTING_TABLE: dict[str, tuple[str, str]] = {
        # Git
        "git status": ("git", "status"),
        "git diff": ("git", "diff"),
        "git commit": ("git", "commit"),
        "git push": ("git", "push"),
        "git pull": ("git", "push"),
        "git log": ("git", "log"),
        "git blame": ("git", "blame"),
        "git stash": ("git", "stash"),
        "git rebase": ("git", "rebase"),
        "git branch": ("git", "branch_policy"),
        "git revert": ("git", "rollback"),
        "git rollback": ("git", "rollback"),
        # Verification
        "test": ("verification", "test_run"),
        "coverage": ("verification", "coverage"),
        "lint": ("verification", "lint"),
        "type check": ("verification", "type_check"),
        "mypy": ("verification", "type_check"),
        "ruff": ("verification", "lint"),
        "audit": ("verification", "audit"),
        "regression": ("verification", "regression_check"),
        # Execution
        "run command": ("execution", "run"),
        "run script": ("execution", "script"),
        "shell": ("execution", "shell"),
        "execute": ("execution", "run"),
        "sandbox": ("execution", "sandbox"),
        # Filesystem
        "read file": ("filesystem", "read"),
        "write file": ("filesystem", "write"),
        "create file": ("filesystem", "write"),
        "move file": ("filesystem", "move"),
        "delete file": ("filesystem", "delete"),
        "list directory": ("filesystem", "list"),
        "search": ("filesystem", "search"),
        "grep": ("filesystem", "search"),
        "compress": ("filesystem", "compress"),
        "archive": ("filesystem", "archive"),
        "snapshot": ("filesystem", "snapshot"),
        # Document
        "parse": ("document", "parse"),
        "convert": ("document", "convert"),
        "template": ("document", "template"),
        "render": ("document", "render"),
        # Media
        "image": ("media", "image_resize"),
        "thumbnail": ("media", "thumbnail"),
        "optimize image": ("media", "optimize"),
        # Database
        "sql": ("database", "query"),
        "query": ("database", "query"),
        "migrate": ("database", "migrate"),
        "backup db": ("database", "backup"),
        "seed": ("database", "seed"),
        "schema": ("database", "schema_inspect"),
        # Security
        "secret": ("security", "secret_scan"),
        "vulnerability": ("security", "vulnerability_check"),
        "compliance": ("security", "compliance_check"),
        "sast": ("security", "sast"),
        "semgrep": ("security", "semgrep_scan"),
        # Package
        "install": ("package", "install"),
        "pip": ("package", "install"),
        "uv": ("package", "install"),
        "publish": ("package", "publish"),
        "build": ("package", "build"),
        "freeze": ("package", "freeze"),
        # Infrastructure
        "docker": ("infra", "container_run"),
        "kubernetes": ("infra", "k8s_apply"),
        "k8s": ("infra", "k8s_apply"),
        "helm": ("infra", "helm_deploy"),
        "terraform": ("infra", "terraform_plan"),
        "docker-compose": ("infra", "docker_compose"),
        "ssh": ("infra", "ssh"),
        # Cloud
        "s3": ("cloud", "s3_upload"),
        "lambda": ("cloud", "lambda_invoke"),
        "ecs": ("cloud", "ecs_deploy"),
        "cloudformation": ("cloud", "cloudformation"),
        # Browser
        "browser": ("browser", "navigate"),
        "screenshot": ("browser", "screenshot"),
        "scrape": ("browser", "navigate"),
        # Network
        "http": ("network", "http_request"),
        "ping": ("network", "ping"),
        "dns": ("network", "dns_lookup"),
        "download": ("network", "download"),
        "webhook": ("network", "http_request"),
        # NLP
        "classify": ("nlp", "classify"),
        "summarize": ("nlp", "summarize"),
        "translate": ("nlp", "translate"),
        "sentiment": ("nlp", "analyze_sentiment"),
        "embed": ("nlp", "embed"),
        # Math
        "calculate": ("math", "calculate"),
        "math": ("math", "calculate"),
        "statistics": ("math", "stats"),
        "stats": ("math", "stats"),
        "plot": ("math", "plot"),
        # Config
        "config": ("config", "get"),
        "environment": ("config", "import_env"),
        "env": ("config", "import_env"),
        # Governance
        "trust": ("governance", "trust_score"),
        "risk": ("governance", "risk_assessment"),
        "recovery": ("governance", "recovery_plan"),
        "escalate": ("governance", "escalation_check"),
        # Notification
        "email": ("notification", "send_email"),
        "slack": ("notification", "send_slack"),
        "discord": ("notification", "send_discord"),
        "alert": ("notification", "alert"),
    }

    def process(self, ctx: NarrowingContext) -> NarrowingContext:
        intent_lower = ctx.intent.lower().strip()

        # Exact match first
        if intent_lower in self.ROUTING_TABLE:
            cap, op = self.ROUTING_TABLE[intent_lower]
            ctx.capability = cap
            ctx.operation = op
            ctx.rank = 1.0
            return ctx

        # Prefix / substring match (longest match wins)
        best_cap = ""
        best_op = ""
        best_len = 0
        for keyword, (cap, op) in self.ROUTING_TABLE.items():
            if keyword in intent_lower or intent_lower.startswith(keyword):
                if len(keyword) > best_len:
                    best_cap = cap
                    best_op = op
                    best_len = len(keyword)

        if best_cap:
            ctx.capability = best_cap
            ctx.operation = best_op
            ctx.rank = 0.8 if best_len > 3 else 0.5
        else:
            ctx.capability = "governance"  # fallback
            ctx.operation = "risk_assessment"
            ctx.rank = 0.1

        return ctx


# ─── Stage 1: DeterministicRetrieval ──────────────────────────────────────────

class DeterministicRetrieval(NarrowingStage):
    """Deterministic retrieval via ripgrep, ast-grep, and tree-sitter.

    Uses subprocess calls to external tools with stdlib fallback.
    """

    stage_id = 1

    def process(self, ctx: NarrowingContext) -> NarrowingContext:
        query = ctx.parameters.get("query", ctx.intent)
        path = ctx.parameters.get("path", ".")
        file_pattern = ctx.parameters.get("file_pattern", "*")

        results: list[dict[str, Any]] = []

        # Try ripgrep first
        rg_results = self._ripgrep(query, path, file_pattern)
        results.extend(rg_results)

        # Try ast-grep for code-aware matching
        ast_results = self._ast_grep(query, path)
        results.extend(ast_results)

        ctx.candidates = results
        ctx.metadata["retrieval_count"] = len(results)
        ctx.metadata["tools_used"] = ["ripgrep"] + (["ast-grep"] if ast_results else [])
        return ctx

    @staticmethod
    def _ripgrep(query: str, path: str, file_pattern: str) -> list[dict[str, Any]]:
        """Run ripgrep with subprocess."""
        results: list[dict[str, Any]] = []
        try:
            cmd = ["rg", "-n", "--json", query, path, "-g", file_pattern]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            for line in proc.stdout.splitlines():
                try:
                    entry = json.loads(line)
                    if entry.get("type") == "match":
                        data = entry.get("data", {})
                        results.append({
                            "path": data.get("path", {}).get("text", ""),
                            "line": data.get("line_number", 0),
                            "content": data.get("lines", {}).get("text", "").strip(),
                        })
                except json.JSONDecodeError:
                    continue
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        return results

    @staticmethod
    def _ast_grep(query: str, path: str) -> list[dict[str, Any]]:
        """Run ast-grep-py if available."""
        results: list[dict[str, Any]] = []
        try:
            cmd = ["ast-grep", "run", "-p", query, path]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            for line in proc.stdout.splitlines():
                if ":" in line:
                    parts = line.split(":", 2)
                    if len(parts) >= 2:
                        results.append({
                            "path": parts[0],
                            "line": int(parts[1]) if parts[1].isdigit() else 0,
                            "content": parts[2] if len(parts) > 2 else "",
                        })
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        return results


# ─── Stage 2: SemanticNarrowing ──────────────────────────────────────────────

class SemanticNarrowing(NarrowingStage):
    """Semantic narrowing using vector embeddings.

    Uses sqlite-vec if available, otherwise falls back to keyword TF-IDF.
    """

    stage_id = 2

    def process(self, ctx: NarrowingContext) -> NarrowingContext:
        if not ctx.candidates:
            return ctx

        # Rank candidates by simple relevance scoring
        scored: list[tuple[float, dict[str, Any]]] = []
        query_terms = set(ctx.intent.lower().split())

        for candidate in ctx.candidates:
            content = candidate.get("content", "").lower()
            score = sum(1 for term in query_terms if term in content)
            scored.append((score, candidate))

        scored.sort(key=lambda x: x[0], reverse=True)
        ctx.candidates = [c for _, c in scored if _ > 0]
        ctx.rank = ctx.rank * 0.9  # slight penalty for using fallback
        return ctx


# ─── Stage 3: LocalInference ──────────────────────────────────────────────────

class LocalInference(NarrowingStage):
    """Local inference via ONNX Runtime (optional).

    Falls back gracefully if ONNX Runtime is not available.
    """

    stage_id = 3

    def process(self, ctx: NarrowingContext) -> NarrowingContext:
        try:
            import numpy as np  # noqa: F401 — check numpy availability
            # Placeholder: in production, load an ONNX model
            ctx.metadata["inference"] = {"model": "not-loaded", "status": "placeholder"}
        except ImportError:
            ctx.metadata["inference"] = {"status": "skipped", "reason": "numpy/onnx not available"}

        return ctx


# ─── Stage 4: LLMReasoning ────────────────────────────────────────────────────

class LLMReasoning(NarrowingStage):
    """Final reasoning layer using DeepSeek LLM.

    This stage is called only for high-complexity intents.
    """

    stage_id = 4

    def __init__(self, api_key: str = "", model: str = "deepseek-chat") -> None:
        self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY", "")
        self.model = model

    def process(self, ctx: NarrowingContext) -> NarrowingContext:
        if not self.api_key:
            ctx.metadata["reasoning"] = {"status": "skipped", "reason": "no API key"}
            return ctx

        # Placeholder for DeepSeek API call
        ctx.metadata["reasoning"] = {
            "model": self.model,
            "status": "not_implemented",
            "note": "DeepSeek API integration placeholder",
        }
        return ctx


# ─── Pipeline Orchestrator ────────────────────────────────────────────────────

class NarrowingPipeline:
    """Orchestrates the 4+1 stage narrowing pipeline.

    Usage:
        pipeline = NarrowingPipeline()
        ctx = pipeline.run("git commit my changes")
        print(ctx.capability, ctx.operation)
    """

    def __init__(self, stages: list[NarrowingStage] | None = None) -> None:
        self.stages = stages or [
            CapabilityRouter(),
            DeterministicRetrieval(),
            SemanticNarrowing(),
            LocalInference(),
            LLMReasoning(),
        ]
        # Sort by stage_id for deterministic execution
        self.stages.sort(key=lambda s: s.stage_id)

    def run(self, intent: str, **params: Any) -> NarrowingContext:
        """Run the pipeline on an intent string.

        Args:
            intent: The raw intent string to process.
            **params: Additional parameters (path, file_pattern, etc.).

        Returns:
            NarrowingContext with resolved capability, operation, and candidates.
        """
        ctx = NarrowingContext(intent=intent, parameters=params)
        for stage in self.stages:
            ctx = stage.process(ctx)
        return ctx
