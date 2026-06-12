import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle, ArrowRight, Zap, Shield, Lock,
  Database, Brain, RefreshCw, Users, Globe, Layers,
} from "lucide-react";
import { useHiddenTiers } from "../../lib/useHiddenTiers";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";

// ── Pricing constants ─────────────────────────────────────────────────────────
const PRO_BASE  = Number(process.env.NEXT_PUBLIC_NODESTONE_PRICE      || "7");
const TEAM_BASE = Number(process.env.NEXT_PUBLIC_NODESTONE_TEAM_PRICE || "15");
const CURRENCY  = process.env.NEXT_PUBLIC_NODESTONE_CURRENCY || "USD";
const SYM       = CURRENCY === "USD" ? "$" : CURRENCY;

const PRO_YEARLY  = 59;
const TEAM_YEARLY = 119;

type Period = "monthly" | "yearly";

const BILLING: Record<Period, { label: string; badge: string | null }> = {
  monthly: { label: "monthly", badge: null },
  yearly:  { label: "yearly",  badge: "save 30%" },
};
const PERIODS: Period[] = ["monthly", "yearly"];

function planRow(monthlyPrice: number, yearlyPrice: number, period: Period) {
  const perMonth = period === "monthly" ? monthlyPrice : Math.round(yearlyPrice / 12);
  const total    = period === "monthly" ? monthlyPrice : yearlyPrice;
  return { perMonth, total };
}

// ── Feature lists ─────────────────────────────────────────────────────────────
const freeFeatures = [
  { icon: <Database   className="w-4 h-4" />, text: "1 project memory store" },
  { icon: <RefreshCw  className="w-4 h-4" />, text: "session continuity — local context" },
  { icon: <Layers     className="w-4 h-4" />, text: "MCP server (stdio)" },
  { icon: <Lock       className="w-4 h-4" />, text: "local-first, HMAC-signed" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "community support" },
];

const proFeatures = [
  { icon: <CheckCircle className="w-4 h-4 text-sky-400" />, text: "everything in Free" },
  { icon: <Database   className="w-4 h-4 text-sky-300" />, text: "unlimited project memories", highlight: true },
  { icon: <Brain      className="w-4 h-4 text-sky-300" />, text: "semantic recall — ask your project anything", highlight: true },
  { icon: <RefreshCw  className="w-4 h-4 text-sky-300" />, text: "auto-summarized history across sessions", highlight: true },
  { icon: <Shield     className="w-4 h-4" />, text: "HMAC-signed offline token" },
  { icon: <Zap        className="w-4 h-4" />, text: "model-agnostic — memory survives a model swap" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "priority support" },
];

