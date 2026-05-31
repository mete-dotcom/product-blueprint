# Payments & Activation — mete-dotcom Standard

> **Referans implementasyon:** `product-blueprint` (massiron.com).
> Bu belge, satın alım → lisans → aktivasyon zincirinin **çelikten** standardıdır.
> Her yeni ürün bu deseni birebir izler. Reference impl. `src/pages/api/` altındadır.

---

## 0. Tasarım İlkeleri

| İlke | Açıklama |
|---|---|
| **Tek domain** | Tüm ürünler tek Vercel sitesinden akar (massiron.com). Landing + ödeme + lisans API. |
| **Tek KV** | Upstash Redis — tüm ürünler aynı store'u namespace'lerle paylaşır. |
| **Tek config kaynağı** | `src/lib/site.ts` → her URL/email `NEXT_PUBLIC_SITE_URL`'den türer. Hardcode YASAK. |
| **Offline-doğrulanabilir lisans** | HMAC-SHA256 imzalı. Ürün, sunucuya gitmeden lisansı doğrular. |
| **İki teslim yolu** | (a) email'le lisans, (b) tarayıcı→CLI session polling köprüsü. |
| **Sessiz başarısızlık yok** | Para/aktivasyon yolunda her adım loglanır ve admin'e bildirilir. |
| **Kurtarma her zaman var** | Aktivasyon başarısız olsa bile tek-kullanımlık recovery key ile lisans alınır. |

---

## 1. Mimari — Para Akışı

```
Müşteri (tarayıcı)
  │  /pricing → Paddle Checkout (client token + pri_xxx)
  ▼
Paddle (Merchant of Record)
  │  ödeme onayı → webhook (HMAC imzalı)
  ▼
POST /api/{product}/webhook
  │  1. Paddle imzasını doğrula (paddle-signature header)
  │  2. price_id → tier çöz
  │  3. HMAC-SHA256 imzalı lisans üret
  │  4. KV'ye yaz: {product}:lic:{email}
  │  5. custom_data.session varsa → {product}:act:{session} (TTL 7200s)
  │  6. Müşteriye lisans email'i (Resend)
  │  7. Admin'e bildirim email'i (FOUNDER_NOTIFY_EMAIL)
  ▼
İki aktivasyon yolu:
  A) CLI doğrudan:  POST /api/{product}/activate-cli  {email, password}
  B) Tarayıcı köprü: POST /api/{product}/activate-session {email,password,session}
                     → CLI poll: GET /api/{product}/session?id={session}
```

---

## 2. KV Store — `src/lib/store.ts`

