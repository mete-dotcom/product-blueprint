# Environment Variables — Complete Setup

All vars must be added in **Vercel Dashboard → Project → Settings → Environment Variables**
(or in `.env.local` for local dev).

---

## 1. Vercel KV

Auto-injected when you add a KV store to the project.
If missing, add KV: Vercel Dashboard → Storage → Create → KV → Connect to project.

```
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

---

## 2. Paddle

Get from: paddle.com → Developer Tools → Authentication

```
# Client-side token — used in <script> Paddle.Initialize()
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_xxxxxxxxxxxxxxx

# "true" to use sandbox (testing), "false" or unset for production
NEXT_PUBLIC_PADDLE_SANDBOX=false

# Webhook secret — from Paddle Dashboard → Notifications → your webhook endpoint
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxxxxxxxxxxxxxx
```

---

## 3. DeepStrain pricing & Paddle price IDs

Get price IDs from: paddle.com → Catalog → Prices

```
# Base price display
NEXT_PUBLIC_DEEPSTRAIN_PRICE=9
NEXT_PUBLIC_DEEPSTRAIN_CURRENCY=USD
NEXT_PUBLIC_DEEPSTRAIN_PLAN=professional
NEXT_PUBLIC_DEEPSTRAIN_TAGLINE="private ai orchestration for autonomous workflows"
NEXT_PUBLIC_DEEPSTRAIN_SUBTITLE="compiled deepseek-based agent execution with secure local control"
NEXT_PUBLIC_DEEPSTRAIN_CTA="get deepstrain"

# Paddle price IDs — fill in your real IDs
NEXT_PUBLIC_DS_SOLO_MONTHLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_DS_SOLO_QUARTERLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_DS_SOLO_BIANNUAL=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_DS_SOLO_YEARLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_DS_TEAM_MONTHLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_DS_TEAM_QUARTERLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_DS_TEAM_BIANNUAL=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_DS_TEAM_YEARLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_DS_ENT_MONTHLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_DS_ENT_YEARLY=pri_01xxxxxxxxxxxxxx

# Team price for bundle page
NEXT_PUBLIC_DEEPSTRAIN_TEAM_PRICE=19
```

---

## 4. ATLAS pricing & Paddle price IDs

```
# Base price (Solo tier = BASE, Pro = BASE*2, Enterprise = BASE*4)
NEXT_PUBLIC_ATLAS_PRICE=19
NEXT_PUBLIC_ATLAS_CURRENCY=USD

# Paddle price IDs — fill in your real IDs
NEXT_PUBLIC_ATLAS_SOLO_MONTHLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_ATLAS_SOLO_YEARLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_ATLAS_PRO_MONTHLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_ATLAS_PRO_YEARLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_ATLAS_ENT_MONTHLY=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_ATLAS_ENT_YEARLY=pri_01xxxxxxxxxxxxxx
```

---

## 5. Bundle page

```
# Bundle Paddle price IDs (optional: can use multi-item checkout instead)
NEXT_PUBLIC_BUNDLE_DS_PADDLE=pri_01xxxxxxxxxxxxxx
NEXT_PUBLIC_BUNDLE_ATLAS_PADDLE=pri_01xxxxxxxxxxxxxx
```

---

## 6. License secrets (server-side only — NEVER prefix with NEXT_PUBLIC_)

Generate with:  `openssl rand -hex 32`

```
# ATLAS HMAC signing key — must match ATLAS_LICENSE_SECRET in your CLI
ATLAS_LICENSE_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# DeepStrain HMAC signing key
DEEPSTRAIN_LICENSE_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Password hashing salt (shared auth system)
DEEPSTRAIN_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 7. Resend (email delivery)

Get API key from: resend.com → API Keys

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxx

# Must be a verified sender domain in Resend
ATLAS_FROM_EMAIL=ATLAS <noreply@atlas.tools>
DEEPSTRAIN_FROM_EMAIL=deepstrain <noreply@deepstrain.dev>
```

---

## 8. Admin panel

```
# Any strong random string — used to protect /admin and /api/atlas/admin
DEEPSTRAIN_ADMIN_KEY=your-strong-admin-password
```

---

## 9. Founder visit notifications

```
# Your personal email — you'll get a notification when someone hits a high-intent page
# Covers: /, /pricing, /atlas, /atlas/pricing, /bundle, /register, /login,
#         /atlas/activate, /activate, /atlas/dashboard, /dashboard
# Rate-limited: 2h cooldown per page, max 8 emails/hour total
FOUNDER_NOTIFY_EMAIL=you@yourdomain.com
```

---

## Webhook URLs to register in Paddle

Register these two endpoints in Paddle Dashboard → Notifications → New notification:

| Product   | URL                                          | Events to subscribe                                                                           |
|-----------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| DeepStrain | `https://YOUR_VERCEL_URL/api/deepstrain/webhook` | subscription.created, transaction.completed, subscription.renewed, subscription.updated, subscription.canceled |
| ATLAS     | `https://YOUR_VERCEL_URL/api/atlas/webhook`  | subscription.created, transaction.completed, subscription.renewed, subscription.updated, subscription.canceled |

Replace `YOUR_VERCEL_URL` with your Vercel deployment URL or custom domain.

---

## Critical checklist before going live

- [ ] `PADDLE_WEBHOOK_SECRET` set and matching Paddle Notifications config
- [ ] `ATLAS_LICENSE_SECRET` set to same value as in `code_atlas/.env`
- [ ] `DEEPSTRAIN_LICENSE_SECRET` set to same value as in deepstrain config
- [ ] All `NEXT_PUBLIC_ATLAS_*_MONTHLY/YEARLY` set to real Paddle price IDs
- [ ] All `NEXT_PUBLIC_DS_*_MONTHLY/YEARLY` set to real Paddle price IDs
- [ ] `RESEND_API_KEY` set and sender domain verified
- [ ] Vercel KV store connected to project
- [ ] Test webhook with Paddle sandbox before switching to live
