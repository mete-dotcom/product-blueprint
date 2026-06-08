# massiron — Technical Reference

> Single source of truth for the three products, the commerce layer, data
> schemas, and operational details. Verified 2026-06-08. Keep this current.

## 1. Products & ports

| Product | What | Install | Local HTTP | Pricing |
|---|---|---|---|---|
| **deepstrain** | Terminal-native AI engineering agent (52 tools, DAG orchestration, BYOK DeepSeek) | `pip install deepstrain` | `:8765` (`/ui` dashboard) | Solo/Team/Enterprise, from $9/mo |
| **atlas** (code-atlas-py) | Deterministic code intelligence — call graph, risk, dead-code, security. 0 LLM tokens | `pip install code-atlas-py` | `:8780` (`atlas gui`) | Free · Pro $12 · Enterprise $29 |
| **adauto** | Developer-marketing automation (campaigns, ethics filter, human approval) | `pip install adauto` | `:8766` (`adauto gui`/`serve`) | Free · Pro |

- **Brand / site:** massiron.com (Next.js on Vercel). Old domains `deepstrain.dev`, `atlas.tools` are abandoned.
- **Real site repo:** `product-blueprint` (this repo). `deepstrain/vercel-commerce` is an abandoned older copy — do not edit it.
- Product landing pages: `massiron.com/deepstrain`, `/atlas`, `/adauto` (+ `/pricing`, `/atlas/pricing`).

## 2. Commerce architecture (product-blueprint, Next.js)

```
CLI → browser /activate → LemonSqueezy checkout → webhook → KV → CLI polls session → local license
```

- **Per-product webhooks:** `/api/{deepstrain,atlas,adauto}/webhook` (LemonSqueezy, X-Signature HMAC).
- **Auth/commerce pages:** activate, login, register, verify-email, forgot/reset-password, admin, dashboard, pricing, bundle.
- **API routes:** per product `activate-cli`, `activate-session`, `session`, `issue-recovery-key`, `redeem-recovery-key`, `webhook`; shared `login`, `register`, `verify`, `plans`, `tiers`, `track`, `user`, `admin`.

## 3. Data store — Upstash Redis (`src/lib/store.ts`)

Client: `@upstash/redis`, env `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
(Note: `.env.example` still lists legacy `KV_REST_API_*` names — store.ts uses the `UPSTASH_*` names.)

### Key namespaces

| Key | Value | Notes |
|---|---|---|
| `user:{email}` | `User` | v1 login (id, email, name, passwordHash, tier, created, verified) |
| `license:{key}` | `License` | v1 (key, userId, email, tier, issued, expires, valid, hardware_id) |
| `session:{token}` | `Session` | login session, TTL from `expires` |
| `deepstrain:lic:{email}` | `DeepstrainLicense` | HMAC-signed (see §4) |
| `deepstrain:act:{sessionId}` | `DeepstrainLicense` | activation poll target, TTL 7200s |
| `atlas:lic:{email}` / `atlas:act:{sessionId}` | `AtlasLicense` | adds `modules[]` |
| `adauto:lic:{email}` / `adauto:act:{sessionId}` | `AdautoLicense` | adds `key` (ADTO-…), tier free/pro |

## 4. License format (HMAC-signed)

`DeepstrainLicense` (atlas/adauto parallel, with extra fields):
```
version, email, tier, sale_id, subscription_id, issued_at, expires_at, signature
```
- **Signature:** `HMAC-SHA256(secret, canonical)` where `canonical = JSON.stringify(sortedEntries(payload)).replace(/\s/g,"")` (keys sorted, whitespace stripped, `signature` excluded).
- **Secret:** `DEEPSTRAIN_LICENSE_SECRET` (atlas/adauto have their own).
- **Validity:** `LICENSE_DAYS = 35` from webhook (renews each billing cycle); edge revocation supported.
- **Tiers:** deepstrain `solo|team|enterprise`; atlas `free|pro|enterprise` (+ `modules[]`); adauto `free|pro`.
- **Local file:** `~/.deepstrain/.license` = `{payload, signature}` (CLI also accepts the new `{license:{…,signature}}` shape).

## 5. Webhook events (LemonSqueezy)

- **Issue/renew:** `subscription_created` (new), `order_created` → `generateLicense` → persist → Resend email (license JSON attached) → admin notify.
- **Tier change:** `subscription_updated` → re-issue if tier differs.
- **Expire:** `subscription_expired` → set `expires_at = now`, re-sign.
- **Cancel (grace):** `subscription_cancelled` → keep until period end, log only.
- Signature skipped if `LEMON_WEBHOOK_SECRET` unset (dev mode) — **must be set in production.**

## 6. Activation flow (CLI ↔ web)

1. `deepstrain configure` / `setup` opens browser at `/activate?session={id}`.
2. User completes LemonSqueezy checkout.
3. Webhook writes `deepstrain:act:{session}` (TTL 2h).
4. CLI polls `/api/deepstrain/session?id={session}` → `{status:"ready", license}`.
5. CLI writes `~/.deepstrain/.license` locally. Works offline thereafter.

## 7. Dev / test licenses (no purchase)

`POST /api/admin/issue-dev-license` — admin-gated (`X-Admin-Key: $DEEPSTRAIN_ADMIN_KEY`), writes the **same** keys + HMAC as the webhook:
```bash
curl -X POST https://massiron.com/api/admin/issue-dev-license \
  -H "X-Admin-Key: $DEEPSTRAIN_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"email":"dev@massiron.com","tier":"enterprise","days":365}'
