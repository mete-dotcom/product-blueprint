"""deepstrain.pipeline — 4+1 stage narrowing stack.

Stage 0: CapabilityRouter — intent → capability domain
Stage 1: DeterministicRetrieval — ripgrep, ast-grep, tree-sitter
Stage 2: SemanticNarrowing — sqlite-vec / tantivy-py
Stage 3: LocalInference — ONNX Runtime (optional), small classifiers
Stage 4: LLMReasoning — DeepSeek (final layer)
"""

from __future__ import annotations
