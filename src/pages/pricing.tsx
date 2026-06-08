import Head from "next/head";
import Link from "next/link";
import {
  CheckCircle, ArrowRight, Zap, Shield,
  Package, Cpu, Lock, Cloud, Network, Users, Globe, Terminal,
} from "lucide-react";
import { useState } from "react";
import { useHiddenTiers } from "../lib/useHiddenTiers";
import { MassironNav } from "../components/MassironNav";
import { MassironFooter } from "../components/MassironFooter";

declare global {
  interface Window { Paddle: any; }
}

// ── Pricing constants ─────────────────────────────────────────────────────────
const SOLO_BASE  = Number(process.env.NEXT_PUBLIC_DEEPSTRAIN_PRICE      || "9");
const TEAM_BASE  = Number(process.env.NEXT_PUBLIC_DEEPSTRAIN_TEAM_PRICE || "19");
const CURRENCY   = process.env.NEXT_PUBLIC_DEEPSTRAIN_CURRENCY || "USD";
const SYM        = CURRENCY === "USD" ? "$" : CURRENCY;

type Period = "monthly" | "yearly";

const BILLING: Record<Period, { label: string; badge: string | null }> = {
  monthly: { label: "monthly", badge: null },
  yearly:  { label: "yearly",  badge: "save 36%" },
};

const PERIODS: Period[] = ["monthly", "yearly"];

const SOLO_YEARLY = 69;
const TEAM_YEARLY = 119;

function planRow(monthlyPrice: number, yearlyPrice: number, period: Period) {
  const perMonth = period === "monthly" ? monthlyPrice : Math.round(yearlyPrice / 12);
  const total    = period === "monthly" ? monthlyPrice : yearlyPrice;
  return { perMonth, total };
}

// ── Feature lists ─────────────────────────────────────────────────────────────
const soloFeatures = [
  { icon: <Package   className="w-4 h-4" />, text: "compiled binary — no source exposed" },
  { icon: <Cpu       className="w-4 h-4" />, text: "51 engineering tools (read, grep, git, test…)" },
  { icon: <Terminal  className="w-4 h-4" />, text: "MCP server — stdio (Claude Code, Gemini Pro)" },
  { icon: <Network   className="w-4 h-4" />, text: "local LLM support (Ollama, LM Studio, llama.cpp)" },
  { icon: <Lock      className="w-4 h-4" />, text: "bring your own DeepSeek API key" },
  { icon: <Shield    className="w-4 h-4" />, text: "HMAC-signed offline execution token" },
  { icon: <Cloud     className="w-4 h-4" />, text: "cloud activation + grace-period renewal" },
  { icon: <Zap       className="w-4 h-4" />, text: "deepstrain_eval — full autonomous task delegation" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "3 CLI aliases: deepstrain · ds · strain" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "priority support" },
];

