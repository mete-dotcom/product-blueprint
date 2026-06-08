import Head from "next/head";
import Link from "next/link";
import { MassironNav } from "../components/MassironNav";
import { MassironFooter } from "../components/MassironFooter";
import { ArrowRight, Terminal, GitBranch, Zap, Shield, Package, Activity, Lock, Cpu, BookOpen, AlertTriangle, Users, RotateCcw, Layers, Code, Check } from "lucide-react";

const DS_PRICE     = process.env.NEXT_PUBLIC_DEEPSTRAIN_PRICE    || "9";
const ATLAS_PRICE  = process.env.NEXT_PUBLIC_ATLAS_PRICE         || "19";
const ADAUTO_PRICE = process.env.NEXT_PUBLIC_ADAUTO_PRICE        || "29";
const SYM          = "$";
const AB           = Number(ATLAS_PRICE);

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

const TIER_BADGE: Record<string, string> = {
  solo: "text-slate-500 border-slate-800",
  pro:  "text-cyan-600 border-cyan-900",
  ent:  "text-amber-600 border-amber-900",
};

function SectionNumber({ n, color }: { n: string; color: string }) {
  return (
    <div className="relative select-none pointer-events-none overflow-hidden h-0">
      <span
        className={`absolute -top-4 right-0 font-mono font-black leading-none ${color}`}
        style={{ fontSize: "11rem", opacity: 0.04, letterSpacing: "-0.05em" }}
      >
        {n}
      </span>
    </div>
  );
}

