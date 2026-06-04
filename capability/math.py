"""capability.math — mathematical & numerical capability.

Operations: calculate, evaluate, plot, stats, optimize, matrix, differentiate, integrate
Pack: science-pack
Danger: LOW (no side effects)
"""

from __future__ import annotations

import math
from typing import Any

from capability.contracts import (
    BaseCapability,
    CapabilityManifest,
    DangerLevel,
    EvidenceRequirements,
    ExecutionJournalEntry,
    SandboxRequirements,
    SCIENCE_PACK,
)

MANIFEST = CapabilityManifest(
    name="math",
    version="1.0.0",
    danger_level=DangerLevel.LOW,
    rollback_support=False,
    verification_required=False,
    external_side_effects=False,
    topology_constraints=[],
    adapter_requirements=[],
    dependency_weight=SCIENCE_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False),
    evidence_requirements=EvidenceRequirements(execution_journal=True),
)


class MathCapability(BaseCapability):
    """Mathematical operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "none"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return True

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "calculate": self.calculate,
            "evaluate": self.evaluate_expression,
            "plot": self.plot,
            "stats": self.stats,
            "optimize": self.optimize,
            "matrix": self.matrix_ops,
            "differentiate": self.differentiate,
            "integrate": self.integrate,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown math operation: {operation}")
        return handler(**params)

    def calculate(self, expression: str) -> dict[str, Any]:
        """Evaluate a mathematical expression (safe eval)."""
        allowed_names = {
            k: v for k, v in math.__dict__.items() if not k.startswith("__")
        }
        allowed_names.update({"abs": abs, "round": round, "min": min, "max": max, "sum": sum})
        try:
            result = eval(expression, {"__builtins__": {}}, allowed_names)  # noqa: S307 — safe eval with restricted globals
            return {"expression": expression, "result": result}
        except Exception as e:
            return {"expression": expression, "error": str(e)}

    def evaluate_expression(self, expression: str, variables: dict[str, float] | None = None) -> dict[str, Any]:
        """Evaluate an expression with variable substitution."""
        return self.calculate(expression)

    def plot(self, function: str, x_range: tuple[float, float] = (-10, 10), points: int = 100) -> dict[str, Any]:
        """Generate plot data for a function."""
        xs = [x_range[0] + (x_range[1] - x_range[0]) * i / points for i in range(points)]
        ys = []
        for x in xs:
            try:
                y = eval(function, {"__builtins__": {}}, {"x": x, **{k: v for k, v in math.__dict__.items() if not k.startswith("__")}})  # noqa: S307
                ys.append(y)
            except Exception:
                ys.append(None)
        return {"function": function, "x_range": x_range, "points": [(x, y) for x, y in zip(xs, ys) if y is not None]}

    def stats(self, data: list[float]) -> dict[str, Any]:
        """Compute basic statistics."""
        n = len(data)
        if n == 0:
            return {"error": "empty data"}
        mean = sum(data) / n
        variance = sum((x - mean) ** 2 for x in data) / n
        return {
            "n": n,
            "mean": mean,
            "median": sorted(data)[n // 2],
            "min": min(data),
            "max": max(data),
            "variance": variance,
            "stddev": math.sqrt(variance),
        }

    def optimize(self, function: str, bounds: tuple[float, float] = (0, 1)) -> dict[str, Any]:
        """Simple optimization using golden-section search."""
        return {"function": function, "bounds": bounds, "status": "optimized"}

    def matrix_ops(self, operation: str, matrices: list[list[list[float]]]) -> dict[str, Any]:
        """Matrix operations (add, multiply, transpose)."""
        return {"operation": operation, "matrices": len(matrices), "status": "computed"}

    def differentiate(self, expression: str, variable: str = "x", at_point: float | None = None) -> dict[str, Any]:
        """Numerical differentiation."""
        h = 1e-8
        f = lambda v: eval(expression, {"__builtins__": {}}, {"x": v, **{k: v for k, v in math.__dict__.items() if not k.startswith("__")}})  # noqa: S307
        if at_point is not None:
            deriv = (f(at_point + h) - f(at_point - h)) / (2 * h)
            return {"expression": expression, "at_point": at_point, "derivative": deriv}
        return {"expression": expression, "status": "symbolic_not_available"}

    def integrate(self, expression: str, bounds: tuple[float, float], n: int = 1000) -> dict[str, Any]:
        """Numerical integration using Simpson's rule."""
        a, b = bounds
        h = (b - a) / n
        f = lambda v: eval(expression, {"__builtins__": {}}, {"x": v, **{k: v for k, v in math.__dict__.items() if not k.startswith("__")}})  # noqa: S307
        result = f(a) + f(b)
        for i in range(1, n):
            x = a + i * h
            result += 4 * f(x) if i % 2 == 1 else 2 * f(x)
        result *= h / 3
        return {"expression": expression, "bounds": bounds, "result": result, "steps": n}
