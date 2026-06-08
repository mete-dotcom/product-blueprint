import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useHiddenTiers } from "../../lib/useHiddenTiers";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";
import {
  CheckCircle, Lock, Package, Map, BarChart2, Shield,
  Cpu, Radio, Brain, Users, RotateCcw, Zap, GitBranch,
  ArrowRight,
} from "lucide-react";

declare global { interface Window { Paddle: any } }

// ── Pricing constants ─────────────────────────────────────────────────────────
const BASE    = Number(process.env.NEXT_PUBLIC_ATLAS_PRICE || "19");
const CURR    = process.env.NEXT_PUBLIC_ATLAS_CURRENCY || "USD";
const SYM     = CURR === "USD" ? "$" : CURR;

// Paddle price IDs — replace with real IDs from Paddle Dashboard
const PADDLE_IDS = {
  pro_monthly:        process.env.NEXT_PUBLIC_ATLAS_PRO_MONTHLY        || "ls_atlas_pro_m",
  pro_yearly:         process.env.NEXT_PUBLIC_ATLAS_PRO_YEARLY         || "ls_atlas_pro_y",
  enterprise_monthly: process.env.NEXT_PUBLIC_ATLAS_ENT_MONTHLY        || "ls_atlas_ent_m",
  enterprise_yearly:  process.env.NEXT_PUBLIC_ATLAS_ENT_YEARLY         || "ls_atlas_ent_y",
};

// ── Module icons & metadata ───────────────────────────────────────────────────
const MOD_ICONS: Record<string, JSX.Element> = {
  core:              <Package className="w-3.5 h-3.5" />,
  system_map:        <Map className="w-3.5 h-3.5" />,
  risk_radar:        <BarChart2 className="w-3.5 h-3.5" />,
  security_shield:   <Shield className="w-3.5 h-3.5" />,
  code_health:       <Cpu className="w-3.5 h-3.5" />,
  signal_map:        <Radio className="w-3.5 h-3.5" />,
  atlas_mcp:         <Radio className="w-3.5 h-3.5" />,
  decision_center:   <Brain className="w-3.5 h-3.5" />,
  ownership_map:     <Users className="w-3.5 h-3.5" />,
  rewind:            <RotateCcw className="w-3.5 h-3.5" />,
  what_if:           <Zap className="w-3.5 h-3.5" />,
  commit_guard:      <GitBranch className="w-3.5 h-3.5" />,
};

const MOD_NAMES: Record<string, string> = {
  core:              "Core Engine",
  system_map:        "System Map",
  risk_radar:        "Risk Radar",
  security_shield:   "Security Shield",
  code_health:       "Code Health",
  signal_map:        "Signal Map",
  atlas_mcp:         "Atlas MCP Server",
  decision_center:   "Decision Center",
  ownership_map:     "Ownership Map",
  rewind:            "Rewind",
  what_if:           "What-If",
  commit_guard:      "Commit Guard",
};

// ── Tier definitions ──────────────────────────────────────────────────────────
type Period = "monthly" | "yearly";

interface Tier {
  id: string;
  name: string;
  badge?: string;
  monthly: number;
  yearly: number;
  modules: string[];
  paddleMonthly: string;
  paddleYearly: string;
  color: string;
  highlight: boolean;
  desc: string;
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    modules: ["core"],
    paddleMonthly: "",
    paddleYearly: "",
    color: "border-slate-700",
    highlight: false,
    desc: "Full scan engine, HTML report. Core only.",
  },
  {
    id: "pro",
    name: "Pro",
    badge: "most popular",
    monthly: 12,
    yearly: 99,
    modules: ["core", "system_map", "risk_radar", "security_shield", "code_health", "signal_map", "atlas_mcp"],
    paddleMonthly: PADDLE_IDS.pro_monthly,
    paddleYearly: PADDLE_IDS.pro_yearly,
    color: "border-[hsl(192,91%,47%)]",
    highlight: true,
    desc: "Full analysis suite. 7 modules.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: 29,
    yearly: 229,
    modules: [
      "core", "system_map", "risk_radar", "security_shield", "code_health",
      "signal_map", "atlas_mcp", "decision_center", "ownership_map", "rewind", "what_if", "commit_guard",
    ],
    paddleMonthly: PADDLE_IDS.enterprise_monthly,
    paddleYearly: PADDLE_IDS.enterprise_yearly,
    color: "border-amber-700",
    highlight: false,
    desc: "All modules. Commit gates. Impact simulation.",
  },
];

