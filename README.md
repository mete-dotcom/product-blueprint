# DeepStrain Commerce

DeepStrain lisans satış ve yönetim paneli. Next.js + Tailwind CSS + Paddle ödeme altyapısı.

## 🚀 Quick Start

```bash
# Bağımlılıkları yükle
npm install

# Environment variables
cp .env.local.example .env.local
# .env.local'i düzenle — Paddle vendor ID ve license secret gir

# Development
npm run dev
```

## 📁 Proje Yapısı

```
src/
├── pages/
│   ├── index.tsx          # Landing page
│   ├── pricing.tsx        # Fiyatlandırma + Paddle checkout
│   ├── docs.tsx           # Dokümantasyon
│   ├── dashboard.tsx      # Lisans yönetim paneli
│   ├── _app.tsx           # App wrapper + Paddle.js yükleme
│   └── api/
│       ├── webhook.ts     # Paddle webhook handler
│       └── verify.ts      # Lisans doğrulama API
├── styles/
│   └── globals.css        # Tailwind + dark tema
└── components/            # (ileride)
```

## 🔐 Lisans Sistemi

- **HMAC-SHA256** imzalama (Python `licensing_core.py` ile birebir uyumlu)
- **Offline-first** aktivasyon
- **7 gün grace period** — internet kesilse bile çalışır
- **İki katman**: offline CLI + online API doğrulama

## 🌐 API Endpoints

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/webhook` | POST | Paddle webhook — lisans oluşturma/iptal/güncelleme |
| `/api/verify` | POST | Lisans anahtarı doğrulama |

## 🧪 Development

```bash
# Development server
npm run dev

# Build
npm run build

# Production
npm start
```

## 🚢 Deploy (Vercel)

```bash
# Vercel CLI ile deploy
vercel --prod

# Environment variables'ı Vercel Dashboard'dan ayarla:
# - DEEPSTRAIN_LICENSE_SECRET
# - PADDLE_WEBHOOK_SECRET
# - NEXT_PUBLIC_PADDLE_VENDOR_ID
```

## 📦 Bağımlılıklar

- Next.js 14
- React 18
- Tailwind CSS 3
- Lucide React (icons)
- Paddle.js (ödeme)

## 🔗 İlgili Projeler

- [deepstrain](https://github.com/deepstrain/deepstrain) — Ana CLI paketi