const teamFeatures = [
  { icon: <CheckCircle className="w-4 h-4 text-sky-400" />, text: "everything in Pro" },
  { icon: <Users      className="w-4 h-4 text-sky-300" />, text: "shared team memory — one context, every dev", highlight: true },
  { icon: <Globe      className="w-4 h-4 text-sky-300" />, text: "HTTP MCP transport — LAN & VPN", highlight: true },
  { icon: <Layers     className="w-4 h-4 text-sky-300" />, text: "concurrent clients on one memory store", highlight: true },
  { icon: <CheckCircle className="w-4 h-4" />, text: "seat-based billing — pay per developer" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "dedicated support + onboarding call" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "what exactly does nodestone remember?",
    a: "Architecture decisions, naming conventions, why you rejected an approach, where the bodies are buried — anything you or your agent writes to the store. Recall is both semantic (ask in plain English) and exact (look up a key). It's a project memory, not a vector dump.",
  },
  {
    q: "how is this different from just pasting context every time?",
    a: "Pasting is manual, lossy, and dies with the chat window. nodestone persists the context once and serves it back automatically through the MCP server — your agent reads memory at the start of every session without you lifting a finger.",
  },
  {
    q: "what's the difference between Free, Pro and Team?",
    a: "Free covers one local project with session continuity. Pro unlocks unlimited memories, semantic recall, and auto-summarized history. Team adds a shared memory store over HTTP MCP so everyone on the team works against the same project context.",
  },
  {
    q: "does my memory leave my machine?",
    a: "No. nodestone is local-first — the memory store lives on your disk. Activation is HMAC-signed and works offline. Team's shared store runs on a machine you control, not ours. No telemetry.",
  },
  {
    q: "does it work with Claude / Cursor / GPT?",
    a: "Yes. nodestone exposes a standard MCP server, so any MCP-compatible host can read and write project memory. Swap your chat model whenever you like — the memory stays put.",
  },
  {
    q: "how does activation work?",
    a: "Run `nodestone init` and your browser opens the activation page. Sign in or create an account; your terminal picks up the signed license automatically. No key to copy-paste.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function NodestonePricing() {
  const [period, setPeriod] = useState<Period>("monthly");

  const hidden = useHiddenTiers("nodestone");
  const pro    = planRow(PRO_BASE, PRO_YEARLY, period);
  const team   = planRow(TEAM_BASE, TEAM_YEARLY, period);

  const handleCheckout = (tier: "free" | "pro" | "team") => {
    if (typeof window !== "undefined") {
      if (tier === "free") {
        window.location.href = "/nodestone/docs";
        return;
      }
      window.location.href = `/nodestone/activate?billing=${period}&tier=${tier}`;
    }
  };

  return (
    <>
      <Head>
        <title>pricing — nodestone</title>
        <meta
          name="description"
          content="nodestone pricing — Free, Pro, Team. Persistent project memory so your AI never starts from zero. Local-first, MCP-native."
        />
      </Head>

      <MassironNav activeProduct="nodestone" />

      <section className="min-h-screen pt-24 pb-24 bg-[#030712] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-sky-500/5 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-sky-400 text-xs font-mono tracking-widest uppercase mb-4">
              pricing
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              your project remembers.{" "}
              <span className="bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">you stop repeating.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              start free with one project. go Pro for unlimited memory and semantic recall.
              go Team to share one context across every developer.
            </p>
          </div>

          {/* Billing period selector */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              {PERIODS.map((p) => {
                const b = BILLING[p];
                return (
                  <button
                    key={p}
                    id={`billing-${p}`}
                    onClick={() => setPeriod(p)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      period === p
                        ? "bg-sky-600 text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {b.label}
                    {b.badge && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 whitespace-nowrap">
                        {b.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plan cards — 3 across */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

            {/* Free card */}
            {!hidden.has("free") && (
            <div className="rounded-2xl border border-white/10 p-8 bg-white/[0.02] relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-mono mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  free
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-xl text-gray-400 font-light mb-1">{SYM}</span>
                  <span className="text-6xl font-bold text-white leading-none">0</span>
                  <span className="text-gray-400 text-base mb-2">/mo</span>
                </div>
                <p className="text-gray-500 text-sm mb-1 font-mono">1 project · no card needed</p>
                <p className="text-sky-400 text-xs font-mono mb-6">start remembering today</p>

                <button
                  onClick={() => handleCheckout("free")}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all duration-200 mb-8 group border border-white/10"
                >
                  get started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <ul className="space-y-3">
                  {freeFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <span className="text-gray-600 flex-shrink-0 mt-0.5">{feat.icon}</span>
                      {feat.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            )}

            {/* Pro card — highlighted */}
            {!hidden.has("pro") && (
            <div className="rounded-2xl border-2 border-sky-500/40 p-8 shadow-2xl shadow-sky-500/10 relative overflow-hidden bg-white/[0.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-teal-500/5" />
              <div className="absolute top-0 right-6 -translate-y-1/2">
                <span className="px-3 py-1 rounded-full bg-sky-600 text-white text-xs font-semibold shadow-lg">
                  most popular
                </span>
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-300 text-xs font-mono mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  pro
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-xl text-gray-400 font-light mb-1">{SYM}</span>
                  <span key={`pro-${period}`} className="text-6xl font-bold text-white leading-none">
                    {pro.perMonth}
                  </span>
                  <span className="text-gray-400 text-base mb-2">/mo</span>
                </div>
                <p className="text-gray-500 text-sm mb-1 font-mono">
                  {period === "monthly"
                    ? "billed monthly — cancel anytime"
                    : `billed ${SYM}${pro.total} yearly`}
                </p>
                <p className="text-sky-400 text-xs font-mono mb-6">for the solo developer who ships</p>

                <button
                  onClick={() => handleCheckout("pro")}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition-all duration-200 mb-8 group"
                >
                  get nodestone pro
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <ul className="space-y-3">
                  {proFeatures.map((feat, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${feat.highlight ? "text-white" : "text-gray-400"}`}>
                      <span className="flex-shrink-0 mt-0.5">{feat.icon}</span>
                      {feat.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            )}

            {/* Team card */}
            {!hidden.has("team") && (
            <div className="rounded-2xl border border-white/10 p-8 bg-white/[0.02] relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-300 text-xs font-mono mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  team
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-xl text-gray-400 font-light mb-1">{SYM}</span>
                  <span key={`team-${period}`} className="text-6xl font-bold text-white leading-none">
                    {team.perMonth}
                  </span>
                  <span className="text-gray-400 text-base mb-2">/mo per seat</span>
                </div>
                <p className="text-gray-500 text-sm mb-1 font-mono">
                  {period === "monthly"
                    ? "billed monthly — cancel anytime"
                    : `billed ${SYM}${team.total} yearly`}
                </p>
                <p className="text-sky-400 text-xs font-mono mb-6">one shared brain for the whole team</p>

                <button
                  onClick={() => handleCheckout("team")}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all duration-200 mb-8 group border border-white/10"
                >
                  get nodestone team
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <ul className="space-y-3">
                  {teamFeatures.map((feat, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${feat.highlight ? "text-white" : "text-gray-400"}`}>
                      <span className="flex-shrink-0 mt-0.5">{feat.icon}</span>
                      {feat.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            )}
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600 font-mono mb-20">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-sky-600" />
              no telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-sky-600" />
              local-first memory
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-sky-600" />
              model-agnostic
            </span>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              frequently asked{" "}
              <span className="bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">questions</span>
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 group cursor-pointer">
                  <summary className="text-white font-medium text-sm flex items-center justify-between list-none">
                    {faq.q}
                    <span className="text-sky-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-400 text-sm leading-relaxed font-light">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell */}
      <section className="border-t border-white/5 bg-[#030712] py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">also from us</p>
              <p className="text-sm text-white font-mono font-semibold">deepstrain + atlas — execution &amp; intelligence</p>
              <p className="text-xs text-gray-500 mt-1">the agent that ships · the analyzer that maps · pair with nodestone for the full loop</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/bundle" className="text-xs font-mono px-3 py-1.5 rounded border border-sky-500/50 text-sky-400 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all">
                bundle — save 20% →
              </Link>
              <Link href="/deepstrain" className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">
                deepstrain →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MassironFooter />
    </>
  );
}
