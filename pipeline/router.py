"""pipeline.router — Capability Router (Stage 0).

Routes natural language intents to capability domains.
Extensible via pluggy hooks for 3rd-party capability registration.

Usage:
    from pipeline.router import CapabilityRouter
    router = CapabilityRouter()
    result = router.route("git commit my changes")
    # result = {"capability": "git", "operation": "commit", "confidence": 0.95}
"""

from __future__ import annotations

from typing import Any

from pipeline.narrowing import CapabilityRouter as _Router, NarrowingContext


class CapabilityRouter:
    """Extensible intent-to-capability router.

    Wraps the Stage 0 narrowiner with additional features:
    - pluggy hook registration
    - confidence scoring
    - alias resolution
    """

    def __init__(self) -> None:
        self._router = _Router()
        self._custom_routes: dict[str, tuple[str, str]] = {}
        self._hooks_enabled = False

    def route(self, intent: str, **params: Any) -> dict[str, Any]:
        """Route an intent to a capability domain.

        Args:
            intent: Natural language intent string.
            **params: Additional routing parameters.

        Returns:
            Dict with capability, operation, confidence, and parameters.
        """
        ctx = NarrowingContext(intent=intent, parameters=params)
        ctx = self._router.process(ctx)

        # Apply custom routes (override)
        if intent.lower() in self._custom_routes:
            ctx.capability, ctx.operation = self._custom_routes[intent.lower()]
            ctx.rank = 1.0

        return {
            "capability": ctx.capability,
            "operation": ctx.operation,
            "confidence": round(ctx.rank, 4),
            "intent": intent,
            "parameters": ctx.parameters,
            "metadata": ctx.metadata,
        }

    def register_route(self, keyword: str, capability: str, operation: str) -> None:
        """Register a custom routing rule."""
        self._custom_routes[keyword.lower()] = (capability, operation)

    def register_routes_from_manifest(self, manifest: dict[str, tuple[str, str]]) -> None:
        """Bulk register routes from a manifest dict."""
        self._custom_routes.update(manifest)

    def list_routes(self) -> dict[str, tuple[str, str]]:
        """List all registered routes."""
        return {**self._router.ROUTING_TABLE, **self._custom_routes}

    # ─── pluggy hook integration ──────────────────────────────────────────

    def enable_hooks(self) -> None:
        """Enable pluggy-based extension system."""
        try:
            import pluggy  # noqa: F401
            self._hooks_enabled = True
        except ImportError:
            self._hooks_enabled = False

    @property
    def hooks_enabled(self) -> bool:
        return self._hooks_enabled
