
## [2026-05-23 22:19]
## KRİTİK: Proje Mimarisi (2025-01-21)

### Yanlış Anlama Geçmişi
- **vercel-commerce** dizini = Next.js ödeme/arayüz sayfası (Vercel'de host)
- **deepstrain** = Python paketi (pip install ile dağıtılır)
- İkisi FARKLI ürünler, aynı repo'da olabilir ama ayrı projeler

### Amaç
1. `pip install deepstrain` → kullanıcı Python paketini kurar
2. Kaynak kod KAPALI olmalı (kullanıcı .py görmemeli)
3. Vercel sayfası = ödeme + lisans takibi + webhook
4. deepstrain paketi, Vercel API'ye giderek lisans doğrulaması yapar

### Kapalı Kaynak Çözümü
- **PyInstaller** ile `.py` → binary derleme (önerilen)
- Veya **Nuitka** ile C'ye derleme
- Veya **PyPI'ya sadece wheel** (.pyc bytecode) — zayıf koruma
- Veya **özel sunucuda çalıştırma** (SaaS) — en güçlü koruma

### UNUTMA: Bu bir Next.js projesi değil, Python projesi!
- `src/pages/api/` = Vercel serverless functions (ödeme/webhook)
- `deepstrain/` = Python paketi (pip install)

## [2026-05-23 22:24]
## KARAR: PyPI'ya sadece `.whl` yükle (2025-06-23)

### Seçilen Yöntem
- **PyPI'ya sadece wheel (`.whl`) yayınla**, source (`.tar.gz`) yayınlama
- Kullanıcı `pip install deepstrain` yazar, PyPI'dan `.whl` iner
- `.py` dosyaları görünmez, sadece `.pyc` bytecode gider
- Vercel ücretsiz plan: sadece lisans doğrulama API'si + webhook

### Proje Durumu
- `deepstrain/` paketi zaten yazılmış durumda (cli.py, license.py, licensing_core.py)
- Lisans sistemi HMAC-SHA256 tabanlı, offline + online doğrulama
- Vercel API entegrasyonu var (`VERCEL_API_URL`)
- `pyproject.toml` hazır, `setuptools` ile build ediliyor

### Yapılacaklar
1. `setup.py` veya `pyproject.toml`'a `[tool.setuptools.packages.find]` ekle
2. `MANIFEST.in` ile sadece `.whl` yayınla
3. PyPI'ya yükle: `python -m build` → `twine upload dist/*.whl`
4. Vercel'de `/api/verify-license` endpoint'ini hazırla
5. Lisans anahtarı üretme webhook'u (Paddle/Stripe entegrasyonu)

### KRİTİK UYARI
- `deepstrain/` ile `vercel-commerce/` AYNI REPO'da ama FARKLI ürünler
- `deepstrain/` = pip paketi
- `vercel-commerce/` = Vercel'de host edilen ödeme/lisans sayfası
