# Product Blueprint — mete-dotcom Standard

> Her yeni ürün bu şablonu izler.  
> **Referans implementasyonlar:** `deepstrain` (v0.5.3) · `code-atlas` (v0.9.7)

---

## 1. Felsefe

**"Aşırı kompakt ürün"** — tek pip install, her LLM'in anlayacağı şekilde kendini tanıtır,
ödeme dahil her şey tek Vercel'den akar, bilgisayar açıkken her zaman erişilebilir.

| Kural | Açıklama |
|---|---|
| Sıfır kurulum karmaşıklığı | `pip install <product>` → çalışmaya başlar |
| LLM-first | `GET /` → LLM anında ne yapacağını bilir |
| Her zaman açık | OS servisi → bilgisayar açılınca otomatik başlar |
| Ağ-şeffaf | mDNS → `<product>.local` adıyla LAN'dan erişilir |
| Plan-önce agent | Karmaşık görevlerde önce plan al, onayla, çalıştır |
| Boş durmaz | Idle timeout → kaynak israf etmez, OS servisi başlatır |

---

## 2. Ürün Mimarisi

```
pip install <product>
        │
        ├── <product> serve --host 0.0.0.0 --port 8765
        │       ├── GET  /          ← LLM onboarding (self-description JSON)
        │       ├── GET  /health    ← liveness probe
        │       ├── GET  /tools     ← tool listesi + şema
        │       ├── POST /exec      ← direkt tool çağrısı (AI yok)
        │       └── POST /eval      ← AI agent loop (plan_first desteği)
        │
        ├── <product> service install   ← OS startup (boot'ta otomatik)
        ├── <product> service status
        ├── <product> configure         ← API key / ödeme
        └── <product> mcp               ← Claude Desktop / Cursor entegrasyonu
```

### 2.1 Dizin Yapısı (Python Paketi)

```
<product>/
├── __init__.py          # __version__ = "x.y.z"
├── cli.py               # Tüm CLI komutları + HTTP server (cmd_serve)
├── service.py           # OS startup service (Windows/Linux/macOS)
├── discover.py          # mDNS yayını (zeroconf)
├── license.py           # Offline lisans doğrulama
├── licensing_core.py    # Paylaşılan imzalama mantığı (Vercel API ile aynı)
├── chat.py              # TOOL_SCHEMAS, TOOL_HANDLERS, DEFAULT_MODEL
└── mcp_server.py        # MCP JSON-RPC bridge (isteğe bağlı)

api/                     # Vercel serverless functions
├── verify.py            # POST /api/verify  — lisans doğrulama
├── webhook.py           # POST /api/webhook — Paddle ödeme olayları
├── session.py           # GET  /api/session — terminal lisans poll
└── kv.py                # Upstash Redis yardımcısı (stdlib only)

vercel-commerce/         # Next.js ödeme sayfası (isteğe bağlı, ortak kullanılabilir)
```

---

## 3. HTTP Server Standartı

### 3.1 `GET /` — LLM Onboarding

Her ürünün HTTP sunucusu `GET /` isteğine şu JSON'u döndürür:

```json
{
  "name": "<product>",
  "version": "x.y.z",
  "description": "Tek cümle açıklama",
  "mode": "full-ai | tool-only",
  "endpoints": {
    "GET  /":        "Bu self-description",
    "GET  /health":  "Liveness probe",
    "GET  /tools":   "Araç listesi + şema",
    "POST /exec":    "{\"tool\": \"<name>\", \"args\": {...}}",
    "POST /eval":    "{\"prompt\": \"<görev>\", \"max_turns\": 8}",
    "POST /eval plan": "{\"prompt\": \"<görev>\", \"plan_first\": true}",
    "POST /eval exec": "{\"plan_id\": \"<id>\", \"approved\": true}"
  },
  "eval_tips": [
    "Tek odaklı görev gönder",
    "Çok adımlı işlerde plan_first:true kullan — onayla, sonra çalıştır",
    "plan_first:'auto' (varsayılan) — karmaşık prompt'larda otomatik plan"
  ],
  "lan_access": "http://<product>.local:<port>/eval"
}
```

### 3.2 `/eval` Plan-First Akışı

```
POST /eval  {"prompt": "...", "plan_first": true}
    ↓
{"status": "plan_ready", "plan": "1. ...\n2. ...", "plan_id": "abc123"}
    ↓ (kullanıcı / orchestrator inceler)
POST /eval  {"plan_id": "abc123", "approved": true}
    ↓
{"prompt": "...", "answer": "...", "turns": 5}
```

