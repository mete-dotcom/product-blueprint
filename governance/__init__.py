"""deepstrain.governance — epistemic governance for irreversible operations.

Core abstractions:
  - trust_score: (verification_success_rate * 0.4) + ((1 - rollback_frequency) * 0.3) + (blast_radius_accuracy * 0.3)
  - ExecutionJournal: SQLite-backed audit trail
  - EscalationEngine: human-in-the-loop for high-danger operations
  - BlastRadiusAnalyzer: predicts/measures blast radius
"""