const teamFeatures = [
  { icon: <CheckCircle className="w-4 h-4 text-strain-400" />, text: "everything in Solo" },
  { icon: <Globe     className="w-4 h-4 text-strain-300" />, text: "HTTP MCP transport — LAN & VPN access", highlight: true },
  { icon: <Users     className="w-4 h-4 text-strain-300" />, text: "concurrent clients — multiple devs, one instance", highlight: true },
  { icon: <Network   className="w-4 h-4 text-strain-300" />, text: "deepstrain mcp --http --port 8765 on any interface", highlight: true },
  { icon: <Terminal  className="w-4 h-4 text-strain-300" />, text: "connect from laptop, desktop, CI — same agent", highlight: true },
  { icon: <Shield    className="w-4 h-4" />, text: "localhost HTTP always allowed (test without Team)" },
  { icon: <Zap       className="w-4 h-4" />, text: "team notes (shared ~/.deepstrain/notes.md)" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "seat-based billing — pay per developer" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "dedicated support + onboarding call" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "what is the difference between Solo and Team?",
    a: "Solo gives you the full deepstrain toolset on a single machine via the stdio MCP protocol — perfect for individual developers. Team adds the HTTP MCP transport, which lets you run one deepstrain instance on a powerful machine (or server) and connect from any device on your LAN or VPN. Multiple developers can share the same agent simultaneously.",
  },
  {
    q: "can i use a local LLM instead of DeepSeek?",
    a: "yes — both tiers support local LLMs via the DEEPSTRAIN_BASE_URL environment variable. point it at Ollama (localhost:11434/v1), LM Studio (localhost:1234/v1), or any OpenAI-compatible endpoint. no API key required for local endpoints. run any model: llama3, deepseek-r1, mistral, qwen, phi…",
  },
  {
    q: "what does 'HTTP MCP transport' mean exactly?",
    a: "deepstrain's default MCP mode uses stdin/stdout — it only works on the same machine as Claude Code. HTTP transport starts a real web server (deepstrain mcp --http --port 8765) that any MCP client can reach over the network. claude mcp add deepstrain-remote --transport http http://YOUR-IP:8765 and every device shares the agent.",
  },
  {
    q: "what is byok and why does it matter?",
    a: "byok (bring your own key) means you supply your own DeepSeek API key. deepstrain never stores or proxies your key through our servers — it goes directly from your machine to DeepSeek. this preserves privacy and gives you full cost control.",
  },
  {
    q: "how does activation work?",
    a: "zero friction — no manual key entry. run `deepstrain chat` and your browser opens the payment page. as soon as checkout completes, deepstrain polls our edge and writes a signed token locally. tier (Solo or Team) is embedded in the token. no copy-pasting, no manual steps.",
  },
  {
    q: "can i use deepstrain offline?",
    a: "yes. after initial activation, deepstrain works completely offline. the signed token is cached at ~/.deepstrain/.license and verified via HMAC-SHA256 without any network connection. internet is only needed at renewal time.",
  },
  {
    q: "can i switch between Solo and Team?",
    a: "yes. upgrade from Solo to Team at any time — unused days are credited. downgrade at renewal. your config, API key, and notes carry over between tiers.",
  },
  {
    q: "can i cancel anytime?",
    a: "yes, cancel any time from your dashboard. no lock-in, no penalty. you keep access until the end of your paid period.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Pricing() {
  const [period, setPeriod] = useState<Period>("monthly");

  const hidden = useHiddenTiers("deepstrain");
  const solo   = planRow(SOLO_BASE, SOLO_YEARLY, period);
  const team   = planRow(TEAM_BASE, TEAM_YEARLY, period);

  const handleCheckout = (tier: "solo" | "team") => {
    if (typeof window !== "undefined") {
      window.location.href = `/activate?billing=${period}&tier=${tier}`;
    }
  };

  return (
    <>
      <Head>
        <title>pricing — deepstrain</title>
        <meta
          name="description"
          content="Solo is local. Team is network-visible. deepstrain — portable local AI infrastructure. 52 tools, MCP, local LLM support. No cloud dependency."
        />
      </Head>

      {/* Nav */}
      <MassironNav activeProduct="deepstrain" />

      <section className="min-h-screen pt-24 pb-24 bg-[#030712] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-strain-500/5 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-strain-400 text-xs font-mono tracking-widest uppercase mb-4">
              pricing
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              solo is local.{" "}
              <span className="gradient-text">team is network-visible.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              both plans include every tool, every model, every capability.
              the difference is operational topology — not features.
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
                        ? "bg-strain-600 text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {b.label}
                    {b.badge && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-strain-400/20 text-strain-300 whitespace-nowrap">
                        {b.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plan cards — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

            {/* Solo card */}
            {!hidden.has("solo") && (
            <div className="glass p-8 ring-1 ring-white/10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-mono mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  solo
                </div>

                <div className="flex items-end gap-1 mb-1">
                  <span className="text-xl text-gray-400 font-light mb-1">{SYM}</span>
                  <span key={`solo-${period}`} className="text-6xl font-bold text-white leading-none">
                    {solo.perMonth}
                  </span>
                  <span className="text-gray-400 text-base mb-2">/mo</span>
                </div>
                <p className="text-gray-500 text-sm mb-1 font-mono">
                  {period === "monthly"
                    ? "billed monthly — cancel anytime"
                    : `billed ${SYM}${solo.total} yearly`}
                </p>
                <p className="text-strain-400 text-xs font-mono mb-6">1-day free trial — no card charge until day 2</p>

                <button
                  onClick={() => handleCheckout("solo")}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all duration-200 mb-8 group border border-white/10"
                >
                  start free trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <ul className="space-y-3">
                  {soloFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <span className="text-gray-600 flex-shrink-0 mt-0.5">{feat.icon}</span>
                      {feat.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            )}

            {/* Team card — highlighted */}
            {!hidden.has("team") && (
            <div className="glass p-8 ring-2 ring-strain-500/40 shadow-2xl shadow-strain-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-strain-500/5 via-transparent to-deep-500/5" />
              {/* "Most popular" badge */}
              <div className="absolute top-0 right-6 -translate-y-1/2">
                <span className="px-3 py-1 rounded-full bg-strain-600 text-white text-xs font-semibold shadow-lg">
                  new
                </span>
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-strain-500/15 border border-strain-500/25 text-strain-300 text-xs font-mono mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-strain-400 animate-pulse" />
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
                <p className="text-strain-400 text-xs font-mono mb-6">1-day free trial — no card charge until day 2</p>

                <button
                  onClick={() => handleCheckout("team")}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-strain-600 hover:bg-strain-500 text-white font-semibold rounded-xl transition-all duration-200 glow mb-8 group"
                >
                  start free trial
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

          {/* HTTP MCP call-out */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="glass p-6 border border-strain-500/20 bg-strain-500/5">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-strain-500/10 flex-shrink-0">
                  <Globe className="w-5 h-5 text-strain-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    team: one network-visible runtime, every device
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Start the HTTP MCP server on your desktop or home server.
                    Every device on your LAN or VPN — laptop, tablet, CI runner — connects to the same agent.
                    You chose network visibility. deepstrain just honors that intent.
                  </p>
                  <div className="font-mono text-xs space-y-1 text-gray-500">
                    <div>
                      <span className="text-gray-600"># On your server / desktop</span>
                    </div>
                    <div>
                      <span className="text-strain-400">$</span>{" "}
                      <span className="text-white">deepstrain mcp --http --port 8765</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-600"># On any device on the network</span>
                    </div>
                    <div>
                      <span className="text-strain-400">$</span>{" "}
                      <span className="text-white">
                        claude mcp add deepstrain-remote --transport http http://192.168.1.x:8765
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-center text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">
              operational topology
            </h2>
            <div className="glass overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-gray-500 font-mono font-normal">feature</th>
                    <th className="text-center p-4 text-gray-400 font-mono font-normal">solo</th>
                    <th className="text-center p-4 text-strain-400 font-mono font-normal">team</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["51 engineering tools",          true,  true],
                    ["deepstrain_eval (autonomous agent)", true, true],
                    ["MCP — stdio (local)",            true,  true],
                    ["local LLM (Ollama / LM Studio)", true,  true],
                    ["HTTP MCP — localhost only",      true,  true],
                    ["HTTP MCP — LAN / VPN / 0.0.0.0","—",   true],
                    ["multiple concurrent clients",    "—",   true],
                    ["connect from any device",        "—",   true],
                    ["team shared notes",              "—",   true],
                    ["HMAC offline token",             true,  true],
                    ["priority support",               true,  true],
                  ].map(([feat, s, t], i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="p-4 text-gray-300">{feat}</td>
                      <td className="p-4 text-center">
                        {s === true
                          ? <CheckCircle className="w-4 h-4 text-gray-500 mx-auto" />
                          : <span className="text-gray-700">—</span>
                        }
                      </td>
                      <td className="p-4 text-center">
                        {t === true
                          ? <CheckCircle className="w-4 h-4 text-strain-400 mx-auto" />
                          : <span className="text-gray-700">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600 font-mono mb-20">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-strain-600" />
              no telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-strain-600" />
              your key, your data
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-strain-600" />
              offline-capable
            </span>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              frequently asked{" "}
              <span className="gradient-text">questions</span>
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="glass p-5 group cursor-pointer">
                  <summary className="text-white font-medium text-sm flex items-center justify-between list-none">
                    {faq.q}
                    <span className="text-strain-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4">
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
          <div className="glass p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/8">
            <div>
              <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">also from us</p>
              <p className="text-sm text-white font-mono font-semibold">ATLAS — deterministic code intelligence</p>
              <p className="text-xs text-gray-500 mt-1">offline · no LLM · HMAC-licensed · HTML report in seconds</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/bundle" className="text-xs font-mono px-3 py-1.5 rounded border border-strain-500/50 text-strain-400 hover:bg-strain-600 hover:text-white hover:border-strain-600 transition-all">
                bundle — save 20% →
              </Link>
              <Link href="/atlas" className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">
                atlas →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MassironFooter />
    </>
  );
}