**Auto-detect:** `plan_first:"auto"` (varsayılan) — prompt uzun + aksiyon kelimeleri
içeriyorsa (create, write, install, modify) otomatik plan modu tetiklenir.

### 3.3 Idle Timeout

```bash
<product> serve --idle-timeout 1800   # 30 dk (varsayılan)
<product> serve --idle-timeout 0      # asla kapanma
```

Timeout dolunca sunucu kapanır, OS servisi bir sonraki boot'ta yeniden başlatır.

---

## 4. OS Startup Service

### Windows (Admin gerektirmez)

İki mekanizma birlikte kullanılır:

| Mekanizma | Yol |
|---|---|
| VBS başlatıcı | `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\<product>_serve.vbs` |
| Registry Run | `HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run\<ProductName>` |

```bash
<product> service install   # kurulum + hemen başlatma
<product> service status    # VBS var mı? registry var mı? port açık mı?
<product> service uninstall # VBS + registry siler, süreci sonlandırır
```

**Komut:** `<product> serve --host 0.0.0.0 --port 8765`  
**Log:** `%TEMP%\<product>_serve.log`

### Linux (systemd)

```ini
[Unit]
Description=<Product> MCP Server
After=network.target

[Service]
ExecStart=<product> serve --host 0.0.0.0 --port 8765
Restart=on-failure

[Install]
WantedBy=default.target
```

### macOS (launchd)

```xml
<key>ProgramArguments</key>
<array>
  <string><product></string>
  <string>serve</string>
  <string>--host</string><string>0.0.0.0</string>
  <string>--port</string><string>8765</string>
</array>
```

---

## 5. mDNS / LAN Discovery

`zeroconf` kütüphanesi kullanılır. İki isim birden yayınlanır:

| İsim | Amaç |
|---|---|
| `<product>.local` | Tek cihaz LAN'ında canonical isim |
| `<product>-<hostname>.local` | Çoklu cihaz LAN'ında per-device fallback |

```python
# Service types
_MCP_TYPE        = "_mcp._tcp.local."
_PRODUCT_TYPE    = "_<product>._tcp.local."

# Properties
props = {
    b"label":   label.encode(),
    b"tools":   str(tool_count).encode(),
    b"tier":    tier.encode(),
    b"version": version.encode(),
    b"eval":    f"http://<product>.local:{port}/eval".encode(),
}
```

Çakışma olduğunda `<product>.local` başarısız olursa `<product>-<hostname>.local`'a geri düşer.

---

## 6. Lisanslama Akışı

> 📘 **Tam standart:** Para → lisans → aktivasyon zincirinin çelikten, kanıtlanmış
> implementasyonu için → **[PAYMENTS_AND_ACTIVATION.md](PAYMENTS_AND_ACTIVATION.md)**.
> (Upstash KV, site.ts modülü, webhook deseni, session köprüsü, recovery key,
> env var listesi, Paddle kurulumu, release/versiyon tuzağı, test checklist.)

```
Kullanıcı → <product> configure
         → Tarayıcı açılır: https://deepstrain.vercel.app/buy?session=<uuid>
         → Paddle ödeme formu
         → Ödeme onayı → Paddle webhook → /api/webhook
         → Lisans anahtarı üretilir (HMAC-SHA256)
         → KV'ye yazılır: session:<uuid> → {key, payload, signature} (2 saat TTL)
         → Terminal /api/session'ı poll eder (her 3 sn, max 10 dk)
         → Lisans bulundu → ~/.deepstrain/config.toml'a yazılır
         → "Aktivasyon tamamlandı" mesajı
```

### Lisans Anahtarı Formatı

```
DSTR-AAAAA-BBBBB-CCCCC-DDDDD
```

- Prefix: ürüne özgü (`DSTR`, `CATL`, vb.)
- HMAC-SHA256 ile imzalanmış
- `deepstrain/licensing_core.py` ← hem Vercel hem runtime aynı kodu kullanır

### Vercel API Fonksiyonları

```
POST /api/webhook  — Paddle olayları (subscription_created, one_time_purchase)
POST /api/verify   — Lisans doğrulama (BaseHTTPRequestHandler formatı)
GET  /api/session  — Terminal'in poll ettiği endpoint (KV'den okur)
```

