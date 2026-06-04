# deepstrain notes

## [2026-06-04 08:34]

## Capability Framework Transformation (2025-01-21)

### What was created
The architectural blueprint for deepstrain's 18-domain capability framework has been implemented
in `C:/projelerim_2026/product-blueprint/`. This is the reference implementation for the next
version of deepstrain (v2.0 capability architecture).

### New directories & files

#### capability/ — 18 Canonical Capability Domains
- `__init__.py` — capability package exports
- `contracts.py` — base classes: BaseCapability, CapabilityManifest, DangerLevel, ExecutionJournalEntry, etc.
- `git.py` — GitCapability: status, diff, commit, push, rollback, blame, branch_policy, log, stash, rebase
- `verification.py` — VerificationCapability: regression_check, invariant_check, coverage, type_check, lint, test_run, audit
- `execution.py` — ExecutionCapability: run, sandbox, timeout, stream, retry, isolate, shell, script
- `filesystem.py` — FilesystemCapability: read, write, move, diff, archive, compress, snapshot, search, list, delete
- `document.py` — DocumentCapability: parse, extract, convert, validate, diff, template, render
- `media.py` — MediaCapability: image_resize, convert_format, extract_metadata, optimize, thumbnail
- `browser.py` — BrowserCapability: navigate, screenshot, click, fill, extract, evaluate, wait, export_pdf
- `network.py` — NetworkCapability: http_request, ping, dns_lookup, download, websocket, scrape
- `infra.py` — InfraCapability: container_run, k8s_apply, helm_deploy, docker_compose, terraform_plan, ssh
- `database.py` — DatabaseCapability: query, migrate, backup, restore, seed, schema_inspect, index_optimize
- `security.py` — SecurityCapability: secret_scan, audit_deps, semgrep_scan, sast, vulnerability_check, compliance_check
- `package.py` — PackageCapability: install, uninstall, list, freeze, build, publish, audit, update
- `notification.py` — NotificationCapability: send_email, send_slack, send_discord, send_webhook, log, alert
- `cloud.py` — CloudCapability: s3_upload, s3_download, lambda_invoke, ecs_deploy, cloudformation, secret_manager
- `nlp.py` — NLPCapability: classify, summarize, extract_entities, embed, similarity, translate, analyze_sentiment
- `math.py` — MathCapability: calculate, evaluate, plot, stats, optimize, matrix, differentiate, integrate
- `config.py` — ConfigCapability: get, set, list, validate, import_env, export_env, schema_validate
- `governance.py` — GovernanceCapability: trust_score, escalation, rollback_plan, blast_radius_analyze, verification_gate, execution_journal_query, risk_assessment, recovery

#### pipeline/ — 4+1 Stage Narrowing Stack
- `__init__.py` — pipeline package
- `narrowing.py` — Stage 0 (CapabilityRouter) + Stage 1 (DeterministicRetrieval) + Stage 2 (SemanticNarrowing) + Stage 3 (LocalInference) + Stage 4 (LLMReasoning) + NarrowingPipeline orchestrator
- `router.py` — Extensible CapabilityRouter with pluggy hooks, custom route registration

#### packs/ — Binary Bloat Solution
- `__init__.py` — pack package
- `core_pack.py` — core-pack (zero external deps): filesystem, execution, verification, config, governance
- `git_pack.py` — git-pack: git capability
- `infra_pack.py` — infra-pack: infra, database, cloud, security
- `browser_pack.py` — browser-pack: browser, network
- `media_pack.py` — media-pack: media, document
- `science_pack.py` — science-pack: math, nlp

#### governance/ — Epistemic Governance
- `__init__.py` — governance package
- `journal.py` — SQLite-backed ExecutionJournal (stdlib sqlite3, zero deps): append, query, get_by_id, count, stats, verify_evidence, export_json

#### migration/ — Legacy Tool Migration
- `__init__.py` — migration package
- `tool_map.py` — Full mapping of all 52 legacy tools → 18 capability domains with ToolAdapter for backward compatibility

### Key Design Decisions
- Governance is fully independent (no circular imports with other capabilities)
- Each capability has a CapabilityManifest with danger_level, pack, sandbox, evidence, and escalation policy
- trust_score = (verification_success_rate × 0.4) + ((1 - rollback_frequency) × 0.3) + (blast_radius_accuracy × 0.3)
- packs use lazy imports with graceful fallback
- tool_map.py provides backward compatibility for all 52 legacy tools
