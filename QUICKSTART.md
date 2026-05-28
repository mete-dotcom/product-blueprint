# Yeni Ürün Başlatma — Hızlı Başvuru

## Adım 1 — Paket İskeleti

```bash
mkdir my-product && cd my-product
git init && git checkout -b main

# Temel dosyalar
touch my_product/__init__.py
touch my_product/cli.py
touch my_product/service.py
touch my_product/discover.py
touch my_product/license.py
touch my_product/licensing_core.py
touch my_product/chat.py

# Vercel API
mkdir api
touch api/verify.py api/webhook.py api/session.py api/kv.py

# Config
touch pyproject.toml setup.cfg vercel.json
touch MY_PRODUCT_LLM_GUIDE.md
```

## Adım 2 — Kopyala-Uyarla (Referans: deepstrain)

| Kaynak | Hedef | Değişiklik |
|---|---|---|
| `deepstrain/service.py` | `my_product/service.py` | App adı, komut, log yolu |
| `deepstrain/discover.py` | `my_product/discover.py` | Service type, product adı |
| `deepstrain/licensing_core.py` | `my_product/licensing_core.py` | Prefix (DSTR → MYPR) |
| `deepstrain/license.py` | `my_product/license.py` | Config dosya yolu |
| `api/verify.py` | `api/verify.py` | Prefix kontrolü |
| `api/webhook.py` | `api/webhook.py` | Import yolları |
| `api/session.py` | `api/session.py` | Direkt kopyalanabilir |
| `api/kv.py` | `api/kv.py` | Direkt kopyalanabilir |
| `vercel.json` | `vercel.json` | Direkt kopyalanabilir |

## Adım 3 — `cli.py` HTTP Server

`cmd_serve()` içinde mutlaka olmalı:

```python
# Plan-first state
_pending_plans: dict = {}
_last_request = [time.monotonic()]
idle_timeout = getattr(args, 'idle_timeout', 1800)

# Handler içinde:
#   do_GET → _last_request[0] = time.monotonic()
#   do_POST → _last_request[0] = time.monotonic()
#   GET / → self-description JSON
#   POST /eval → plan_first desteği
#   Idle watchdog thread
```

## Adım 4 — Vercel Deploy

```bash
# 1. Vercel framework preset'ini temizle (dashboard'da None)
python3 -c "
import json, urllib.request
token = '<vercel_token>'
# PATCH /v9/projects/<id> {'framework': None, 'buildCommand': None}
"

# 2. SSO protection'ı kapat
# PATCH /v9/projects/<id> {'ssoProtection': null}

# 3. Deploy
vercel deploy --prod

# 4. Test
curl -X POST https://<project>.vercel.app/api/verify \
  -d '{"key": "MYPR-AAAAA-BBBBB-CCCCC-DDDDD"}'
```

## Adım 5 — OS Servisi

```bash
my-product service install
my-product service status
# → Artık bilgisayar her açıldığında otomatik başlar
```

## Adım 6 — deepstrain ile Test

```bash
# deepstrain serve çalışıyorsa:
curl -X POST http://localhost:8765/eval \
  -d '{"prompt": "Scan my-product source for issues", "plan_first": true}'
```
