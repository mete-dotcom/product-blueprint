/**
 * /atlas/dashboard
 *
 * Self-service dashboard for Atlas subscribers.
 * Shows active license tier, enabled modules, expiry, and quick-start commands.
 */

import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  CheckCircle, XCircle, Clock, Copy, ExternalLink,
  Shield, Mail, AlertTriangle, RefreshCw, ArrowLeft,
  Package, Map, BarChart2, Radio, Brain, Users,
  RotateCcw, Zap, GitBranch,
} from "lucide-react";

const MOD_NAMES: Record<string, string> = {
  core:            "Core Engine",
  system_map:      "System Map",
  risk_radar:      "Risk Radar",
  security_shield: "Security Shield",
  code_health:     "Code Health",
  signal_map:      "Signal Map",
  atlas_mcp:       "Atlas MCP Server",
  decision_center: "Decision Center",
  ownership_map:   "Ownership Map",
  rewind:          "Rewind",
  what_if:         "What-If",
  commit_guard:    "Commit Guard",
};

const MOD_ICONS: Record<string, JSX.Element> = {
  core:            <Package    className="w-3.5 h-3.5" />,
  system_map:      <Map        className="w-3.5 h-3.5" />,
  risk_radar:      <BarChart2  className="w-3.5 h-3.5" />,
  security_shield: <Shield     className="w-3.5 h-3.5" />,
  code_health:     <Radio      className="w-3.5 h-3.5" />,
  signal_map:      <Radio      className="w-3.5 h-3.5" />,
  atlas_mcp:       <Radio      className="w-3.5 h-3.5" />,
  decision_center: <Brain      className="w-3.5 h-3.5" />,
  ownership_map:   <Users      className="w-3.5 h-3.5" />,
  rewind:          <RotateCcw  className="w-3.5 h-3.5" />,
  what_if:         <Zap        className="w-3.5 h-3.5" />,
  commit_guard:    <GitBranch  className="w-3.5 h-3.5" />,
};

type AtlasLicense = {
  version: string;
  email: string;
  tier: string;
  modules: string[];
  sale_id: string;
  subscription_id: string;
  issued_at: string;
  expires_at: string;
  signature: string;
};

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