**Upstash Redis kullan. `@vercel/kv` KULLANMA** (deprecated, build'de patlar).

```ts
import { Redis } from "@upstash/redis";
const kv = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### Namespace standardı
| Anahtar | İçerik | TTL |
|---|---|---|
| `user:{email}` | Hesap (id, email, name, passwordHash, tier, created) | kalıcı |
| `{product}:lic:{email}` | Aktif lisans (imzalı) | kalıcı |
| `{product}:act:{session}` | Tarayıcı→CLI köprüsü için lisans | 7200s |
| `activation:{session}` | (deepstrain v1 — eski) | 7200s |

`{product}` ∈ `deepstrain` · `atlas` · `adauto`. Yeni ürün → yeni namespace.

---

## 3. Modüler Config — `src/lib/site.ts`

Her dışa dönük URL/email TEK kaynaktan. Domain değişirse sadece `NEXT_PUBLIC_SITE_URL` değişir.

```ts
export const SITE_URL  = (process.env.NEXT_PUBLIC_SITE_URL || "https://massiron.com").replace(/\/+$/, "");
export const SITE_HOST = hostOf(SITE_URL);
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || `support@${SITE_HOST}`;

export function pricingUrl(product): string  // deepstrain → /pricing, diğerleri → /{product}/pricing
export function productUrl(product): string  // ürün ana sayfası
export function fromEmail(product): string   // "{product} <noreply@massiron.com>" (env override: {PRODUCT}_FROM_EMAIL)
```

**KURAL:** API/sayfa içinde `atlas.tools`, `deepstrain.dev` gibi sabit domain YAZMA. Hep `site.ts`.

---

## 4. Endpoint Standardı — `src/pages/api/{product}/`

Her ürün **aynı 7 endpoint'e** sahip olmalı:

| Endpoint | Metod | Görev |
|---|---|---|
| `webhook` | POST | Paddle olayları → lisans üret + sakla + email |
| `activate-cli` | POST | `{email,password}` → imzalı lisans döndür |
| `activate-session` | POST | `{email,password,session}` → KV'ye yaz (köprü) |
| `session` | GET | `?id={session}` → lisansı tek-kullanımlık döndür |
| `issue-recovery-key` | POST | Admin → tek-kullanımlık `RK1-XX-...` üret |
| `redeem-recovery-key` | POST | CLI → recovery key → lisans |

Ortak (ürün-bağımsız): `/api/register`, `/api/login`, `/api/verify`, `/api/track`.

---

## 5. Webhook Deseni (çelik çekirdek)

```ts
export const config = { api: { bodyParser: false } };  // ham bytes ŞART (imza doğrulama)
```

Akış:
1. **Ham body oku** (`readRawBody`) — Paddle imzası tam byte üzerinden doğrulanır.
2. **İmza doğrula** — `paddle-signature` header'ı `ts:body` → HMAC-SHA256 → `timingSafeEqual`.
   Secret yoksa geçişe izin ver (`!PADDLE_SECRET`) — sadece kurulum/test için.
3. **Olay yönlendir:** `subscription.created` · `transaction.completed` · `subscription.renewed` · `subscription.updated` · `subscription.canceled`.
4. **price_id → tier** çöz (`PRICE_TIERS` map; fallback ürün adından).
5. **Lisans üret** — aşağıdaki imza standardı.
6. **Sakla** — `set{Product}License(email, lic)` + session varsa `set{Product}Activation`.
7. **Email** — müşteriye lisans (Resend), admin'e bildirim (`notifyAdmin`).
8. **Her zaman 200 dön** (ignored olaylar dahil) — Paddle retry fırtınasını önler.

### Lisans imza standardı (HMAC-SHA256)
```ts
const canonical = JSON.stringify(
  Object.fromEntries(Object.entries(payload).sort())  // anahtarlar sıralı
).replace(/\s/g, "");                                  // tüm boşluk silinir
const sig = crypto.createHmac("sha256", SECRET).update(canonical).digest("hex");
```
Aynı kanonik üretim **hem Vercel'de (imzalama) hem üründe (doğrulama)** kullanılır.
Lisans süresi: **35 gün** (`LICENSE_DAYS`) — aylık abonelikte 5 gün tampon.

---

## 6. Aktivasyon Yolları

### A) CLI doğrudan — `activate-cli`
`{email, password}` → parola doğrula (timing-safe) → KV'den lisans → döndür.
- Lisans yok → **402** + `upgrade_url: pricingUrl(product)`
- Süresi dolmuş → **402** + `upgrade_url`
- Başarı → `{success, license, tier, expires}` + admin bildirim.

### B) Tarayıcı→CLI köprüsü
```
deepstrain configure → tarayıcı açılır → /activate?session={uuid}
  → kullanıcı giriş yapar → POST activate-session
  → KV: {product}:act:{session} (7200s)
CLI paralelde her 2-3sn: GET session?id={uuid}
  → "ready" + lisans (TEK KULLANIM, okununca silinir) | "pending"
```

### Parola standardı
```ts
hash = sha256(password + DEEPSTRAIN_SECRET_KEY)   // tüm ürünler aynı salt → tek hesap
// karşılaştırma DAİMA timing-safe (sabit 64-byte pad + length check)
```

---

## 7. Recovery Key (kurtarma) — `RK1-{XX}-{HMAC}`

Müşteri ödedi ama aktivasyon başarısız → admin tek-kullanımlık key üretir.
- `issue-recovery-key`: `RECOVERY_ADMIN_KEY` header ister → HMAC imzalı key + KV kaydı.
- `redeem-recovery-key`: CLI key'i bozdurur → lisans. Tek kullanım (KV'de tüketilmiş hash).
- Edge Middleware rate-limit: `5 req/60s/IP`.
- Ürün kodları: deepstrain=`DS`, atlas=`AT`, adauto=`AA`.

---

## 8. Email (Resend)

```ts
fetch("https://api.resend.com/emails", { headers: { Authorization: `Bearer ${RESEND_API_KEY}` }, ... })
```

| Email | Tetikleyici | Alıcı |
|---|---|---|
| Lisans teslimi | webhook (satın alım/yenileme) | müşteri |
| Admin bildirimi | webhook + activate-cli | `FOUNDER_NOTIFY_EMAIL` |
| Ziyaret bildirimi | `/api/track` (debounce'lu) | `FOUNDER_NOTIFY_EMAIL` |

**⚠ ZORUNLU:** From-domain Resend'de **doğrulanmış** olmalı (SPF+DKIM DNS). Doğrulanmadan
gönderim **403**, sadece hesap sahibinin adresine gider. `noreply@massiron.com` → massiron.com
resend.com/domains'de verify edilmeli. Tüm email gönderimleri `try/catch` ile sarılır —
email hatası ASLA webhook'u veya aktivasyonu düşürmez (`return false`).

---

## 9. Environment Variables (tam liste)

### Altyapı (ürün-bağımsız)
```
NEXT_PUBLIC_SITE_URL          = https://massiron.com
NEXT_PUBLIC_SUPPORT_EMAIL     = support@massiron.com   (opsiyonel; fallback otomatik)
UPSTASH_REDIS_REST_URL        = https://....upstash.io
UPSTASH_REDIS_REST_TOKEN      = (encrypted)
RESEND_API_KEY                = re_...  (encrypted)
FOUNDER_NOTIFY_EMAIL          = admin bildirimleri için
DEEPSTRAIN_SECRET_KEY         = parola salt'ı (tüm ürünler ortak) (encrypted)
DEEPSTRAIN_ADMIN_KEY          = /api/admin için (encrypted)
RECOVERY_SECRET               = recovery key HMAC (encrypted)
RECOVERY_ADMIN_KEY            = recovery üretimi için (encrypted)
```

### Lisans secret'ları (ürün başına, encrypted)
```
DEEPSTRAIN_LICENSE_SECRET   ATLAS_LICENSE_SECRET   ADAUTO_LICENSE_SECRET
```

### From-email (ürün başına, opsiyonel override)
```
DEEPSTRAIN_FROM_EMAIL   ATLAS_FROM_EMAIL   ADAUTO_FROM_EMAIL
```

### Paddle
```
PADDLE_WEBHOOK_SECRET            = pdl_ntfset_...  (webhook imza doğrulama, encrypted)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN  = live_... | test_...
NEXT_PUBLIC_PADDLE_SANDBOX       = true (sandbox testte) | false (production)
NEXT_PUBLIC_PADDLE_ENV           = sandbox | production
```

### Price ID'ler (`pri_xxx`, ürün+tier+dönem başına)
```
deepstrain: NEXT_PUBLIC_DS_{SOLO|TEAM}_{MONTHLY|QUARTERLY|BIANNUAL|YEARLY}
            NEXT_PUBLIC_DS_ENT_{MONTHLY|YEARLY}
atlas:      NEXT_PUBLIC_ATLAS_{SOLO|PRO|ENT}_{MONTHLY|YEARLY}
adauto:     NEXT_PUBLIC_ADAUTO_PRO_{MONTHLY|YEARLY}
```

---

## 10. Paddle Kurulumu (sandbox → production)

1. **Sandbox'ta başla:** sandbox-vendors.paddle.com (verification gerekmez).
2. **Catalog → Products + Prices** → her tier/dönem için `pri_xxx` topla.
3. **Notifications → destination** → `https://massiron.com/api/{product}/webhook`
   (her ürün ayrı). Events: created/completed/renewed/updated/canceled. → secret al.
4. **Authentication → Client-side token** al.
5. Tüm değerleri Vercel env'e yaz.
6. **Test kartı `4242 4242 4242 4242`** ile checkout → webhook → lisans → activate zinciri.
7. Çalışınca: production hesabında 1-6'yı tekrarla, `NEXT_PUBLIC_PADDLE_SANDBOX=false`,
   website verification (pricing/terms/privacy/refund URL'leri) tamamla.

**Production verification için 4 sayfa zorunlu:** `/pricing` `/terms` `/privacy` `/refund`.

---

## 11. Release / Versiyon Standardı ⚠ (sessiz-yayın-hatası tuzağı)

**Sorun:** Wheel sürümü kaynakta hardcode'sa, git tag'i atılsa bile build ESKİ sürümle
derler → PyPI `skip-existing` ile SESSİZCE atlar → CI "success" der ama PyPI değişmez.

**Standart:** Sürüm TEK kaynaktan — **git tag** (`GITHUB_REF_NAME`):
```python
# build_wheel.py / build script
VERSION = os.environ.get("GITHUB_REF_NAME", "").lstrip("v") or "<fallback>"
```
`pyproject.toml` static sürüm kullanan ürünlerde (adauto) build script, tag'den
`pyproject.toml` + `__init__.py` sürümünü pat'ler (`sync_version_from_tag`).

**Kontrol:** Yayından sonra her zaman PyPI'yi DOĞRULA, CI yeşiline güvenme:
```bash
curl -s https://pypi.org/pypi/{paket}/json | jq -r .info.version
```
PyPI adları: `deepstrain` · **`code-atlas-py`** · `adauto`. OIDC Trusted Publisher (`environment: pypi`).

---

## 12. Test Checklist (canlı doğrulama)

```bash
SITE=https://massiron.com
# 1. Kayıt
curl -s $SITE/api/register -X POST -H "Content-Type: application/json" \
  -d '{"email":"t@x.com","password":"test12345","name":"T"}'           # → success
# 2. Tekrar kayıt → 409 "already registered"
# 3. Login doğru/yanlış parola → token / 401
# 4. Webhook simülasyonu (sandbox secret yokken)
curl -s $SITE/api/{product}/webhook -X POST -H "Content-Type: application/json" \
  -d '{"event_type":"subscription.created","data":{"id":"sub_test",
       "customer":{"email":"t@x.com","name":"T"},
       "items":[{"price":{"id":"<pri_id>","product":{"name":"Pro"}}}]}}'  # → ok, tier
# 5. activate-cli → imzalı lisans (200)
# 6. session köprüsü: webhook custom_data.session → GET session?id=... → ready, sonra pending
```

Her yeni üründe bu 6 adım YEŞİL olmadan production'a geçme.

---

*Bu belge yaşayan standarttır. Para/aktivasyonda yeni bir şey öğrenildikçe buraya işlenir.*
*Son güncelleme: 2026-05-31 — Upstash geçişi, site.ts modülü, adauto webhook, tag-türevli sürüm fix.*