function Terminal_({ title, accent, lines }: {
  title: string;
  accent: string;
  lines: { prompt?: boolean; text: string; color: string }[];
}) {
  return (
    <div className="font-mono text-xs overflow-hidden" style={{ background: "#0a0a0a", border: "1px solid #1e1e1e" }}>
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#1e1e1e]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2a1a1a]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a1a]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#1a2a1a]" />
        </div>
        <span className="text-[#3a3a3a] flex-1">{title}</span>
        <span className={`flex items-center gap-1.5 ${accent}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          live
        </span>
      </div>
      <div className="p-5 space-y-1 leading-relaxed">
        {lines.map((l, i) => (
          <div key={i} className={l.color}>
            {l.prompt && <span className="text-[#2a2a2a] mr-1">$</span>}
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hub() {
  const bundleTotal = Number(DS_PRICE) + AB + Number(ADAUTO_PRICE);
  const bundlePrice = Math.round(bundleTotal * 0.8);

  return (
    <>
      <Head>
        <title>massiron — the intelligence is forged.</title>
        <meta name="description" content="massiron builds the intelligence into the tools — deterministic understanding (atlas), autonomous execution (deepstrain), owned outright. Swap in any model. The result doesn't change." />
        <style>{`html { scroll-behavior: smooth; }`}</style>
      </Head>

      <MassironNav />

      {/* ═══════════════════════════════════════════════════════════ HERO */}
      <section style={{ background: "#0a0a0a", minHeight: "100vh" }}
               className="relative flex flex-col items-center justify-center pt-14 overflow-hidden">

        {/* grid */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: "linear-gradient(#1e1e1e 1px,transparent 1px),linear-gradient(90deg,#1e1e1e 1px,transparent 1px)", backgroundSize: "48px 48px", opacity: 0.5 }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-28 w-full">

          {/* stat bar */}
          <div className="flex items-center justify-center gap-8 mb-12 font-mono text-xs text-[#3a3a3a]">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-strain-500" /> 57 tools live</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> 0-token intelligence</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> ethics-first</span>
          </div>

          {/* headline — benefit-first */}
          <h1 className="font-mono font-black text-center leading-[1.0] tracking-tighter mb-6"
              style={{ fontSize: "clamp(2.6rem, 6vw, 5.5rem)" }}>
            <span className="text-white">your coding agent,</span>
            <br />
            <span style={{
              background: "linear-gradient(90deg, #22c55e 0%, #22d3ee 50%, #f59e0b 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent"
            }}>
              supercharged.
            </span>
          </h1>

          <p className="font-mono text-sm text-[#6a6a6a] text-center max-w-2xl mx-auto leading-relaxed mb-4">
            Stop burning your expensive assistant&apos;s quota on file reads and test loops.
            <strong className="text-white"> deepstrain</strong> does the heavy lifting at 3&times; fewer turns.
            <strong className="text-cyan-500"> atlas</strong> maps your code in seconds with zero LLM tokens.
            <strong className="text-orange-500"> adauto</strong> ships what you build — on autopilot.
          </p>
          <p className="font-mono text-xs text-[#2a2a2a] text-center mb-16">
            pip install &middot; your machine &middot; your key &middot; any model &middot; no hidden costs
          </p>

          {/* single CTA — buy deepstrain, get 3 tools */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/pricing"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-strain-600 hover:bg-strain-500 text-white font-bold font-mono text-sm transition-all glow group">
              try deepstrain &mdash; {SYM}{DS_PRICE}/mo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/activate"
               className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-[#2a2a2a] hover:border-[#4a4a4a] text-[#6a6a6a] hover:text-white font-mono text-xs transition-all">
              already a user? activate &rarr;
            </Link>
          </div>

          {/* product dispatch board */}
          <div className="border border-[#1e1e1e]" style={{ background: "#0d0d0d" }}>
            <div className="grid grid-cols-3 divide-x divide-[#1e1e1e]">
              {[
                {
                  href:    "#deepstrain",
                  num:     "01",
                  name:    "deepstrain",
                  role:    "autonomous execution",
                  signal:  "● executing",
                  color:   "#22c55e",
                  dim:     "#0a2010",
                  price:   `${SYM}${DS_PRICE}/mo`,
                  copy:    "Reads your codebase, edits files, runs tests, commits. 3× fewer turns than doing it yourself.",
                  benefit: "faster",
                },
                {
                  href:    "#atlas",
                  num:     "02",
                  name:    "atlas",
                  role:    "code intelligence",
                  signal:  "● deterministic",
                  color:   "#22d3ee",
                  dim:     "#0d0d0d",
                  price:   `from ${SYM}${ATLAS_PRICE}/mo`,
                  copy:    "Pure AST. No LLM, no guesses. Full dependency graph, risk map, security scan in 69s.",
                  benefit: "cheaper",
                },
                {
                  href:    "#adauto",
                  num:     "03",
                  name:    "adauto",
                  role:    "marketing automation",
                  signal:  "● pending review",
                  color:   "#fb923c",
                  dim:     "#1a1000",
                  price:   `free &middot; pro ${SYM}${ADAUTO_PRICE}/mo`,
                  copy:    "Generates posts, learns from engagement, ethics-filtered. Nothing publishes without your approval.",
                  benefit: "easier",
                },
              ].map((p) => (
                <a key={p.name} href={p.href}
                   className="group block px-6 py-6 hover:opacity-90 transition-opacity"
                   style={{ background: p.dim }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] text-[#2a2a2a]">{p.num}</span>
                    <span className="font-mono text-[10px]" style={{ color: p.color }}>{p.signal}</span>
                  </div>
                  <div className="font-mono font-black text-white text-xl mb-0.5">{p.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: p.color + "80" }}>{p.role}</div>
                  <p className="font-mono text-xs text-[#4a4a4a] leading-relaxed mb-5">{p.copy}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white">{p.price}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider" style={{color: p.color}}>{p.benefit}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#2a2a2a] group-hover:translate-x-1 group-hover:text-white transition-all" />
                    </div>
                  </div>
                  <div className="mt-4 h-0.5" style={{ background: `linear-gradient(90deg, ${p.color}60, transparent)` }} />
                </a>
              ))}
            </div>
          </div>

          <p className="font-mono text-[10px] text-[#1a2a3a] text-center mt-8">&darr; scroll for details</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ THE PRINCIPLE */}
      <section style={{ background: "#0d0d0d" }} className="border-t border-[#1e1e1e] py-24">
        <div className="max-w-5xl mx-auto px-5">

          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-[10px] text-[#1a2a3a] tracking-[0.3em] uppercase">the principle</span>
            <div className="flex-1 h-px bg-[#1e1e1e]" />
          </div>

          <h2 className="font-mono font-black text-white leading-[1.05] tracking-tighter mb-4"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
            maximum deterministic value.<br />
            <span className="text-[#3a3a3a]">in every condition.</span>
          </h2>

          <p className="font-mono text-sm text-[#5a5a5a] max-w-2xl leading-relaxed mb-16">
            The core of every tool is deterministic — same input, same answer, no model required.
            An AI brain only makes it faster; it never decides the truth. The value never depends
            on a key, a cloud, or a vendor staying online.
          </p>

          {/* three pillars */}
          <div className="grid sm:grid-cols-3 gap-0 border border-[#1e1e1e]">
            {[
              { n: "0", unit: "LLM tokens", color: "#22c55e", body: "Code analysis, graphs and risk are pure computation. Nothing to pay per query." },
              { n: "0", unit: "hallucinations", color: "#22d3ee", body: "Reproducible output, identical five years from now. A model can't lie about what is actually there." },
              { n: "∞", unit: "offline runtime", color: "#f59e0b", body: "Everything runs on your machine. Your key, your code — nothing leaves. Ever." },
            ].map((p, i) => (
              <div key={p.unit} className={`px-8 py-8 ${i < 2 ? "border-r border-[#1e1e1e]" : ""}`}
                   style={{ background: "#111111" }}>
                <div className="font-mono font-black leading-none mb-1"
                     style={{ fontSize: "4rem", color: p.color }}>{p.n}</div>
                <div className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: p.color + "80" }}>{p.unit}</div>
                <p className="font-mono text-xs text-[#4a4a4a] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          {/* brain tiers */}
          <div className="mt-8">
            <div className="font-mono text-[10px] text-[#1a2a3a] uppercase tracking-[0.3em] mb-4">immortal — any brain, or none</div>
            <div className="grid sm:grid-cols-3 gap-0 border border-[#1e1e1e]">
              {[
                { tier: "tier 1", title: "cloud brain", body: "Drop in a DeepSeek key → full autonomous agent loop at cloud speed.", color: "#22c55e" },
                { tier: "tier 2", title: "local brain", body: "No cloud key? Point it at Ollama. Same agent, fully offline.", color: "#22d3ee" },
                { tier: "tier 3", title: "no brain at all", body: "The MCP server + 51 tools still stand. Your existing LLM discovers and drives them.", color: "#f59e0b" },
              ].map((t, i) => (
                <div key={t.tier} className={`px-6 py-5 ${i < 2 ? "border-r border-[#1e1e1e]" : ""}`}
                     style={{ background: "#0d0d0d" }}>
                  <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: t.color + "60" }}>{t.tier}</div>
                  <div className="font-mono text-sm font-bold text-white mb-2">{t.title}</div>
                  <p className="font-mono text-xs text-[#4a4a4a] leading-relaxed">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ 01 · DEEPSTRAIN */}
      <section id="deepstrain" className="border-t border-[#1e1e1e]" style={{ background: "#0a0a0a" }}>

        {/* section identity bar */}
        <div style={{ background: "#0a1808", borderBottom: "1px solid #1a2a10" }}>
          <div className="max-w-7xl mx-auto px-5 py-4 flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#22c55e30] font-black" style={{ fontSize: "3rem", lineHeight: 1 }}>01</span>
            <div className="flex-1 h-px bg-[#1a2a10]" />
            <span className="font-mono text-xs font-black text-white">deepstrain</span>
            <span className="font-mono text-[10px] text-[#22c55e60] uppercase tracking-widest">autonomous execution runtime</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 py-20">

          {/* headline */}
          <h2 className="font-mono font-black text-white leading-[1.0] tracking-tighter mb-4"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", borderLeft: "4px solid #22c55e", paddingLeft: "1.5rem" }}>
            not a copilot.<br />
            <span style={{ color: "#22c55e" }}>an autopilot.</span>
          </h2>
          <p className="font-mono text-sm text-[#5a5a5a] max-w-2xl leading-relaxed mb-16 pl-7">
            It doesn&apos;t suggest what you should type next. It runs the task end-to-end —
            reading files, making changes, verifying results — without you watching.
          </p>

          <div className="grid lg:grid-cols-5 gap-8 items-start mb-16">

            {/* left */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                {[
                  { label: "reasoning, not completion.", body: "DeepSeek R1 thinks through problems before acting. Complex refactors, failing test suites — it plans, then executes.", col: "#22c55e" },
                  { label: "18× cheaper than GPT-4.", body: "BYOK. Requests go direct to platform.deepseek.com. ~$0.27/M tokens. A typical bug fix costs less than a coffee.", col: "#16a34a" },
                  { label: "your code never leaves.", body: "No proxy. No logging. API key goes direct from your terminal to DeepSeek. We never see it.", col: "#15803d" },
                ].map((c) => (
                  <div key={c.label} className="pl-4" style={{ borderLeft: `2px solid ${c.col}40` }}>
                    <p className="font-mono text-sm font-bold mb-2" style={{ color: c.col }}>{c.label}</p>
                    <p className="font-mono text-xs text-[#4a4a4a] leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>

              {/* install steps */}
              <div className="border border-[#1a2a10]" style={{ background: "#060e06" }}>
                {[
                  { n: "01", cmd: "pip install deepstrain",          note: "compiled binary · 4 MB" },
                  { n: "02", cmd: "deepstrain chat",                 note: "browser → pay → activate" },
                  { n: "03", cmd: 'strain chat "ship this feature"', note: "agent loop starts" },
                ].map((s, i, arr) => (
                  <div key={s.n} className={`flex items-center gap-4 px-4 py-3 font-mono text-xs ${i < arr.length - 1 ? "border-b border-[#1a2a10]" : ""}`}>
                    <span className="text-[#1a2a1a] w-5 flex-shrink-0">{s.n}</span>
                    <code style={{ color: "#22c55e" }} className="flex-1">{s.cmd}</code>
                    <span className="text-[#2a3a2a] hidden sm:block">{s.note}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/pricing" className="group inline-flex items-center gap-2 px-5 py-2.5 text-black text-sm font-mono font-bold transition-all"
                      style={{ background: "#22c55e" }}>
                  start free trial
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/deepstrain" className="inline-flex items-center gap-2 px-5 py-2.5 text-[#3a4a3a] text-sm font-mono border border-[#1a2a10] hover:border-[#22c55e30] hover:text-white transition-all">
                  full details
                </Link>
              </div>
            </div>

            {/* right: terminal */}
            <div className="lg:col-span-3">
              <Terminal_
                title="deepstrain — autonomous agent"
                accent="text-[#22c55e]"
                lines={[
                  { prompt: true, text: "pip install deepstrain", color: "text-[#e2e8f0]" },
                  { text: "  ✓ deepstrain-0.5.2 installed  (4.1 MB compiled)", color: "text-[#1a2a1a]" },
                  { prompt: true, text: "deepstrain chat", color: "text-[#e2e8f0]" },
                  { text: "  opening browser... activation complete", color: "text-[#2a3a2a]" },
                  { prompt: true, text: 'strain chat "run tests, fix all failures"', color: "text-[#e2e8f0]" },
                  { text: "  ▸ reading codebase (37 files)...", color: "text-[#22c55e40]" },
                  { text: "  ▸ running pytest — 4 failures", color: "text-[#22c55e60]" },
                  { text: "  ▸ patching src/auth/session.py", color: "text-[#22c55e80]" },
                  { text: "  ▸ patching src/db/pool.py", color: "text-[#22c55e80]" },
                  { text: "  ▸ all 47 tests pass  ·  3 turns  ·  $0.11", color: "text-[#22c55e]" },
                  { text: "  █", color: "text-[#1a2a1a]" },
                ]}
              />
            </div>

          </div>

          {/* metrics */}
          <div className="grid grid-cols-4 border border-[#1e1e1e]">
            {[
              { n: "52",     l: "built-in tools" },
              { n: "~4 MB",  l: "binary size" },
              { n: "BYOK",   l: "deepseek key" },
              { n: "$0.009", l: "avg task cost" },
            ].map((m, i) => (
              <div key={m.l} className={`py-6 px-6 text-center ${i < 3 ? "border-r border-[#1e1e1e]" : ""}`}
                   style={{ background: "#0d0d0d" }}>
                <div className="font-mono text-2xl font-black text-white mb-1">{m.n}</div>
                <div className="font-mono text-[10px] text-[#2a2a2a] uppercase tracking-widest">{m.l}</div>
              </div>
            ))}
          </div>

          {/* features */}
          <div className="mt-8">
            <div className="font-mono text-[10px] text-[#1a2a1a] uppercase tracking-[0.3em] mb-4">// what you get</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-[#1a2a10]">
              {[
                { icon: <Terminal className="w-4 h-4" />, title: "autonomous loop", body: "Reads your codebase, edits files, runs tests, fixes errors — on its own." },
                { icon: <Cpu className="w-4 h-4" />, title: "deepseek r1 reasoning", body: "Chain-of-thought model. Architecture decisions, multi-file refactors, complex debugging." },
                { icon: <Zap className="w-4 h-4" />, title: "52 built-in tools", body: "Filesystem · git · shell · web · reasoning · memory. Everything to complete a task." },
                { icon: <Shield className="w-4 h-4" />, title: "byok — stays local", body: "Your DeepSeek API key, your hardware. Requests go direct to DeepSeek." },
                { icon: <Package className="w-4 h-4" />, title: "compiled binary", body: "Nuitka-compiled, ~4 MB, via PyPI. No source exposure, no interpreter overhead." },
                { icon: <Lock className="w-4 h-4" />, title: "offline-capable", body: "HMAC-signed license, works without internet after first activation." },
              ].map((f, i) => (
                <div key={f.title}
                     className={`p-5 ${i % 3 < 2 ? "border-r border-[#1a2a10]" : ""} ${i < 3 ? "border-b border-[#1a2a10]" : ""}`}
                     style={{ background: "#0a0a0a" }}>
                  <div className="flex items-center gap-2 mb-3" style={{ color: "#22c55e80" }}>
                    {f.icon}
                    <span className="font-mono text-xs font-bold" style={{ color: "#22c55e" }}>{f.title}</span>
                  </div>
                  <p className="font-mono text-xs text-[#3a4a3a] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ 02 · ATLAS */}
      <section id="atlas" className="border-t border-[#1e1e1e]" style={{ background: "#0a0a0a" }}>

        <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e" }}>
          <div className="max-w-7xl mx-auto px-5 py-4 flex items-center gap-4">
            <span className="font-mono font-black text-[#22d3ee20]" style={{ fontSize: "3rem", lineHeight: 1 }}>02</span>
            <div className="flex-1 h-px bg-[#1e1e1e]" />
            <span className="font-mono text-xs font-black text-white">ATLAS</span>
            <span className="font-mono text-[10px] text-[#22d3ee60] uppercase tracking-widest">deterministic code intelligence</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 py-20">

          <h2 className="font-mono font-black text-white leading-[1.0] tracking-tighter mb-4"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", borderLeft: "4px solid #22d3ee", paddingLeft: "1.5rem" }}>
            see exactly<br />
            <span style={{ color: "#22d3ee" }}>what&apos;s there.</span>
          </h2>
          <p className="font-mono text-sm text-[#5a5a5a] max-w-2xl leading-relaxed mb-16 pl-7">
            Pure AST analysis. No LLM, no guesses.
            Dependency graphs, security scans, hotspot detection. One HTML report that works offline, forever.
          </p>

          {/* proof strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#1e1e1e] mb-16">
            {[
              { n: "69s",    l: "full scan, 111k lines" },
              { n: "0",      l: "LLM tokens" },
              { n: "1,999",  l: "functions mapped" },
              { n: "89/100", l: "health score" },
            ].map((m, i) => (
              <div key={m.l} className={`py-6 px-6 text-center ${i < 3 ? "border-r border-[#1e1e1e]" : ""}`}
                   style={{ background: "#111111" }}>
                <div className="font-mono text-2xl font-black mb-1" style={{ color: "#22d3ee" }}>{m.n}</div>
                <div className="font-mono text-[10px] text-[#222222] uppercase tracking-widest">{m.l}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start mb-16">

            {/* terminal */}
            <div className="lg:col-span-3">
              <Terminal_
                title="atlas — code intelligence"
                accent="text-[#22d3ee]"
                lines={[
                  { prompt: true, text: "pip install atlas-intel && atlas scan .", color: "text-[#e2e8f0]" },
                  { text: "  [atlas] scanning 388 files...", color: "text-[#22d3ee20]" },
                  { text: "  ✓ core            → 1,999 symbols mapped", color: "text-[#22d3ee40]" },
                  { text: "  ✓ system_map      → 29,148 import edges", color: "text-[#22d3ee60]" },
                  { text: "  ✓ risk_radar      → 12 high-risk files", color: "text-[#22d3ee80]" },
                  { text: "  ✓ security_shield → Bandit: 0 critical", color: "text-[#22d3ee80]" },
                  { text: "  ✓ code_health     → 1,544 dead functions", color: "text-[#22d3ee]" },
                  { text: "  ✓ report ready: atlas_report.html  (69s)", color: "text-[#22d3ee]" },
                  { text: "  // 0 LLM tokens · offline forever · share freely", color: "text-[#222222]" },
                ]}
              />

              <div className="mt-4 flex items-center gap-3">
                <Link href="/atlas/demo"
                  className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs border transition-all"
                  style={{ color: "#22d3ee", borderColor: "#22d3ee40", background: "#22d3ee08" }}>
                  view live report demo
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* claims + CTA */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                {[
                  { label: "no hallucinations.", body: "Pure AST. Same codebase always gives the same output. No probabilistic guesses, no model errors.", col: "#22d3ee" },
                  { label: "works offline.", body: "Scan on a plane. Share the HTML without a server. No account needed after activation.", col: "#0ea5e9" },
                  { label: "plugs into your AI assistant.", body: "atlas_mcp exposes the full call graph to Claude, Cursor, or any MCP-compatible tool.", col: "#0284c7" },
                ].map((c) => (
                  <div key={c.label} className="pl-4" style={{ borderLeft: `2px solid ${c.col}40` }}>
                    <p className="font-mono text-sm font-bold mb-2" style={{ color: c.col }}>{c.label}</p>
                    <p className="font-mono text-xs text-[#4a4a4a] leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/atlas/pricing" className="group inline-flex items-center gap-2 px-5 py-2.5 text-black text-sm font-mono font-bold"
                      style={{ background: "#22d3ee" }}>
                  start free trial
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/atlas" className="inline-flex items-center gap-2 px-5 py-2.5 text-[#2a3a2a] text-sm font-mono border border-[#1e1e1e] hover:text-white transition-all">
                  full details
                </Link>
              </div>
            </div>

          </div>

          {/* modules */}
          <div>
            <div className="font-mono text-[10px] text-[#1e2e1e] uppercase tracking-[0.3em] mb-4">// analysis modules</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-[#1e1e1e]">
              {atlasModules.map((m, i) => (
                <div key={m.name}
                     className={`p-4 ${i % 3 < 2 ? "border-r border-[#1e1e1e]" : ""} ${i < atlasModules.length - 3 ? "border-b border-[#1e1e1e]" : ""}`}
                     style={{ background: "#0a0a0a" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ color: "#22d3ee40" }}>{m.icon}</span>
                      <code className="font-mono text-xs text-[#8896a8] font-medium">{m.name}</code>
                    </div>
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 border ${TIER_BADGE[m.tier]}`}>{m.tier}</span>
                  </div>
                  <p className="font-mono text-[11px] text-[#2a2a2a] leading-relaxed">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ 03 · ADAUTO */}
      <section id="adauto" className="border-t border-[#1e1e1e]" style={{ background: "#0a0a0a" }}>

        {/* identity bar — gradient border bottom */}
        <div style={{ background: "#0d0d0d", borderBottom: "1px solid transparent", backgroundClip: "padding-box", boxShadow: "inset 0 -1px 0 #2a1a08" }}>
          <div className="max-w-7xl mx-auto px-5 py-4 flex items-center gap-4">
            <span className="font-mono font-black"
                  style={{ fontSize: "3rem", lineHeight: 1, background: "linear-gradient(135deg,#f59e0b20,#fb923c20)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>03</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,#2a1a08,#1e1e1e)" }} />
            <span className="font-mono text-xs font-black"
                  style={{ background: "linear-gradient(90deg,#f59e0b,#fb923c)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>ADAUTO</span>
            <span className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: "#fb923c60" }}>marketing automation</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 py-20">

          <h2 className="font-mono font-black text-white leading-[1.0] tracking-tighter mb-4"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", borderLeft: "4px solid #fb923c", paddingLeft: "1.5rem",
                       borderImage: "linear-gradient(180deg,#f59e0b,#fb923c) 1" }}>
            human-approved.<br />
            <span style={{ background: "linear-gradient(90deg,#f59e0b,#fb923c)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>every post.</span>
          </h2>
          <p className="font-mono text-sm text-[#5a5a5a] max-w-2xl leading-relaxed mb-16 pl-7">
            Developer marketing that remembers. Runs on your machine, learns from engagement,
            posts only after your approval. Strategy built-in — LLM just writes the words.
          </p>

          {/* proof strip — alternating amber / orange */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#2a1a08] mb-16">
            {[
              { n: "0",         l: "posts without approval", col: "#f59e0b" },
              { n: "~$0.00034", l: "per post",               col: "#fb923c" },
              { n: "3",         l: "platforms",              col: "#f59e0b" },
              { n: "5",         l: "HTTP tools",             col: "#fb923c" },
            ].map((m, i) => (
              <div key={m.l} className={`py-6 px-6 text-center ${i < 3 ? "border-r border-[#2a1a08]" : ""}`}
                   style={{ background: "#0f0c08" }}>
                <div className="font-mono text-2xl font-black mb-1" style={{ color: m.col }}>{m.n}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: m.col + "40" }}>{m.l}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start mb-16">

            {/* claims + CTA */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                {[
                  { label: "approval gate — always on.", body: "Every post lands in pending_approval. Nothing publishes without your review. Editing and rejecting are first-class.", col: "#f59e0b", border: "#f59e0b40" },
                  { label: "engage → learn → adapt.",   body: "Tracks upvotes, comments, replies per post-type. Exploits what works, explores what hasn't been tried.", col: "#fb923c", border: "#fb923c40" },
                  { label: "ethics filter. hard.",       body: "No invented metrics. No roadmap features stated as shipping. No superlatives without a number.", col: "#f59e0b", border: "#f59e0b30" },
                ].map((c) => (
                  <div key={c.label} className="pl-4" style={{ borderLeft: `2px solid ${c.border}` }}>
                    <p className="font-mono text-sm font-bold mb-2" style={{ color: c.col }}>{c.label}</p>
                    <p className="font-mono text-xs text-[#4a4a4a] leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>

              <div style={{ border: "1px solid #2a1a08", background: "#0f0c08" }}>
                {[
                  { n: "01", cmd: "pip install adauto",                note: "python ≥ 3.10",          col: "#f59e0b" },
                  { n: "02", cmd: "adauto serve",                      note: "HTTP :8766",             col: "#fb923c" },
                  { n: "03", cmd: "adauto run --campaign my-product",  note: "generate → approve → post", col: "#f59e0b" },
                ].map((s, i, arr) => (
                  <div key={s.n} className={`flex items-center gap-4 px-4 py-3 font-mono text-xs ${i < arr.length - 1 ? "border-b" : ""}`}
                       style={{ borderColor: "#2a1a08" }}>
                    <span className="w-5 flex-shrink-0" style={{ color: "#3a2010" }}>{s.n}</span>
                    <code className="flex-1" style={{ color: s.col }}>{s.cmd}</code>
                    <span className="hidden sm:block" style={{ color: "#2a1808" }}>{s.note}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/adauto/pricing"
                      className="group inline-flex items-center gap-2 px-5 py-2.5 text-black text-sm font-mono font-bold transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(90deg,#f59e0b,#fb923c)" }}>
                  start free trial
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/adauto"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-mono border hover:text-white transition-all"
                      style={{ color: "#4a3010", borderColor: "#2a1a08" }}>
                  full details
                </Link>
              </div>
            </div>

            {/* terminal — amber prompt, orange output */}
            <div className="lg:col-span-3">
              <div className="font-mono text-xs overflow-hidden" style={{ background: "#030508", border: "1px solid #2a1a08" }}>
                <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid #2a1a08" }}>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2a1a1a]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a1a]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1a2a1a]" />
                  </div>
                  <span className="text-[#3a3a3a] flex-1">adauto — marketing automation</span>
                  <span className="flex items-center gap-1.5" style={{ color: "#fb923c" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    live
                  </span>
                </div>
                <div className="p-5 space-y-1 leading-relaxed">
                  {[
                    { prompt: true,  text: "adauto run --campaign deepstrain-launch", color: "#e2e8f0" },
                    { prompt: false, text: "  strategy: exploit reddit/r/MachineLearning (score 14.2)", color: "#f59e0b30" },
                    { prompt: false, text: "  explore: dev.to long-form (untried)", color: "#fb923c30" },
                    { prompt: false, text: "  generating 2 posts...", color: "#f59e0b50" },
                    { prompt: false, text: "  ✓ reddit  (412 tokens · $0.00014) → pending_approval", color: "#f59e0b80" },
                    { prompt: false, text: "  ✓ dev.to  (890 tokens · $0.00030) → pending_approval", color: "#fb923c80" },
                    { prompt: true,  text: "adauto review", color: "#e2e8f0" },
                    { prompt: false, text: "  reddit post — approve? [y/n/e]  y", color: "#f59e0b" },
                    { prompt: false, text: "  dev.to post  — approve? [y/n/e]  y", color: "#fb923c" },
                    { prompt: true,  text: "adauto post --campaign deepstrain-launch", color: "#e2e8f0" },
                    { prompt: false, text: "  ✓ posted 2 items · total: $0.00044", color: "#fb923c" },
                  ].map((l, i) => (
                    <div key={i} style={{ color: l.color }}>
                      {l.prompt && <span style={{ color: "#f59e0b60" }} className="mr-1">$</span>}
                      {l.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ BUNDLE */}
      <section className="border-t border-[#1e1e1e] py-20" style={{ background: "#0d0d0d" }}>
        <div className="max-w-5xl mx-auto px-5">

          <div className="flex items-center gap-4 mb-10">
            <span className="font-mono text-[10px] text-[#1a2a3a] tracking-[0.3em] uppercase">the full stack</span>
            <div className="flex-1 h-px bg-[#1e1e1e]" />
            <span className="font-mono text-xs" style={{ color: "#f59e0b60" }}>save 20%</span>
          </div>

          <div className="border border-[#1e1e1e]" style={{ background: "#111111" }}>
            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#1e1e1e]">

              <div className="p-8">
                <h3 className="font-mono font-black text-white text-2xl tracking-tight mb-2">
                  <span style={{ color: "#22c55e" }}>deepstrain</span>
                  <span className="text-[#1e1e1e] mx-2">+</span>
                  <span style={{ color: "#22d3ee" }}>atlas</span>
                  <span className="text-[#1e1e1e] mx-2">+</span>
                  <span style={{ color: "#f59e0b" }}>adauto</span>
                </h3>
                <p className="font-mono text-xs text-[#3a3a3a] leading-relaxed mb-6">
                  Atlas maps what you built. deepstrain improves it. Adauto tells the world about it.
                  Three tools, one cognitive loop — understand, execute, narrate.
                </p>
                <div className="space-y-2">
                  {[
                    { c: "#22c55e", t: "deepstrain — autonomous execution" },
                    { c: "#22d3ee", t: "atlas pro — full code intelligence" },
                    { c: "#f59e0b", t: "adauto pro — marketing automation" },
                  ].map((i) => (
                    <div key={i.t} className="flex items-center gap-2 font-mono text-xs text-[#4a4a4a]">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i.c }} />
                      {i.t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs text-[#2a2a2a] line-through mb-2">{SYM}{bundleTotal}/mo separately</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-mono text-sm text-[#3a3a3a]">{SYM}</span>
                    <span className="font-mono font-black text-white" style={{ fontSize: "4rem", lineHeight: 1 }}>{bundlePrice}</span>
                    <span className="font-mono text-sm text-[#3a3a3a]">/mo</span>
                  </div>
                  <p className="font-mono text-[10px] text-[#2a2a2a] mb-8">all three products · 1-day free trial · cancel anytime</p>
                </div>
                <Link href="/bundle" className="group inline-flex items-center justify-center gap-2 px-6 py-3 font-mono text-sm font-bold text-black transition-all"
                      style={{ background: "linear-gradient(90deg, #22c55e, #22d3ee, #f59e0b)" }}>
                  view bundle
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ HOW THEY FIT */}
      <section className="border-t border-[#1e1e1e] py-16" style={{ background: "#0a0a0a" }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="font-mono text-[10px] text-[#1a2a3a] uppercase tracking-[0.3em] mb-8">// when to use which</div>
          <div className="grid sm:grid-cols-3 gap-0 border border-[#1e1e1e]">
            {[
              {
                tag: "use deepstrain when",
                col: "#22c55e",
                items: ["you want the work done, not suggested", "shipping a feature or fixing a bug", "running tests autonomously", "you need a BYOK reasoning agent"],
              },
              {
                tag: "use atlas when",
                col: "#22d3ee",
                items: ["onboarding onto a large codebase", "running a security audit before deploy", "deciding what to refactor next", "tracking tech debt over time"],
              },
              {
                tag: "use adauto when",
                col: "#f59e0b",
                items: ["you shipped something worth talking about", "you want posts that don't embarrass you", "you want to learn what resonates", "you need humans to approve everything"],
              },
            ].map((s, i) => (
              <div key={s.tag} className={`p-6 ${i < 2 ? "border-r border-[#1e1e1e]" : ""}`}
                   style={{ background: "#0d0d0d" }}>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: s.col + "80" }}>{s.tag}</div>
                <ul className="space-y-2">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 font-mono text-xs text-[#3a3a3a]">
                      <span style={{ color: s.col + "60" }} className="flex-shrink-0 mt-0.5">—</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MassironFooter />
    </>
  );
}
