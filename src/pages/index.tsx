import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  GitBranch,
  Zap,
  Shield,
  Package,
  Activity,
  Lock,
  Cpu,
  BookOpen,
  AlertTriangle,
  Users,
  RotateCcw,
  Layers,
  Code,
  Check,
} from "lucide-react";

/* ── env constants ─────────────────────────────────────────────────────── */
const DS_PRICE    = process.env.NEXT_PUBLIC_DEEPSTRAIN_PRICE    || "9";
const ATLAS_PRICE = process.env.NEXT_PUBLIC_ATLAS_PRICE         || "19";
const ADAUTO_PRICE= process.env.NEXT_PUBLIC_ADAUTO_PRICE        || "12";
const CURRENCY    = process.env.NEXT_PUBLIC_DEEPSTRAIN_CURRENCY || "USD";
const SYM         = CURRENCY === "USD" ? "$" : CURRENCY;
const AB          = Number(ATLAS_PRICE);  // atlas base price

/* ── data ───────────────────────────────────────────────────────────────── */
const dsFeatures = [
  {
    icon:  <Terminal className="w-4 h-4" />,
    title: "autonomous loop",
    body:  "Reads your codebase, edits files, runs tests, fixes errors — on its own. You describe the task, it does the work.",
  },
  {
    icon:  <Cpu className="w-4 h-4" />,
    title: "deepseek r1 reasoning",
    body:  "Chain-of-thought model, not just autocomplete. Architecture decisions, multi-file refactors, complex debugging.",
  },
  {
    icon:  <Zap className="w-4 h-4" />,
    title: "52 built-in tools",
    body:  "Filesystem · git · shell · web · reasoning · memory. Everything it needs to complete a task end-to-end.",
  },
  {
    icon:  <Shield className="w-4 h-4" />,
    title: "byok — stays local",
    body:  "Your DeepSeek API key, your hardware. Requests go direct to DeepSeek. We never see your code.",
  },
  {
    icon:  <Package className="w-4 h-4" />,
    title: "compiled binary",
    body:  "Nuitka-compiled .pyd/.so, ~4 MB, distributed via PyPI. No source exposure, no interpreter overhead.",
  },
  {
    icon:  <Lock className="w-4 h-4" />,
    title: "offline-capable",
    body:  "HMAC-signed license, works without internet after first activation. Edge revocation built in.",
  },
];

const dsSteps = [
  { n: "01", cmd: "pip install deepstrain",           note: "compiled binary from PyPI" },
  { n: "02", cmd: "deepstrain chat",                  note: "browser opens → pay → terminal activates" },
  { n: "03", cmd: 'strain chat "ship this feature"',  note: "autonomous agent loop starts" },
];

const atlasModules = [
  { icon: <Activity className="w-3.5 h-3.5" />,      name: "core",            tier: "solo", body: "Lines, complexity, function count. Baseline metrics across every file." },
  { icon: <GitBranch className="w-3.5 h-3.5" />,     name: "system_map",      tier: "solo", body: "Full import dependency graph. Know which modules are load-bearing before you touch them." },
  { icon: <AlertTriangle className="w-3.5 h-3.5" />, name: "risk_radar",      tier: "pro",  body: "Ranks files by change risk — coupling + churn + complexity. Know where not to poke." },
  { icon: <Shield className="w-3.5 h-3.5" />,        name: "security_shield", tier: "pro",  body: "Scans for insecure patterns: hardcoded secrets, SQL injection vectors, unsafe deserialization." },
  { icon: <Code className="w-3.5 h-3.5" />,          name: "code_health",     tier: "pro",  body: "Duplication, dead code, test coverage gaps. Measures tech debt objectively." },
  { icon: <Cpu className="w-3.5 h-3.5" />,           name: "atlas_mcp",       tier: "pro",  body: "MCP server: expose atlas data to any AI coding assistant in real time." },
  { icon: <Layers className="w-3.5 h-3.5" />,        name: "decision_center", tier: "ent",  body: "AI-assisted refactor planner. What to extract, consolidate, or retire — ranked by impact." },
  { icon: <Users className="w-3.5 h-3.5" />,         name: "ownership_map",   tier: "ent",  body: "Maps files to git authors. Who owns what, who needs to review what." },
  { icon: <RotateCcw className="w-3.5 h-3.5" />,     name: "rewind",          tier: "ent",  body: "Historical snapshots of codebase health. Track debt and quality over time." },
  { icon: <GitBranch className="w-3.5 h-3.5" />,     name: "what_if",         tier: "ent",  body: "Pre-merge impact analysis. Simulate what breaks if a file changes." },
  { icon: <Lock className="w-3.5 h-3.5" />,          name: "commit_guard",    tier: "ent",  body: "Pre-commit hook integration. Block commits that introduce new security issues." },
];

const atlasTiers = [
  {
    id:       "solo",
    price:    AB,
    color:    "text-slate-300",
    accent:   "border-white/10",
    badge:    "border-white/10 text-slate-500",
    modules:  ["core", "system_map"],
    features: ["dependency graph", "baseline metrics", "offline HTML report", "unlimited scans", "1 seat"],
    highlight: false,
    cta:      "get solo",
    href:     "/atlas/pricing",
  },
  {
    id:       "pro",
    price:    AB * 2,
    color:    "text-[hsl(220,91%,70%)]",
    accent:   "border-indigo-700/50",
    badge:    "border-indigo-800/60 text-indigo-400 bg-indigo-950/40",
    modules:  ["core", "system_map", "risk_radar", "security_shield", "code_health", "atlas_mcp"],
    features: ["everything in solo", "security scanning", "risk scoring", "code health", "MCP integration"],
    highlight: true,
    cta:      "get pro",
    href:     "/atlas/pricing",
  },
  {
    id:       "enterprise",
    price:    AB * 4,
    color:    "text-yellow-400",
    accent:   "border-yellow-900/40",
    badge:    "border-yellow-900/60 text-yellow-600/80 bg-yellow-950/30",
    modules:  ["all 11 modules"],
    features: ["everything in pro", "ownership maps", "historical rewind", "what-if analysis", "commit guard"],
    highlight: false,
    cta:      "get enterprise",
    href:     "/atlas/pricing",
  },
];