**Kritik:** `api/*.py` dosyaları `BaseHTTPRequestHandler` alt sınıfı olmalı
(eski `def handler(request)` dict-return formatı artık Vercel'de tanınmıyor).

---

## 7. Vercel Yapılandırması

### `vercel.json`

```json
{
  "version": 2,
  "functions": {
    "api/*.py": {
      "runtime": "@vercel/python@6.43.3"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

**Notlar:**
- `"python3.12"` geçersiz runtime ismi — `@vercel/python@X.Y.Z` kullan
- `functions` bloğu olmadan Vercel Python dosyalarını algılamıyor
- Framework preset'i Vercel dashboard'da `None` olmalı (Next.js algılaması engeli)
- SSO Deployment Protection varsayılan açık — public API için kapatlmalı:

```python
# Vercel REST API ile kapat
PATCH /v9/projects/<id>  {"ssoProtection": null}
```

### `api/` Dosyaları için sys.path Düzeltmesi

```python
# Her api/*.py dosyasının başına ekle:
import sys
from pathlib import Path

_ROOT = Path(__file__).parent.parent
_API_DIR = Path(__file__).parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))
if str(_API_DIR) not in sys.path:
    sys.path.insert(0, str(_API_DIR))
```

---

## 8. deepstrain Entegrasyonu

Ürünün kendi geliştirmesi sırasında deepstrain kullanılır:

```bash
# Sunucuyu başlat (OS servisi zaten açık tutmalı)
deepstrain serve --host 0.0.0.0 --port 8765

# Karmaşık görev → plan al → onayla → çalıştır
curl -X POST http://localhost:8765/eval \
  -d '{"prompt": "...", "plan_first": true}'
# → plan_id döner

curl -X POST http://localhost:8765/eval \
  -d '{"plan_id": "abc123", "approved": true}'
# → görev çalıştırılır
```

**Kural:** `/eval`'e tek odaklı görev gönder. Çok adımlı işlerde `plan_first:true`.

---

## 9. LLM Rehber Dosyası

Her ürün reposunda `<PRODUCT>_LLM_GUIDE.md` bulunur.  
Bağlanan herhangi bir LLM bu dosyayı okuyarak ürünü anlar.

İçermesi gerekenler:
- `GET /` → full JSON örneği
- `/eval` kuralları ve max_turns önerileri
- `/exec` tool listesi + örnek çağrılar
- Plan-first akışı örneği
- CLI kullanım örnekleri
- Çok cihazlı LAN kurulumu

---

## 10. Yeni Ürün Kontrol Listesi

```
[ ] pip install edilebilir paket (pyproject.toml / setup.cfg)
[ ] <product> serve --host / --port / --idle-timeout
[ ] GET / self-description (LLM onboarding JSON)
[ ] POST /eval → plan_first desteği
[ ] POST /exec → direkt tool çağrısı
[ ] <product> service install/status/uninstall (Windows+Linux+macOS)
[ ] mDNS: <product>.local + <product>-<hostname>.local
[ ] OS servisi: boot'ta otomatik başlat
[ ] Idle timeout: 30 dk varsayılan
[ ] license.py + licensing_core.py
[ ] api/verify.py + api/webhook.py + api/session.py (BaseHTTPRequestHandler)
[ ] vercel.json: @vercel/python runtime, SSO protection kapalı
[ ] <PRODUCT>_LLM_GUIDE.md
[ ] CHANGELOG.md — sürüm geçmişi
[ ] deepstrain ile test edildi (plan_first akışı)
```

---

## 11. Sürüm Standardı

Sürüm numarası şu dosyalarda tutarlı olmalı:

```
<product>/__init__.py    → __version__ = "x.y.z"
pyproject.toml           → version = "x.y.z"
setup.cfg                → version = x.y.z
<product>/portable.py    → _<PRODUCT>_VERSION = "x.y.z"
```

Güncelleme sırası: `__init__.py` → `pyproject.toml` → `setup.cfg` → `portable.py`

---

## 12. Referans Implementasyonlar

| Ürün | Repo | Özellik |
|---|---|---|
| deepstrain | `mete-dotcom/deepstrain` | İlk implementasyon. /eval, plan_first, idle timeout, mDNS, Windows service |
| code-atlas | `mete-dotcom/code-atlas` | MCP SDK (streamable-http), edge graph, mDNS beacon |

---

*Bu doküman yaşayan bir standarttır. Yeni bir şey öğrendikçe buraya eklenir.*
