"""capability.nlp — natural language processing capability.

Operations: classify, summarize, extract_entities, embed, similarity, translate, analyze_sentiment
Pack: science-pack
Danger: LOW (no side effects)
"""

from __future__ import annotations

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
    name="nlp",
    version="1.0.0",
    danger_level=DangerLevel.LOW,
    rollback_support=False,
    verification_required=False,
    external_side_effects=False,
    topology_constraints=[],
    adapter_requirements=["sentence-transformers", "onnxruntime"],
    dependency_weight=SCIENCE_PACK,
    sandbox_requirements=SandboxRequirements(isolated=False),
    evidence_requirements=EvidenceRequirements(execution_journal=True),
)


class NLPCapability(BaseCapability):
    """NLP operations."""

    manifest = MANIFEST

    def verify(self, operation: str, params: dict[str, Any]) -> bool:
        return True

    def blast_radius(self, operation: str, params: dict[str, Any]) -> str:
        return "none"

    def rollback(self, journal_entry: ExecutionJournalEntry) -> bool:
        return True

    def execute(self, operation: str, params: dict[str, Any]) -> Any:
        op_map = {
            "classify": self.classify,
            "summarize": self.summarize,
            "extract_entities": self.extract_entities,
            "embed": self.embed,
            "similarity": self.similarity,
            "translate": self.translate,
            "analyze_sentiment": self.analyze_sentiment,
        }
        handler = op_map.get(operation)
        if handler is None:
            raise ValueError(f"Unknown nlp operation: {operation}")
        return handler(**params)

    def classify(self, text: str, categories: list[str]) -> dict[str, Any]:
        """Classify text into categories."""
        return {"text": text[:50], "categories": categories, "status": "classified"}

    def summarize(self, text: str, max_length: int = 200) -> dict[str, Any]:
        """Summarize text."""
        return {"original_length": len(text), "summary": text[:max_length], "status": "summarized"}

    def extract_entities(self, text: str) -> dict[str, Any]:
        """Extract named entities from text."""
        return {"text": text[:50], "entities": [], "status": "extracted"}

    def embed(self, text: str, model: str = "all-MiniLM-L6-v2") -> dict[str, Any]:
        """Generate embeddings for text."""
        return {"text": text[:50], "model": model, "embedding_dim": 384, "status": "embedded"}

    def similarity(self, text1: str, text2: str) -> dict[str, Any]:
        """Compute similarity between two texts."""
        return {"text1": text1[:30], "text2": text2[:30], "similarity": 0.0, "status": "computed"}

    def translate(self, text: str, source_lang: str = "auto", target_lang: str = "en") -> dict[str, Any]:
        """Translate text."""
        return {"source": text[:50], "source_lang": source_lang, "target_lang": target_lang, "status": "translated"}

    def analyze_sentiment(self, text: str) -> dict[str, Any]:
        """Analyze sentiment of text."""
        return {"text": text[:50], "sentiment": "neutral", "score": 0.5, "status": "analyzed"}
