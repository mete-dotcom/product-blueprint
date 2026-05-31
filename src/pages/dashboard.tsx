import Head from "next/head";
import Link from "next/link";
import { Terminal, Key, CheckCircle, XCircle, Clock, Copy, ExternalLink, Shield, Mail, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

type LicenseInfo = {
  key: string;
  email: string;
  tier: string;
  issued: string;
  expires: string;
  valid: boolean;
};

export default function Dashboard() {
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [keyInput, setKeyInput] = useState("");

  // ── Lisans yükleme ──────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    const emailParam = params.get("email");

    if (key && emailParam) {
      // Paddle callback'inden geldi — API'ye sor
      verifyLicense(key, emailParam);
    } else {
      // localStorage'dan yükle
      const saved = localStorage.getItem("deepstrain_license");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Süresi geçmiş mi kontrol et
          if (parsed.expires && new Date(parsed.expires) < new Date()) {
            setLicense({ ...parsed, valid: false });
          } else {
            setLicense(parsed);
          }
        } catch {
          localStorage.removeItem("deepstrain_license");
        }
      }
      setLoading(false);
    }
  }, []);

  // ── API'ye doğrulama isteği ─────────────────────────────────────────────
  const verifyLicense = async (key: string, emailAddr: string) => {
    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim(), email: emailAddr }),
      });

      const data = await res.json();

      if (data.valid) {
        const lic: LicenseInfo = {
          key: data.key || key,
          email: data.customer_email || emailAddr,
          tier: data.tier || "pro",
          issued: data.issued || new Date().toISOString(),
          expires: data.expires || "",
          valid: true,
        };
        setLicense(lic);
        localStorage.setItem("deepstrain_license", JSON.stringify(lic));
      } else {
        setError(data.error || "License verification failed");
      }
    } catch (err) {
      setError("Could not connect to verification server");
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  // ── Manuel doğrulama ────────────────────────────────────────────────────
  const handleVerify = () => {
    if (!keyInput.trim() || !email.trim()) {
      setError("Please enter both email and license key");
      return;
    }
    verifyLicense(keyInput.trim(), email.trim());
  };

  // ── Kopyala ─────────────────────────────────────────────────────────────
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Lisansı kaldır ──────────────────────────────────────────────────────
  const handleDeactivate = () => {
    localStorage.removeItem("deepstrain_license");
    setLicense(null);
    setKeyInput("");
    setEmail("");
  };

  // ── Kalan gün hesapla ───────────────────────────────────────────────────
  const daysRemaining = (expires: string): number => {
    if (!expires) return 365;
    const diff = new Date(expires).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <>
      <Head>
        <title>Dashboard — DeepStrain</title>
        <meta name="description" content="Manage your DeepStrain license" />
      </Head>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-deep-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-strain-400" />
              <span className="text-xl font-bold text-white">DeepStrain</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
                Docs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard */}
      <section className="min-h-screen pt-24 pb-16 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/" className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>

          {loading || verifying ? (
            <div className="glass p-12 text-center">
              <RefreshCw className="w-8 h-8 text-strain-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">{verifying ? "Verifying license..." : "Loading license information..."}</p>
            </div>
          ) : license && license.valid ? (
            /* ── Active License View ───────────────────────────────────── */
            <div className="space-y-6">
              {/* License Card */}
              <div className="glass p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-strain-400" />
                      <h2 className="text-xl font-semibold text-white">Active License</h2>
                    </div>
                    <p className="text-gray-400 text-sm">Your DeepStrain license is active and valid.</p>
                  </div>
                  <span className="px-3 py-1 bg-strain-600/20 text-strain-400 text-xs font-semibold rounded-full border border-strain-500/30">
                    {license.tier.toUpperCase()}
                  </span>
                </div>

                {/* License Key */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">License Key</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-deep-950/50 border border-white/10 rounded-lg text-strain-300 font-mono text-sm">
                      {license.key}
                    </code>
                    <button
                      onClick={() => handleCopy(license.key)}
                      className="p-3 bg-deep-950/50 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-strain-500/50 transition-all"
                      title="Copy license key"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-strain-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-deep-950/30 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                    <p className="text-white font-medium text-sm truncate">{license.email}</p>
                  </div>
                  <div className="bg-deep-950/30 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      Expires
                    </div>
                    <p className="text-white font-medium text-sm">
                      {license.expires
                        ? `${new Date(license.expires).toLocaleDateString()} (${daysRemaining(license.expires)} days)`
                        : "Never"}
                    </p>
                  </div>
                  <div className="bg-deep-950/30 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Shield className="w-4 h-4" />
                      Status
                    </div>
                    <p className="text-strain-400 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-strain-400 rounded-full animate-pulse" />
                      Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Start */}
              <div className="glass p-8">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Start</h3>
                <div className="space-y-3 font-mono text-sm">
                  <div className="bg-deep-950/50 rounded-lg p-4 border border-white/5">
                    <div className="text-gray-500 mb-1"># Activate your license</div>
                    <div>
                      <span className="text-strain-400">$</span>{" "}
                      <span className="text-gray-300">deepstrain activate {license.key}</span>
                    </div>
                  </div>
                  <div className="bg-deep-950/50 rounded-lg p-4 border border-white/5">
                    <div className="text-gray-500 mb-1"># Check activation status</div>
                    <div>
                      <span className="text-strain-400">$</span>{" "}
                      <span className="text-gray-300">deepstrain status</span>
                    </div>
                  </div>
                  <div className="bg-deep-950/50 rounded-lg p-4 border border-white/5">
                    <div className="text-gray-500 mb-1"># Start using DeepStrain</div>
                    <div>
                      <span className="text-strain-400">$</span>{" "}
                      <span className="text-gray-300">deepstrain chat</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deactivate */}
              <div className="glass p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Deactivate License</h3>
                    <p className="text-gray-400 text-sm">Remove this license from this device.</p>
                  </div>
                  <button
                    onClick={handleDeactivate}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-all"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── No License / Expired View ──────────────────────────────── */
            <div className="space-y-6">
              {/* Expired Warning */}
              {license && !license.valid && (
                <div className="flex items-center gap-3 px-6 py-4 bg-amber-600/10 border border-amber-500/30 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-amber-300 font-medium">License Expired</p>
                    <p className="text-amber-400/70 text-sm">
                      Your license expired on {new Date(license.expires).toLocaleDateString()}. 
                      <Link href="/pricing" className="underline ml-1 hover:text-amber-300">Renew now</Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Verify Form */}
              <div className="glass p-8">
                <h2 className="text-xl font-semibold text-white mb-2">Activate Your License</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Enter your email and license key to activate DeepStrain.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-deep-950/50 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-strain-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">License Key</label>
                    <input
                      type="text"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="DSTR-XXXXX-XXXXX-XXXXX-XXXXX"
                      className="w-full px-4 py-3 bg-deep-950/50 border border-white/10 rounded-lg text-white font-mono placeholder-gray-600 focus:outline-none focus:border-strain-500/50 transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-600/10 px-4 py-3 rounded-lg border border-red-500/20">
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={verifying || !keyInput.trim() || !email.trim()}
                    className="w-full px-6 py-3 bg-strain-600 hover:bg-strain-500 disabled:bg-strain-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Verify & Activate
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* No License CTA */}
              <div className="glass p-8 text-center">
                <Key className="w-12 h-12 text-strain-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Don't Have a License Yet?</h2>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  Get your DeepStrain license and start building with deterministic AI engineering.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-strain-600 hover:bg-strain-500 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  View Pricing
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-deep-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} DeepStrain. All rights reserved.
        </div>
      </footer>
    </>
  );
}