export default function AtlasDashboard() {
  const [lic, setLic]         = useState<AtlasLicense | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Try cached license first
    try {
      const raw = localStorage.getItem("atlas_license");
      if (raw) {
        const parsed: AtlasLicense = JSON.parse(raw);
        if (new Date(parsed.expires_at) > new Date()) {
          setLic(parsed);
          setLoading(false);
          return;
        }
        localStorage.removeItem("atlas_license");
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setChecking(true);
    try {
      const r = await fetch("/api/atlas/activate-cli", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (data.success) {
        const license = data.license as AtlasLicense;
        localStorage.setItem("atlas_license", JSON.stringify(license));
        setLic(license);
      } else {
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Could not reach server. Try again.");
    } finally {
      setChecking(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLogout() {
    localStorage.removeItem("atlas_license");
    setLic(null);
    setEmail("");
    setPassword("");
  }

  const isExpired = lic ? new Date(lic.expires_at) < new Date() : false;

  return (
    <>
      <Head>
        <title>ATLAS Dashboard</title>
        <meta name="description" content="Manage your ATLAS license" />
      </Head>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/atlas" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="text-white font-semibold font-mono">atlas</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-mono text-slate-500">
            <Link href="/atlas/pricing"    className="hover:text-white transition-colors">pricing</Link>
            <Link href="/atlas/docs"       className="hover:text-white transition-colors">docs</Link>
            <Link href="/atlas/activate"   className="hover:text-white transition-colors">activate</Link>
          </div>
        </div>
      </nav>

      <main className="min-h-screen pt-20 pb-16 bg-[#0a0a0f] text-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/atlas" className="text-slate-600 hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold font-mono text-white">atlas dashboard</h1>
          </div>

          {loading ? (
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-12 text-center">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading…</p>
            </div>
          ) : lic && !isExpired ? (
            /* ── Active license ── */
            <div className="space-y-4">
              {/* Header card */}
              <div className="bg-[#111118] border border-indigo-800/40 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-indigo-400" />
                      <span className="text-white font-semibold">Active License</span>
                    </div>
                    <p className="text-slate-500 text-xs">{lic.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-600/20 text-indigo-300 text-xs font-mono rounded-full border border-indigo-700/50 capitalize">
                    {lic.tier}
                  </span>
                </div>

                {/* Expiry */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-[#0d0d16] rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                      <Clock className="w-3.5 h-3.5" /> expires
                    </div>
                    <p className="text-white text-sm font-mono">{lic.expires_at.slice(0, 10)}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{daysLeft(lic.expires_at)} days left</p>
                  </div>
                  <div className="bg-[#0d0d16] rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                      <Mail className="w-3.5 h-3.5" /> issued
                    </div>
                    <p className="text-white text-sm font-mono">{lic.issued_at.slice(0, 10)}</p>
                  </div>
                  <div className="bg-[#0d0d16] rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                      <Shield className="w-3.5 h-3.5" /> status
                    </div>
                    <p className="text-indigo-400 text-sm font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse inline-block" />
                      active
                    </p>
                  </div>
                </div>

                {/* Signature */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">License signature</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-[#0d0d16] border border-white/5 rounded-lg text-indigo-300 font-mono text-xs truncate">
                      {lic.signature.slice(0, 48)}…
                    </code>
                    <button
                      onClick={() => handleCopy(JSON.stringify(lic, null, 2))}
                      className="p-2 bg-[#0d0d16] border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title="Copy full license JSON"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-indigo-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-slate-700 text-xs mt-1 font-mono">copy button exports full license JSON</p>
                </div>
              </div>

              {/* Modules */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-mono font-semibold text-white mb-4">
                  enabled modules <span className="text-slate-600">({lic.modules.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {lic.modules.map((m) => (
                    <div key={m} className="flex items-center gap-2 bg-[#0d0d16] border border-white/5 rounded-lg px-3 py-2 text-xs font-mono">
                      <span className="text-indigo-500">{MOD_ICONS[m] ?? <Package className="w-3.5 h-3.5" />}</span>
                      <span className="text-slate-300">{MOD_NAMES[m] ?? m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick start */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-mono font-semibold text-white mb-4">quick start</h3>
                <div className="space-y-2 font-mono text-xs">
                  {[
                    { comment: "# install / upgrade", cmd: "pip install --upgrade atlas-intel" },
                    { comment: "# activate (fetches license from server)", cmd: `atlas activate --email ${lic.email}` },
                    { comment: "# or place license file manually", cmd: "cp atlas_license.json ~/.atlas/" },
                    { comment: "# run a scan", cmd: "atlas scan ." },
                  ].map(({ comment, cmd }) => (
                    <div key={cmd} className="bg-[#0d0d16] rounded-lg p-3 border border-white/5">
                      <div className="text-slate-600 mb-0.5">{comment}</div>
                      <div>
                        <span className="text-indigo-500">$</span>{" "}
                        <span className="text-slate-200">{cmd}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign out */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Sign out</p>
                  <p className="text-xs text-slate-500">Clears cached license from this browser.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-mono text-slate-400 border border-slate-700 hover:border-slate-500 rounded-lg transition-colors"
                >
                  sign out
                </button>
              </div>
            </div>
          ) : (
            /* ── Not signed in / expired ── */
            <div className="space-y-4">
              {lic && isExpired && (
                <div className="flex items-center gap-3 px-5 py-4 bg-amber-600/10 border border-amber-700/40 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-amber-300 text-sm">
                    License expired on {lic.expires_at.slice(0, 10)}.{" "}
                    <Link href="/atlas/pricing" className="underline hover:text-amber-200">Renew →</Link>
                  </p>
                </div>
              )}

              <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-1">Sign in to your Atlas account</h2>
                <p className="text-slate-400 text-xs mb-5">View your license, modules, and quick-start commands.</p>
                <form onSubmit={handleLogin} className="space-y-3">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0d0d16] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0d0d16] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                  {error && (
                    <p className="flex items-center gap-2 text-red-400 text-xs bg-red-600/10 px-3 py-2 rounded-lg border border-red-800/30">
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={checking}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {checking ? <><RefreshCw className="w-4 h-4 animate-spin" /> Checking…</> : "Sign in"}
                  </button>
                </form>
                <p className="text-center text-slate-600 text-xs mt-4">
                  No account yet?{" "}
                  <a href="/register" className="text-indigo-400 hover:text-indigo-300">Register →</a>
                </p>
              </div>

              <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 text-center">
                <Shield className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                <h2 className="text-white font-semibold mb-1">No subscription yet?</h2>
                <p className="text-slate-400 text-xs mb-5 max-w-sm mx-auto">
                  Get deterministic code intelligence — offline, no LLM, HMAC-licensed.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/atlas/pricing"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-colors"
                  >
                    View pricing <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/atlas/activate"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-indigo-500/50 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    CLI activate
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-6 text-center">
        <div className="flex items-center justify-center gap-5 text-xs text-slate-700 font-mono">
          <Link href="/atlas"         className="hover:text-slate-400 transition-colors">atlas</Link>
          <span>·</span>
          <Link href="/atlas/pricing" className="hover:text-slate-400 transition-colors">pricing</Link>
          <span>·</span>
          <Link href="/atlas/docs"    className="hover:text-slate-400 transition-colors">docs</Link>
          <span>·</span>
          <a href="mailto:support@atlas.tools" className="hover:text-slate-400 transition-colors">support</a>
        </div>
      </footer>
    </>
  );
}