const tierColor: Record<string, string> = {
  solo: "text-slate-500 bg-white/5 border-white/8",
  pro:  "text-indigo-400 bg-indigo-950/40 border-indigo-800/50",
  ent:  "text-yellow-500/80 bg-yellow-950/30 border-yellow-900/50",
};

/* ── component ──────────────────────────────────────────────────────────── */
export default function Hub() {
  return (
    <>
      <Head>
        <title>massiron — the intelligence is the product. the model is just a driver.</title>
        <meta name="description"
          content="massiron builds the intelligence into the tools — deterministic understanding (atlas), autonomous execution (deepstrain), owned outright. Swap in any model, even a free local one. The result doesn't change. deepstrain · atlas · adauto." />
        <meta property="og:title" content="massiron — the intelligence is the product" />
        <meta property="og:description"
          content="The model is rented. The intelligence is forged. Three tools, one intelligence layer — runs on your machine, with any brain or none." />
        <style>{`html { scroll-behavior: smooth; }`}</style>
      </Head>

      {/* ════════════════════════════════════════════════════════════ NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
           style={{ background: "rgba(1,13,26,0.92)", backdropFilter: "blur(18px)" }}>
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-mono text-sm font-bold select-none">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="flex-shrink-0">
              <rect x="2" y="3"    width="12" height="2.5" rx="1.25" fill="#22d3ee" />
              <rect x="2" y="6.75" width="12" height="2.5" rx="1.25" fill="#6366f1" />
              <rect x="2" y="10.5" width="12" height="2.5" rx="1.25" fill="#f59e0b" />
            </svg>
            <span className="tracking-tight" style={{ background: "linear-gradient(90deg,#22d3ee,#6366f1,#f59e0b)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              massiron
            </span>
          </a>
          <div className="flex items-center gap-5">
            <a href="#deepstrain" className="text-xs font-mono text-slate-500 hover:text-strain-400 transition-colors">deepstrain</a>
            <a href="#atlas"      className="text-xs font-mono text-slate-500 hover:text-[hsl(220,91%,65%)] transition-colors">atlas</a>
            <a href="#adauto"     className="text-xs font-mono text-slate-500 hover:text-[hsl(30,91%,55%)] transition-colors">adauto</a>
            <Link href="/docs"    className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors">docs</Link>
            <Link href="/bundle"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-mono rounded-md transition-colors">
              bundle <span className="text-yellow-500/80">—20%</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════ BRAND HERO */}
      <section id="top" className="relative flex flex-col items-center justify-center pt-14 overflow-hidden"
               style={{ background: "#010d1a", minHeight: "100vh" }}>
        {/* grid */}
        <div className="absolute inset-0 opacity-[0.025]"
             style={{ backgroundImage: "linear-gradient(rgba(34,211,238,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,1) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* glows */}
        <div className="absolute top-1/3 left-1/5 w-[500px] h-[500px] rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)" }} />
        <div className="absolute top-1/3 right-1/5 w-[500px] h-[500px] rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-5 py-28 text-center w-full">
          <p className="font-mono text-xs text-slate-600 tracking-[0.3em] uppercase mb-7">
            massiron · the intelligence layer
          </p>

          <h1 className="font-mono font-bold text-white mb-6 leading-[1.05] tracking-tighter"
              style={{ fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)" }}>
            the model is rented.<br />
            <span style={{ background: "linear-gradient(90deg,#22d3ee,#6366f1,#f59e0b)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              the intelligence is forged.
            </span>
          </h1>

          <p className="text-slate-300 font-mono text-sm max-w-2xl mx-auto mb-3 leading-relaxed">
            massiron builds the intelligence into the tools — not the model.
            Deterministic understanding, autonomous execution, owned outright.
            Swap in any brain, even a free local one. The frontier-grade result doesn&apos;t change —
            you just stopped paying rent on it.
          </p>
          <p className="text-slate-600 font-mono text-xs max-w-md mx-auto mb-14">
            your machine · your key · no token ceiling · any brain, or none
          </p>

          <p className="font-mono text-[11px] text-slate-700 tracking-[0.25em] uppercase mb-5">
            one intelligence layer · three tools
          </p>

          {/* product chooser pills */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">

            {/* deepstrain pill */}
            <a href="#deepstrain" className="group block text-left rounded-xl border border-white/8
               hover:border-strain-800 transition-all duration-300 overflow-hidden"
               style={{ background: "rgba(6,182,212,0.03)" }}>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-strain-500" />
                    <span className="font-mono font-bold text-white">deepstrain</span>
                  </div>
                  <span className="font-mono text-xs text-strain-700">agent runtime</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-mono mb-4">
                  Describe the task. It ships it — reads code, edits files, runs tests, commits.
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">
                    <span className="text-slate-600">{SYM}</span>
                    <span className="text-white font-bold">{DS_PRICE}</span>
                    <span className="text-slate-600">/mo</span>
                  </span>
                  <span className="text-xs font-mono text-strain-500 group-hover:text-strain-400 flex items-center gap-1 transition-colors">
                    explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-strain-700/60 via-strain-500/20 to-transparent" />
            </a>

            {/* atlas pill */}
            <a href="#atlas" className="group block text-left rounded-xl border border-white/8
               hover:border-indigo-800 transition-all duration-300 overflow-hidden"
               style={{ background: "rgba(99,102,241,0.03)" }}>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    <span className="font-mono font-bold text-[hsl(220,91%,65%)]">ATLAS</span>
                  </div>
                  <span className="font-mono text-xs text-indigo-800">code intelligence</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-mono mb-4">
                  Understand any codebase in 30 seconds. No LLM, no guesses — pure AST analysis.
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">
                    <span className="text-slate-600">from {SYM}</span>
                    <span className="text-white font-bold">{ATLAS_PRICE}</span>
                    <span className="text-slate-600">/mo</span>
                  </span>
                  <span className="text-xs font-mono text-indigo-500 group-hover:text-indigo-400 flex items-center gap-1 transition-colors">
                    explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-indigo-700/60 via-indigo-500/20 to-transparent" />
            </a>

            {/* adauto pill */}
            <a href="#adauto" className="group block text-left rounded-xl border border-white/8
               hover:border-amber-800 transition-all duration-300 overflow-hidden"
               style={{ background: "rgba(245,158,11,0.03)" }}>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-mono font-bold text-[hsl(30,91%,55%)]">ADAUTO</span>
                  </div>
                  <span className="font-mono text-xs text-amber-800">marketing automation</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-mono mb-4">
                  Write once, post everywhere. AI-generated content for Reddit, dev.to, and Twitter.
                  Approve before publishing. Track every cent.
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">
                    <span className="text-slate-600">from {SYM}</span>
                    <span className="text-white font-bold">0</span>
                    <span className="text-slate-600"> (Pro {SYM}{ADAUTO_PRICE})</span>
                  </span>
                  <span className="text-xs font-mono text-amber-500 group-hover:text-amber-400 flex items-center gap-1 transition-colors">
                    explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-amber-700/60 via-amber-500/20 to-transparent" />
            </a>

          </div>

          <p className="font-mono text-xs text-slate-700/60 mt-10">↓ scroll for full details</p>
        </div>
      </section>

      {/* ═══════════════════════════════════ DETERMINISTIC VALUE · IMMORTALITY */}
      <section id="how-it-works" className="border-t border-white/5 py-20 sm:py-28"
               style={{ background: "#010a14" }}>
        <div className="max-w-5xl mx-auto px-5">
          <p className="font-mono text-xs text-slate-600 tracking-[0.3em] uppercase mb-4 text-center">the principle</p>
          <h2 className="font-mono font-bold text-white text-center mb-5 tracking-tighter leading-[1.1]"
              style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)" }}>
            maximum deterministic value.<br />
            <span className="text-white/40">in every condition.</span>
          </h2>
          <p className="text-slate-400 font-mono text-sm max-w-2xl mx-auto mb-14 text-center leading-relaxed">
            The core of every tool is deterministic — same input, same answer, no model required.
            An AI brain only makes it faster; it never decides the truth. So the value never depends
            on a key, a cloud, or a vendor staying online.
          </p>

          {/* deterministic by default */}
          <div className="grid sm:grid-cols-3 gap-4 mb-14">
            <div className="rounded-xl border border-white/8 px-6 py-5" style={{ background: "rgba(255,255,255,0.015)" }}>
              <Activity className="w-4 h-4 text-strain-500 mb-3" />
              <p className="font-mono text-sm font-bold text-white mb-1.5">0 LLM tokens</p>
              <p className="text-xs text-slate-500 leading-relaxed font-mono">Code analysis, graphs and risk are pure computation. Nothing to pay per query.</p>
            </div>
            <div className="rounded-xl border border-white/8 px-6 py-5" style={{ background: "rgba(255,255,255,0.015)" }}>
              <Shield className="w-4 h-4 text-indigo-400 mb-3" />
              <p className="font-mono text-sm font-bold text-white mb-1.5">0 hallucinations</p>
              <p className="text-xs text-slate-500 leading-relaxed font-mono">Reproducible output, identical five years from now. A model can&apos;t lie about what is actually there.</p>
            </div>
            <div className="rounded-xl border border-white/8 px-6 py-5" style={{ background: "rgba(255,255,255,0.015)" }}>
              <Lock className="w-4 h-4 text-[hsl(30,91%,55%)] mb-3" />
              <p className="font-mono text-sm font-bold text-white mb-1.5">your data stays</p>
              <p className="text-xs text-slate-500 leading-relaxed font-mono">Everything runs on your machine. Your key, your code — nothing leaves.</p>
            </div>
          </div>

          {/* immortal — any brain, or none */}
          <p className="font-mono text-xs text-slate-600 tracking-[0.25em] uppercase mb-5 text-center">immortal — works with any brain, or none</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-strain-800/40 px-6 py-5" style={{ background: "rgba(6,182,212,0.03)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-strain-500" />
                <span className="font-mono text-xs text-strain-600">tier 1</span>
              </div>
              <p className="font-mono text-sm font-bold text-white mb-1.5">cloud brain</p>
              <p className="text-xs text-slate-500 leading-relaxed font-mono">Drop in a DeepSeek key → full autonomous agent loop at cloud speed.</p>
            </div>
            <div className="rounded-xl border border-indigo-800/40 px-6 py-5" style={{ background: "rgba(99,102,241,0.03)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-xs text-indigo-700">tier 2</span>
              </div>
              <p className="font-mono text-sm font-bold text-white mb-1.5">local brain</p>
              <p className="text-xs text-slate-500 leading-relaxed font-mono">No cloud key? Point it at a local model (Ollama). Same agent, fully offline.</p>
            </div>
            <div className="rounded-xl border px-6 py-5" style={{ background: "rgba(245,158,11,0.03)", borderColor: "rgba(245,158,11,0.25)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-[hsl(30,91%,55%)]" />
                <span className="font-mono text-xs text-[hsl(30,80%,45%)]">tier 3</span>
              </div>
              <p className="font-mono text-sm font-bold text-white mb-1.5">no brain at all</p>
              <p className="text-xs text-slate-500 leading-relaxed font-mono">The MCP server + 51 tools still stand. Whatever LLM you already use discovers them and drives them itself.</p>
            </div>
          </div>

          <p className="text-slate-600 font-mono text-xs max-w-xl mx-auto mt-12 text-center leading-relaxed">
            Three tiers, one guarantee: the tools never stop producing value. The brain is swappable — the value is not.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ DEEPSTRAIN SECTION */}
      <section id="deepstrain" className="border-t border-white/5" style={{ background: "#00080f" }}>

        {/* section header */}
        <div className="max-w-7xl mx-auto px-5 pt-24 pb-16">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="font-mono text-xs text-strain-800 tracking-[0.25em]">01</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid lg:grid-cols-2 gap-4 items-end">
            <div>
              <h2 className="font-mono font-black text-white tracking-tight mb-3"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05 }}>
                <span className="gradient-text">deep</span>strain
              </h2>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">autonomous execution runtime</p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed lg:text-right">
              A terminal-native AI agent that takes a task and runs it to completion.
              Not a suggestion engine — an executor. It reads your code, edits files,
              runs your tests, and keeps looping until everything passes.
            </p>
          </div>
        </div>

        {/* hero: terminal + key claims */}
        <div className="max-w-7xl mx-auto px-5 pb-20">
          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* left: claims + CTA */}
            <div className="lg:col-span-2 space-y-8">

              <div className="space-y-5">
                {[
                  {
                    label: "not a copilot. an autopilot.",
                    body:  "It doesn't suggest what you should type next. It runs the task end-to-end — reading files, making changes, verifying results — without you watching.",
                    col:   "text-white",
                  },
                  {
                    label: "reasoning, not completion.",
                    body:  "DeepSeek R1 thinks through problems before acting. Give it a complex refactor or a failing test suite — it plans, then executes.",
                    col:   "text-slate-200",
                  },
                  {
                    label: "18× cheaper than GPT-4.",
                    body:  "BYOK architecture. Requests go direct to platform.deepseek.com. ~$0.27/M tokens. A typical bug fix costs less than a coffee.",
                    col:   "text-slate-300",
                  },
                ].map((c) => (
                  <div key={c.label} className="border-l-2 border-white/20 pl-4">
                    <p className={`font-mono text-xs font-extrabold ${c.col} mb-1.5`}>{c.label}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>

              {/* install strip */}
              <div className="rounded-lg border border-white/8 overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.02)" }}>
                {dsSteps.map((s, i) => (
                  <div key={s.n}
                       className={`flex items-center gap-4 px-4 py-3 font-mono text-xs ${i < dsSteps.length - 1 ? "border-b border-white/5" : ""}`}>
                    <span className="text-strain-900 w-5 text-right flex-shrink-0">{s.n}</span>
                    <code className="text-strain-300 flex-1 truncate">{s.cmd}</code>
                    <span className="text-slate-700 text-right hidden sm:block">{s.note}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/deepstrain/pricing"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-black text-sm font-mono font-semibold rounded-md transition-colors">
                  get deepstrain
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/deepstrain"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white text-sm font-mono rounded-md transition-colors">
                  <BookOpen className="w-3.5 h-3.5" />
                  full details
                </Link>
              </div>
            </div>

            {/* right: terminal demo */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-t-lg border border-b-0 border-white/8 font-mono text-xs"
                   style={{ background: "rgba(255,255,255,0.025)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-700" />
                  <span className="w-2 h-2 rounded-full bg-yellow-700" />
                  <span className="w-2 h-2 rounded-full bg-green-700" />
                </span>
                <span className="text-slate-600 ml-2">deepstrain — autonomous agent</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-strain-400 animate-pulse inline-block" />
                  <span className="text-strain-500">live</span>
                </span>
              </div>
              <div className="border border-white/8 rounded-b-lg overflow-hidden"
                   style={{ background: "#000d1a" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/demos/deepstrain.gif" alt="deepstrain demo"
                     className="w-full block" style={{ minHeight: "200px", objectFit: "cover" }}
                     onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="p-5 font-mono text-xs space-y-1.5 leading-relaxed">
                  <div><span className="text-strain-600">$</span> <span className="text-slate-300">pip install deepstrain</span></div>
                  <div className="text-strain-700 pl-3">✓ deepstrain-0.5.2 installed  (4.1 MB compiled)</div>
                  <div className="pt-1"><span className="text-strain-600">$</span> <span className="text-slate-300">deepstrain chat</span></div>
                  <div className="text-slate-600 pl-3">opening browser... activation complete</div>
                  <div className="pt-1"><span className="text-strain-600">$</span> <span className="text-slate-300">strain chat <span className="text-strain-400">&quot;run tests, fix all failures&quot;</span></span></div>
                  <div className="text-strain-600 pl-3">▸ reading codebase (37 files)...</div>
                  <div className="text-strain-600 pl-3">▸ running pytest — 4 failures</div>
                  <div className="text-strain-600 pl-3">▸ patching src/auth/session.py</div>
                  <div className="text-strain-600 pl-3">▸ patching src/db/pool.py</div>
                  <div className="text-strain-400 pl-3">▸ all 47 tests pass  ·  3 turns  ·  $0.11</div>
                  <div className="flex items-center gap-1 pl-3 text-slate-800 pt-1">
                    <span className="animate-pulse">█</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* metrics strip */}
        <div className="border-y border-white/5" style={{ background: "rgba(255,255,255,0.01)" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
              {[
                { n: "52",     l: "tools" },
                { n: "~4 MB",  l: "binary size" },
                { n: "BYOK",   l: "deepseek key" },
                { n: "3 cmds", l: "to get started" },
              ].map((m) => (
                <div key={m.l} className="py-5 px-6 text-center">
                  <div className="font-mono text-lg font-bold text-white mb-0.5">{m.n}</div>
                  <div className="font-mono text-xs text-slate-700">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* feature grid */}
        <div className="max-w-7xl mx-auto px-5 py-20">
          <p className="font-mono text-xs text-strain-800 uppercase tracking-widest mb-8">// what you get</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dsFeatures.map((f) => (
              <div key={f.title} className="glass glass-hover p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-strain-600">{f.icon}</span>
                  <span className="font-mono text-xs text-strain-300 font-medium">{f.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* pricing card */}
        <div className="max-w-7xl mx-auto px-5 pb-24">
          <p className="font-mono text-xs text-strain-800 uppercase tracking-widest mb-8">// pricing</p>
          <div className="max-w-sm border border-strain-900/50 rounded-xl overflow-hidden"
               style={{ background: "rgba(6,182,212,0.02)" }}>
            <div className="px-6 py-6 border-b border-white/5">
              <p className="font-mono text-xs text-strain-700 uppercase tracking-widest mb-4">professional</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono text-base text-slate-500">{SYM}</span>
                <span className="font-mono text-5xl font-bold text-white">{DS_PRICE}</span>
                <span className="font-mono text-sm text-slate-600">/mo</span>
              </div>
              <p className="font-mono text-xs text-slate-700">cancel anytime</p>
            </div>
            <div className="px-6 py-5 space-y-2.5">
              {["unlimited agent runs", "52 tools", "deepseek r1 + v3", "byok api key", "offline-capable", "cloud activation", "gui settings panel"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 font-mono text-xs text-slate-400">
                  <Check className="w-3 h-3 text-strain-600 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <Link href="/deepstrain/pricing"
                className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-black text-sm font-mono font-semibold rounded-md transition-colors">
                get deepstrain
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════ ATLAS SECTION */}
      <section id="atlas" className="border-t border-white/5" style={{ background: "#010d1a" }}>

        {/* section header */}
        <div className="max-w-7xl mx-auto px-5 pt-24 pb-16">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="font-mono text-xs text-indigo-900 tracking-[0.25em]">02</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid lg:grid-cols-2 gap-4 items-end">
            <div>
              <h2 className="font-mono font-bold tracking-tight mb-3"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05 }}>
                <span className="text-[hsl(220,91%,65%)]">ATLAS</span>
              </h2>
              <p className="font-mono text-xs text-indigo-800 uppercase tracking-widest">deterministic code intelligence</p>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed lg:text-right">
              Know your codebase before you touch it. Pure AST analysis — no LLM, no guesses.
              Dependency graphs, security scans, hotspot detection. One HTML report that works
              offline, forever.
            </p>
          </div>
        </div>

        {/* atlas terminal demo + promises */}
        <div className="max-w-7xl mx-auto px-5 pb-20">
          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* left: terminal */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-t-lg border border-b-0 border-white/8 font-mono text-xs"
                   style={{ background: "rgba(255,255,255,0.025)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-700" />
                  <span className="w-2 h-2 rounded-full bg-yellow-700" />
                  <span className="w-2 h-2 rounded-full bg-green-700" />
                </span>
                <span className="text-slate-600 ml-2">atlas — code intelligence</span>
              </div>
              <div className="border border-white/8 rounded-b-lg p-5 font-mono text-xs space-y-1.5 leading-relaxed"
                   style={{ background: "#000d1a" }}>
                <div><span className="text-indigo-700">$</span> <span className="text-slate-300">pip install atlas-intel</span></div>
                <div className="text-slate-600 pl-3">✓ atlas-intel-1.2.0 installed</div>
                <div className="pt-1"><span className="text-indigo-700">$</span> <span className="text-slate-300">atlas activate --email you@example.com</span></div>
                <div className="text-slate-600 pl-3">✓ license validated · offline mode enabled</div>
                <div className="pt-1"><span className="text-indigo-700">$</span> <span className="text-slate-300">atlas scan .</span></div>
                <div className="text-indigo-800 pl-3">[atlas] scanning 221 files...</div>
                <div className="text-indigo-700 pl-3">  ✓ core            → 1563 symbols mapped</div>
                <div className="text-indigo-700 pl-3">  ✓ system_map      → 847 import edges</div>
                <div className="text-indigo-600 pl-3">  ✓ risk_radar      → 12 high-risk files</div>
                <div className="text-indigo-600 pl-3">  ✓ security_shield → 2 issues found</div>
                <div className="text-indigo-600 pl-3">  ✓ code_health     → debt score 73/100</div>
                <div className="text-[hsl(220,91%,65%)] pl-3 pt-1">  ✓ report ready: atlas_report.html  (28s)</div>
                <div className="pt-1"><span className="text-indigo-700">$</span> <span className="text-slate-300">open atlas_report.html</span></div>
                <div className="text-slate-600 pl-3">// single HTML file · no server needed · share freely</div>
              </div>
            </div>

            {/* right: key claims */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-5">
                {[
                  {
                    label: "no hallucinations.",
                    body:  "Pure AST analysis. Same codebase always gives the same output. No probabilistic guesses, no model errors — just facts.",
                    col:   "text-[hsl(220,91%,65%)]",
                    border: "border-indigo-900/60",
                  },
                  {
                    label: "works offline.",
                    body:  "Scan your codebase on a plane. Share the HTML report without spinning up a server. No account needed after activation.",
                    col:   "text-indigo-500",
                    border: "border-indigo-900/40",
                  },
                  {
                    label: "30 seconds to full picture.",
                    body:  "221 files, 1563 symbols, dependency graph, security scan, code health metrics — one command, half a minute.",
                    col:   "text-indigo-600",
                    border: "border-indigo-900/30",
                  },
                ].map((c) => (
                  <div key={c.label} className={`border-l-2 ${c.border} pl-4`}>
                    <p className={`font-mono text-xs font-semibold ${c.col} mb-1.5`}>{c.label}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/atlas/pricing"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-mono font-medium rounded-md transition-colors"
                  style={{ boxShadow: "0 0 20px rgba(99,102,241,0.25)" }}>
                  get atlas
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/atlas"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/8 hover:border-white/15 text-slate-400 hover:text-white text-sm font-mono rounded-md transition-colors">
                  <BookOpen className="w-3.5 h-3.5" />
                  full details
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* module grid */}
        <div className="max-w-7xl mx-auto px-5 pb-20">
          <div className="flex items-baseline gap-3 mb-8">
            <p className="font-mono text-xs text-indigo-900 uppercase tracking-widest">// analysis modules</p>
            <div className="flex-1 h-px bg-white/5" />
            <span className="font-mono text-xs text-slate-800">11 total</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {atlasModules.map((m) => (
              <div key={m.name}
                   className="rounded-lg border border-white/5 px-4 py-3.5 hover:border-white/10 transition-colors"
                   style={{ background: "rgba(255,255,255,0.015)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-800">{m.icon}</span>
                    <code className="font-mono text-xs text-slate-300 font-medium">{m.name}</code>
                  </div>
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${tierColor[m.tier]}`}>
                    {m.tier}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* pricing tiers */}
        <div className="max-w-7xl mx-auto px-5 pb-24">
          <p className="font-mono text-xs text-indigo-900 uppercase tracking-widest mb-8">// pricing</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {atlasTiers.map((t) => (
              <div key={t.id}
                   className={`rounded-xl border ${t.accent} overflow-hidden transition-all`}
                   style={{ background: t.highlight ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.015)" }}>
                {t.highlight && (
                  <div className="px-4 py-1.5 text-center font-mono text-[10px] bg-indigo-900/40 border-b border-indigo-800/50 text-indigo-400 tracking-wider">
                    most popular
                  </div>
                )}
                <div className="px-5 pt-5 pb-4 border-b border-white/5">
                  <div className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded border ${t.badge} mb-3`}>
                    {t.id}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-sm text-slate-500">{SYM}</span>
                    <span className={`font-mono text-3xl font-bold ${t.color}`}>{t.price}</span>
                    <span className="font-mono text-xs text-slate-600">/mo</span>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-2 flex-1">
                  {t.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 font-mono text-xs text-slate-500">
                      <Check className="w-3 h-3 text-indigo-800 flex-shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <Link href={t.href}
                    className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-mono font-medium transition-all
                      ${t.highlight
                        ? "bg-indigo-700 hover:bg-indigo-600 text-white"
                        : "border border-white/10 hover:border-white/20 text-slate-400 hover:text-white"}`}
                    style={t.highlight ? { boxShadow: "0 0 16px rgba(99,102,241,0.2)" } : {}}>
                    {t.cta}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════ ADAUTO SECTION */}
      <section id="adauto" className="border-t border-white/5" style={{ background: "#00080f" }}>

        {/* section header */}
        <div className="max-w-7xl mx-auto px-5 pt-24 pb-16">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="font-mono text-xs text-amber-900 tracking-[0.25em]">03</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid lg:grid-cols-2 gap-4 items-end">
            <div>
              <h2 className="font-mono font-bold tracking-tight mb-3"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05 }}>
                <span className="text-[hsl(30,91%,55%)]">ADAUTO</span>
              </h2>
              <p className="font-mono text-xs text-amber-900 uppercase tracking-widest">narrative cognition infrastructure</p>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed lg:text-right">
              Developer marketing that remembers. Runs on your machine, learns from engagement,
              posts only after your approval. Strategy built-in — LLM just writes the words.
            </p>
          </div>
        </div>

        {/* terminal demo + claims */}
        <div className="max-w-7xl mx-auto px-5 pb-20">
          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* left: claims + CTA */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-5">
                {[
                  {
                    label: "approval gate — always on.",
                    body:  "Every post lands in pending_approval first. Nothing publishes without your review. Editing and rejecting are first-class.",
                    col:   "text-[hsl(30,91%,55%)]",
                  },
                  {
                    label: "engage → learn → adapt.",
                    body:  "Tracks upvotes, comments, and replies per post-type. Exploits what works, explores what hasn't been tried. ~$0.00034/post.",
                    col:   "text-amber-500",
                  },
                  {
                    label: "5 tools. minimum tokens.",
                    body:  "run · status · approve · post · report. GET / returns ~208 tokens. Any LLM — Claude, GPT, local — can drive a full campaign loop.",
                    col:   "text-amber-600",
                  },
                ].map((c) => (
                  <div key={c.label} className="border-l-2 border-amber-900/80 pl-4">
                    <p className={`font-mono text-xs font-semibold ${c.col} mb-1.5`}>{c.label}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>

              {/* install steps */}
              <div className="rounded-lg border border-white/8 overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.02)" }}>
                {[
                  { n: "01", cmd: "pip install adauto",               note: "python ≥ 3.10" },
                  { n: "02", cmd: "adauto serve",                     note: "HTTP :8766 · 5 tools" },
                  { n: "03", cmd: "adauto run --campaign launch-week", note: "draft → approve → post" },
                ].map((s, i, arr) => (
                  <div key={s.n}
                       className={`flex items-center gap-4 px-4 py-3 font-mono text-xs ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
                    <span className="text-amber-900 w-5 text-right flex-shrink-0">{s.n}</span>
                    <code className="text-[hsl(30,91%,55%)] flex-1 truncate">{s.cmd}</code>
                    <span className="text-slate-700 text-right hidden sm:block">{s.note}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/adauto/pricing"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-mono font-medium rounded-md transition-colors"
                  style={{ background: "hsl(30,91%,45%)" }}>
                  get adauto
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/adauto"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/8 hover:border-white/15 text-slate-400 hover:text-white text-sm font-mono rounded-md transition-colors">
                  <BookOpen className="w-3.5 h-3.5" />
                  full details
                </Link>
              </div>
            </div>

            {/* right: terminal */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-t-lg border border-b-0 border-white/8 font-mono text-xs"
                   style={{ background: "rgba(255,255,255,0.025)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-700" />
                  <span className="w-2 h-2 rounded-full bg-yellow-700" />
                  <span className="w-2 h-2 rounded-full bg-green-700" />
                </span>
                <span className="text-slate-600 ml-2">adauto — marketing automation</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                  <span className="text-amber-600">live</span>
                </span>
              </div>
              <div className="border border-white/8 rounded-b-lg p-5 font-mono text-xs space-y-1.5 leading-relaxed"
                   style={{ background: "#000d1a" }}>
                <div><span className="text-[hsl(30,91%,55%)]">$</span> <span className="text-slate-300">adauto run --campaign deepstrain-launch</span></div>
                <div className="text-amber-900 pl-3">strategy: exploit reddit/r/MachineLearning (score 14.2)</div>
                <div className="text-amber-900 pl-3">  explore: dev.to long-form (untried)</div>
                <div className="text-amber-800 pl-3">generating 2 posts...</div>
                <div className="text-amber-700 pl-3">  ✓ reddit  (412 tokens · $0.00014) → pending_approval</div>
                <div className="text-amber-700 pl-3">  ✓ dev.to  (890 tokens · $0.00030) → pending_approval</div>
                <div className="pt-1"><span className="text-[hsl(30,91%,55%)]">$</span> <span className="text-slate-300">adauto review</span></div>
                <div className="text-slate-600 pl-3">reddit post — approve? [y/n/e] <span className="text-amber-400">y</span></div>
                <div className="text-slate-600 pl-3">dev.to post — approve? [y/n/e] <span className="text-amber-400">y</span></div>
                <div className="pt-1"><span className="text-[hsl(30,91%,55%)]">$</span> <span className="text-slate-300">adauto post --campaign deepstrain-launch</span></div>
                <div className="text-[hsl(30,91%,55%)] pl-3">  ✓ posted 2 items · total: $0.00044</div>
                <div className="flex items-center gap-1 pl-3 text-slate-800 pt-1">
                  <span className="animate-pulse">█</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* metrics strip */}
        <div className="border-y border-white/5" style={{ background: "rgba(255,255,255,0.01)" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
              {[
                { n: "5",          l: "HTTP tools" },
                { n: "~208",       l: "tokens GET /" },
                { n: "$0.00034",   l: "per post" },
                { n: "3 cmds",     l: "to first post" },
              ].map((m) => (
                <div key={m.l} className="py-5 px-6 text-center">
                  <div className="font-mono text-lg font-bold text-white mb-0.5">{m.n}</div>
                  <div className="font-mono text-xs text-slate-700">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* pricing card */}
        <div className="max-w-7xl mx-auto px-5 py-20">
          <p className="font-mono text-xs text-amber-900 uppercase tracking-widest mb-8">// pricing</p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
            {/* Free */}
            <div className="rounded-xl border border-white/8 p-5"
                 style={{ background: "rgba(255,255,255,0.015)" }}>
              <p className="font-mono text-xs text-slate-600 uppercase tracking-widest mb-3">free</p>
              <div className="font-mono text-3xl font-bold text-white mb-1">$0</div>
              <p className="font-mono text-xs text-slate-700 mb-5">1 campaign · 3 posts/day</p>
              <a href="https://pypi.org/project/adauto/"
                 className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-mono font-medium border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all">
                pip install adauto
              </a>
            </div>
            {/* Pro */}
            <div className="rounded-xl border border-amber-800/50 p-5"
                 style={{ background: "rgba(245,158,11,0.04)", boxShadow: "0 0 20px rgba(245,158,11,0.08)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs text-amber-800 uppercase tracking-widest">pro</p>
                <span className="font-mono text-[10px] text-amber-500/70 bg-amber-900/30 border border-amber-900/50 px-2 py-0.5 rounded">most popular</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono text-sm text-slate-500">{SYM}</span>
                <span className="font-mono text-3xl font-bold text-[hsl(30,91%,55%)]">{ADAUTO_PRICE}</span>
                <span className="font-mono text-xs text-slate-600">/mo</span>
              </div>
              <p className="font-mono text-xs text-slate-700 mb-5">unlimited · all platforms · engagement learning</p>
              <Link href="/adauto/pricing"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-mono font-medium transition-all text-white"
                style={{ background: "hsl(30,91%,45%)" }}>
                get adauto pro
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════ BUNDLE */}
      <section className="border-t border-white/5 py-20" style={{ background: "#00080f" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="rounded-2xl border border-white/8 overflow-hidden"
               style={{ background: "rgba(255,255,255,0.015)" }}>
            <div className="px-8 py-8 sm:py-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-yellow-500/80 bg-yellow-500/8 px-2.5 py-1 rounded-full border border-yellow-500/15">
                      <Zap className="w-3 h-3" />
                      bundle — save 20%
                    </span>
                  </div>
                  <h3 className="font-mono font-bold text-white text-2xl mb-3 tracking-tight">
                    <span className="gradient-text">deepstrain</span>
                    <span className="text-white/25 mx-3">+</span>
                    <span className="text-[hsl(220,91%,65%)]">ATLAS</span>
                    <span className="text-white/25 mx-3">+</span>
                    <span className="text-[hsl(30,91%,55%)]">ADAUTO</span>
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                    Atlas maps what you built. deepstrain improves it. Adauto tells the world about it.
                    Three tools, one cognitive loop — understand, execute, narrate.
                  </p>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-4 flex-shrink-0">
                  <div className="font-mono text-right">
                    <div className="text-xs text-slate-700 line-through mb-0.5">
                      {SYM}{Number(DS_PRICE) + AB + Number(ADAUTO_PRICE)}/mo separately
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-slate-500">{SYM}</span>
                      <span className="text-4xl font-bold text-white">{Math.round((Number(DS_PRICE) + AB + Number(ADAUTO_PRICE)) * 0.8)}</span>
                      <span className="text-sm text-slate-500">/mo</span>
                    </div>
                    <div className="text-xs text-yellow-500/60 mt-0.5">all three products · cancel anytime</div>
                  </div>
                  <Link href="/bundle"
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-mono rounded-md transition-all">
                    view bundle
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ HOW THEY FIT */}
      <section className="border-t border-white/5 py-16" style={{ background: "#010d1a" }}>
        <div className="max-w-7xl mx-auto px-5">
          <p className="font-mono text-xs text-slate-700 uppercase tracking-widest mb-8">// how they fit together</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                tag:    "use deepstrain when",
                col:    "text-strain-500",
                border: "border-strain-900/50",
                items:  [
                  "you want the work done, not suggested",
                  "shipping a feature or fixing a bug",
                  "running tests end-to-end autonomously",
                  "you need a BYOK reasoning agent",
                ],
              },
              {
                tag:    "use atlas when",
                col:    "text-[hsl(220,91%,65%)]",
                border: "border-indigo-900/50",
                items:  [
                  "you're onboarding onto a large codebase",
                  "running a security audit before deploy",
                  "deciding what to refactor next",
                  "tracking tech debt over time",
                ],
              },
              {
                tag:    "use adauto when",
                col:    "text-[hsl(30,91%,55%)]",
                border: "border-amber-900/40",
                items:  [
                  "you ship and need the world to know",
                  "content decays faster than you can write",
                  "Reddit/dev.to posts sit on your todo list",
                  "you need ROI tracking per post",
                ],
              },
              {
                tag:    "use all three when",
                col:    "text-yellow-400",
                border: "border-yellow-900/30",
                items:  [
                  "atlas maps → deepstrain ships → adauto narrates",
                  "full visibility + full execution + full presence",
                  "you run a serious production product",
                  "complexity scales, narrative must keep up",
                ],
              },
            ].map((col) => (
              <div key={col.tag}
                   className={`rounded-lg border ${col.border} p-5`}
                   style={{ background: "rgba(255,255,255,0.015)" }}>
                <p className={`font-mono text-xs font-semibold uppercase tracking-wider mb-4 ${col.col}`}>{col.tag}</p>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-mono text-xs text-slate-500">
                      <span className={`mt-px flex-shrink-0 ${col.col}`}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ TOKEN LIMIT · LOCAL FALLBACK */}
      <section className="border-t border-white/5 py-20 sm:py-24" style={{ background: "#00080f" }}>
        <div className="max-w-4xl mx-auto px-5">

          <p className="font-mono text-xs text-slate-600 tracking-[0.3em] uppercase mb-4 text-center">
            when the cloud stops, the work does not
          </p>
          <h2 className="font-mono font-bold text-white text-center mb-5 tracking-tighter leading-[1.1]"
              style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)" }}>
            Claude hit its limit.<br />
            <span className="text-white/40">deepstrain didn&apos;t.</span>
          </h2>
          <p className="text-slate-400 font-mono text-sm max-w-2xl mx-auto mb-14 text-center leading-relaxed">
            Every cloud AI has a session cap. When yours resets in 5 hours, you have two choices:
            wait — or switch the brain without losing the tools.
          </p>

          {/* the 3-step flow */}
          <div className="grid sm:grid-cols-3 gap-4 mb-14">
            {[
              {
                step: "01",
                title: "Claude hits the limit",
                body:  "Session ends. Context is gone. The tools are not — deepstrain's 51 tools are local, always on.",
                color: "text-slate-500",
                border: "border-white/6",
              },
              {
                step: "02",
                title: "Switch the brain",
                body:  "One command. deepstrain points at your local Ollama model (qwen2.5-coder, llama3, any GGUF). Same tools. Same data. No wait.",
                color: "text-strain-500",
                border: "border-strain-900/40",
              },
              {
                step: "03",
                title: "Continue from here",
                body:  "handoff.py exports the session summary. The local LLM reads it. You pick up exactly where you left off.",
                color: "text-indigo-400",
                border: "border-indigo-900/40",
              },
            ].map(s => (
              <div key={s.step} className={`rounded-xl border ${s.border} px-6 py-5`}
                   style={{ background: "rgba(255,255,255,0.015)" }}>
                <p className={`font-mono text-xs font-bold mb-2 ${s.color}`}>{s.step}</p>
                <p className="font-mono text-sm font-bold text-white mb-2">{s.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">{s.body}</p>
              </div>
            ))}
          </div>

          {/* the command */}
          <div className="rounded-xl border border-white/8 px-6 py-5 mb-14 max-w-2xl mx-auto"
               style={{ background: "rgba(6,182,212,0.03)" }}>
            <p className="font-mono text-xs text-slate-600 mb-3">// switch brain in one step</p>
            <pre className="font-mono text-sm text-strain-400 leading-relaxed whitespace-pre-wrap">{`set DEEPSTRAIN_BASE_URL=http://localhost:11434/v1
deepstrain chat          # same 51 tools, local brain

# or use the handoff helper:
python handoff.py        # exports session → injects context → opens chat`}</pre>
            <p className="font-mono text-xs text-slate-600 mt-3">
              works with Ollama · LM Studio · any OpenAI-compatible local endpoint
            </p>
          </div>

          {/* the insight: this creates an adauto hunt signal */}
          <div className="max-w-2xl mx-auto rounded-xl border border-amber-900/30 px-6 py-5"
               style={{ background: "rgba(245,158,11,0.03)" }}>
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-amber-500 mt-0.5 flex-shrink-0">signal</span>
              <div>
                <p className="font-mono text-sm font-bold text-white mb-1.5">
                  Those 5 hours create a hunt signal.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  Every day, thousands of developers post{" "}
                  <span className="text-slate-400">&quot;Claude hit its limit, any alternatives?&quot;</span>{" "}
                  on Reddit, HN, and dev.to.
                  adauto watches those threads. When one appears, it drafts a genuine reply —
                  deepstrain as the local-first alternative that keeps working.
                  Human-approved before it posts. Zero spam.
                </p>
                <p className="font-mono text-xs text-amber-600/70 mt-3">
                  hunt → respond → approve → post · adauto closes the loop
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ FOOTER */}
      <footer className="py-8 border-t border-white/5" style={{ background: "#010d1a" }}>
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs select-none">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <rect x="2" y="3"    width="12" height="2.5" rx="1.25" fill="#22d3ee" />
              <rect x="2" y="6.75" width="12" height="2.5" rx="1.25" fill="#6366f1" />
              <rect x="2" y="10.5" width="12" height="2.5" rx="1.25" fill="#f59e0b" />
            </svg>
            <span className="font-bold" style={{ background: "linear-gradient(90deg,#22d3ee,#6366f1,#f59e0b)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              massiron
            </span>
            <span className="text-white/15 mx-1">·</span>
            <span className="text-slate-600">deepstrain · atlas · adauto</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-mono text-xs text-slate-700">
            <Link href="/deepstrain" className="hover:text-strain-400 transition-colors">deepstrain</Link>
            <Link href="/atlas"      className="hover:text-[hsl(220,91%,65%)] transition-colors">atlas</Link>
            <Link href="/adauto"     className="hover:text-[hsl(30,91%,55%)] transition-colors">adauto</Link>
            <Link href="/bundle"     className="hover:text-slate-400 transition-colors">bundle</Link>
            <Link href="/docs"       className="hover:text-slate-400 transition-colors">docs</Link>
            <Link href="/privacy"    className="hover:text-slate-400 transition-colors">privacy</Link>
            <Link href="/terms"      className="hover:text-slate-400 transition-colors">terms</Link>
          </div>
          <div className="font-mono text-xs text-slate-800">
            © {new Date().getFullYear()} massiron · forged on your machine
          </div>
        </div>
      </footer>
    </>
  );
}