```
(Currently deepstrain only; atlas/adauto need `modules[]`/`key` handling.)
Atlas also has client-side `atlas activate-dev <DEV-ENT-key>` (hidden command).
**Note:** legacy `seed.js` uses an obsolete schema (`user:`/`license:` + Paddle) — do not use.

## 8. Discovery & mesh (deepstrain)

- **mDNS:** `discover.py` registers via Zeroconf as `deepstrain-{host}.local`, service `_deepstrain._tcp` on `:8765`. `start_mdns`/`stop_mdns`. OS-level broadcast so other devices on the LAN auto-discover.
- **Mesh:** primary node + peer listener; per-device permission matrix in `/ui`. Team tier required for LAN binding (`0.0.0.0`).

## 9. Sub-agents (deepstrain)

`_run_sub_agent` / `spawn_agents` (parallel) / `delegate` (single). Read-only by default; `permission` = `read | dry-run | write`.

Built-in roles (`list_agent_types`): `analyst, security, performance, test, docs, refactor`.

For big jobs: hand off to `deepstrain_eval` and ask it to **spawn sub-agents for independent pieces** (parallel, ~10× cheaper). eval needs an API key (in its own `~/.deepstrain` config) and stalls on broad tasks over large files — keep delegated tasks atomic.

## 10. CLI surface (simplified 2026-06-08)

**deepstrain:** `chat` · `run` (=eval) · `setup` (=configure) · `activate` · `gui` · `serve` · `mcp` · `doctor` · `status`
(advanced/internal: `admin, devices, join, alias, service, mcp-panel, exec, why, hello, init`)

**atlas:** `scan` · `ask` · `fix` · `gui` · `inject` · `mcp` · `pack-for-claude`
(hidden dev/CI: `release, release-check, git-check, capability-sync, capability-status, activate-dev`)

**adauto:** `new <url>` · `run -c <name>` · `review` · `post` · `hunt` · `signals` · `report` · `serve` · `gui` · `init-from-repo`

## 11. LLM backends

- **deepstrain:** BYOK DeepSeek (cloud) or local (Ollama `:11434/v1`, LM Studio `:1234/v1`) via `DEEPSTRAIN_BASE_URL`.
- **adauto generator** priority: deepstrain `/eval` → OpenAI-compat (`ADAUTO_LLM_URL`+`ADAUTO_LLM_KEY`, e.g. Ollama) → Anthropic (`ANTHROPIC_API_KEY`). Model via `ADAUTO_LLM_MODEL`.
- **atlas:** 0 LLM — fully deterministic static analysis.

## 12. Key environment variables

| Var | Used by | Purpose |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | web | KV store |
| `DEEPSTRAIN_LICENSE_SECRET` (+ atlas/adauto) | web | HMAC signing |
| `LEMON_WEBHOOK_SECRET` | web | webhook signature verify |
| `DEEPSTRAIN_ADMIN_KEY` | web | admin + dev-license endpoints |
| `RESEND_API_KEY` | web | license emails |
| `FOUNDER_NOTIFY_EMAIL` | web | purchase notifications |
| `NEXT_PUBLIC_DS_*` / `NEXT_PUBLIC_LS_*` | web | LemonSqueezy variant IDs → tier |
| `DEEPSEEK_API_KEY` / `DEEPSTRAIN_BASE_URL` | deepstrain | LLM backend |
| `ADAUTO_LLM_URL` / `_KEY` / `_MODEL`, `ADAUTO_DS_URL` | adauto | content generation |

## 13. Open items (2026-06-08)

- adauto: 53 placeholder drafts queued (Ollama flaked) — clear + regenerate with a stable backend.
- `/api/intake` extraction weak on client-rendered pages (massiron is SSR-light) — use `use_llm=true` or SSR.
- dev-license endpoint: add atlas (`modules[]`) + adauto (`key`) variants.
- Site redesign pending — "bold & assertive" direction (benefit-first, clear product separation, trust → checkout).
- deepstrain repo carries a large uncommitted backlog (incl. abandoned vercel-commerce) to review.