const ALL_MODULES = [
  "core", "system_map", "risk_radar", "security_shield", "code_health",
  "signal_map", "atlas_mcp", "decision_center", "ownership_map", "rewind", "what_if", "commit_guard",
];

const LEMON_STORE = process.env.NEXT_PUBLIC_LEMON_STORE || "massiron.lemonsqueezy.com";
function openCheckout(variantId: string) {
  if (!variantId || typeof window === "undefined") return;
  window.location.href = `https://${LEMON_STORE}/buy/${variantId}?checkout[custom][product]=atlas`;
}

export default function AtlasPricing() {
  const [period, setPeriod] = useState<Period>("monthly");
  const hidden = useHiddenTiers("atlas");
  const visibleTiers = TIERS.filter((t) => !hidden.has(t.id));

  return (
    <>
      <Head>
        <title>ATLAS Pricing — Code Intelligence Modules</title>
        <meta name="description" content="Unlock Atlas modules. Deterministic code analysis, risk detection, security scanning. Offline. No LLM." />
      </Head>

      <main className="min-h-screen bg-[hsl(215,60%,4%)] text-[hsl(210,40%,95%)] font-['Inter',sans-serif]">

        <MassironNav activeProduct="atlas" />

        <div className="max-w-6xl mx-auto px-6 py-16 pt-28">

          {/* ── Header ── */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              <span className="font-mono text-[hsl(192,91%,47%)]">atlas</span> modules
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              Deterministic · Offline · HMAC-licensed · No LLM
            </p>

            {/* ── Period toggle ── */}
            <div className="inline-flex rounded-lg border border-[hsl(215,40%,12%)] overflow-hidden">
              <button
                onClick={() => setPeriod("monthly")}
                className={`px-5 py-2 text-sm font-mono transition-colors ${
                  period === "monthly"
                    ? "bg-[hsl(192,91%,47%)] text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                monthly
              </button>
              <button
                onClick={() => setPeriod("yearly")}
                className={`px-5 py-2 text-sm font-mono transition-colors ${
                  period === "yearly"
                    ? "bg-[hsl(192,91%,47%)] text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                yearly <span className="text-[10px] ml-1 opacity-70">save ~17%</span>
              </button>
            </div>
          </div>

          {/* ── Tier cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {visibleTiers.map((tier) => {
              const price = period === "monthly" ? tier.monthly : tier.yearly;
              const paddleId = period === "monthly" ? tier.paddleMonthly : tier.paddleYearly;

              return (
                <div
                  key={tier.id}
                  className={`rounded-xl border ${tier.color} bg-[hsl(215,60%,5%)] p-5 flex flex-col relative ${
                    tier.highlight ? "ring-1 ring-[hsl(192,91%,47%)] ring-opacity-50" : ""
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono px-3 py-0.5 rounded-full bg-[hsl(192,91%,47%)] text-black font-semibold">
                      {tier.badge}
                    </div>
                  )}

                  <div className="mb-4">
                    <h2 className="font-mono font-bold text-lg text-white">{tier.name}</h2>
                    <p className="text-xs text-slate-500 mt-1">{tier.desc}</p>
                  </div>

                  <div className="mb-5">
                    {price === 0 ? (
                      <span className="font-mono text-3xl font-bold text-slate-300">free</span>
                    ) : (
                      <div>
                        <span className="font-mono text-3xl font-bold text-white">
                          {SYM}{price}
                        </span>
                        <span className="text-xs text-slate-500 ml-1 font-mono">
                          /{period === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>
                    )}
                    {period === "yearly" && price > 0 && (
                      <p className="text-[10px] text-slate-600 font-mono mt-1">
                        ≈ {SYM}{Math.round(price / 12)}/mo billed annually
                      </p>
                    )}
                  </div>

                  {/* Module list */}
                  <ul className="space-y-1.5 mb-6 flex-1">
                    {tier.modules.map((m) => (
                      <li key={m} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-[hsl(192,91%,47%)] flex-shrink-0" />
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <span className="text-slate-500">{MOD_ICONS[m]}</span>
                          {MOD_NAMES[m]}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {price === 0 ? (
                    <a
                      href="https://pypi.org/project/code-atlas-py/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center text-xs font-mono py-2.5 rounded border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
                    >
                      pip install code-atlas-py
                    </a>
                  ) : (
                    <>
                      <p className="text-[hsl(192,91%,47%)] text-[10px] font-mono mb-1.5 text-center">1-day free trial</p>
                      <button
                        onClick={() => openCheckout(paddleId)}
                        className={`w-full text-sm font-mono py-2.5 rounded font-semibold transition-all flex items-center justify-center gap-2 ${
                          tier.highlight
                            ? "bg-[hsl(192,91%,47%)] text-black hover:bg-[hsl(192,91%,55%)]"
                            : "border border-current text-slate-300 hover:text-white border-slate-600 hover:border-slate-400"
                        }`}
                      >
                        start free trial <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Module comparison matrix ── */}
          <div>
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 text-center">
              module comparison
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[hsl(215,40%,12%)]">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[hsl(215,40%,12%)]">
                    <th className="text-left px-4 py-3 text-slate-500 font-normal w-48">module</th>
                    {visibleTiers.map((t) => (
                      <th key={t.id} className={`px-4 py-3 font-semibold text-center ${
                        t.id === "free" ? "text-slate-500" :
                        t.id === "solo" ? "text-cyan-400" :
                        t.id === "pro"  ? "text-[hsl(192,91%,47%)]" :
                        "text-amber-400"
                      }`}>
                        {t.name.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_MODULES.map((mod, i) => (
                    <tr
                      key={mod}
                      className={`border-b border-[hsl(215,40%,10%)] ${i % 2 === 0 ? "bg-[hsl(215,60%,5%)]" : ""}`}
                    >
                      <td className="px-4 py-3 flex items-center gap-2 text-slate-300">
                        <span className="text-slate-600">{MOD_ICONS[mod]}</span>
                        {MOD_NAMES[mod]}
                      </td>
                      {visibleTiers.map((tier) => (
                        <td key={tier.id} className="px-4 py-3 text-center">
                          {tier.modules.includes(mod) ? (
                            <CheckCircle className="w-4 h-4 text-[hsl(192,91%,47%)] mx-auto" />
                          ) : (
                            <span className="text-slate-800">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── License info ── */}
          <div className="mt-12 rounded-xl border border-[hsl(215,40%,12%)] bg-[hsl(215,60%,5%)] p-6 text-center">
            <Lock className="w-5 h-5 text-slate-500 mx-auto mb-3" />
            <h3 className="font-mono font-semibold text-sm text-slate-200 mb-2">how licensing works</h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              After purchase, you receive an <code className="text-slate-300">atlas_license.json</code> by email.
              Drop it into <code className="text-slate-300">~/.atlas/</code> or run{" "}
              <code className="text-slate-300">atlas activate-file</code>.
              License is verified offline via HMAC-SHA256. Monthly subscriptions auto-renew the license file.
            </p>
            <p className="text-[10px] text-slate-600 mt-3 font-mono">
              code-atlas-py v0.12.0 · HMAC-SHA256 · offline · no telemetry
            </p>
          </div>
        </div>

        {/* ── Cross-sell ── */}
        <div className="mt-16 rounded-xl border border-[hsl(215,40%,12%)] bg-[hsl(215,60%,5%)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">also from us</p>
            <p className="text-sm text-slate-200 font-mono font-semibold">deepstrain — AI engineering agent</p>
            <p className="text-xs text-slate-500 mt-1">52 tools · autonomous loops · MCP server · BYOK · local LLM</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/bundle" className="text-xs font-mono px-3 py-1.5 rounded border border-[hsl(192,91%,47%)] text-[hsl(192,91%,47%)] hover:bg-[hsl(192,91%,47%)] hover:text-black transition-all">
              bundle — save 20% →
            </Link>
            <Link href="/" className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors">
              massiron.com →
            </Link>
          </div>
        </div>

        <MassironFooter />
      </main>
    </>
  );
}
