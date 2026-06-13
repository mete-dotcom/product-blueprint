import Link from "next/link";
import {
  ArrowRight, Brain, Database, Lock,
  Layers, Zap, BookOpen, RefreshCw,
} from "lucide-react";
import { Seo } from "../../components/Seo";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";

const CTA      = process.env.NEXT_PUBLIC_NODESTONE_CTA      || "get nodestone";
const PRICE    = process.env.NEXT_PUBLIC_NODESTONE_PRICE    || "7";
const CURRENCY = process.env.NEXT_PUBLIC_NODESTONE_CURRENCY || "USD";
const SYM      = CURRENCY === "USD" ? "$" : CURRENCY;

const specs = [
  { k: "stores",   v: "decisions · context · history" },
  { k: "recall",   v: "semantic + exact"              },
  { k: "binary",   v: "~3 MB  (nuitka)"               },
  { k: "license",  v: "HMAC-signed · local"           },
  { k: "runtime",  v: "python ≥ 3.11"                 },
  { k: "platform", v: "win · linux · macos"           },
];

const pillars = [
  { icon: <Database className="w-4 h-4" />,  title: "persistent memory",      body: "Your project's decisions, conventions and history live in a local store. Nothing to re-explain next session." },
  { icon: <Brain className="w-4 h-4" />,     title: "semantic recall",        body: "Ask your project anything — \"why did we pick this auth flow?\" — and get the answer you already wrote, months ago." },
  { icon: <RefreshCw className="w-4 h-4" />, title: "session continuity",     body: "Every chat starts where the last one ended. Your agent walks in already knowing the codebase." },
  { icon: <Lock className="w-4 h-4" />,      title: "local-first storage",    body: "Memory lives on your machine. HMAC-signed activation. No telemetry, no cloud sync you didn't ask for." },
  { icon: <Layers className="w-4 h-4" />,    title: "MCP-native",             body: "Exposes an MCP server. Claude, Cursor, any MCP host reads and writes your project memory directly." },
];

const steps = [
  { n: "01", cmd: "pip install nodestone",  note: "compiled binary from PyPI" },
  { n: "02", cmd: "nodestone init",          note: "browser opens · activate · memory store created" },
  { n: "03", cmd: "nodestone mcp",           note: "your agent now remembers everything" },
];

export default function NodestoneHome() {
  return (
    <>
      <Seo
        title="nodestone — context continuity engine"
        description="Your project remembers itself. Stop re-teaching your AI every session. Persistent, local, MCP-native project memory."
        path="/nodestone"
      />

      <MassironNav activeProduct="nodestone" />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-14 overflow-hidden"
               style={{ background: "#0a0a0a" }}>
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: "linear-gradient(#1e1e1e 1px,transparent 1px),linear-gradient(90deg,#1e1e1e 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.05]"
             style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-mono text-sky-600 tracking-[0.2em] uppercase mb-6">context continuity engine</p>
            <h1 className="font-mono font-black leading-none tracking-tighter mb-6"
                style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
              <span style={{ color: "#0ea5e9" }}>node</span><span className="text-white">stone</span>
            </h1>
            <p className="font-mono text-base text-slate-300 leading-relaxed mb-2">
              Your project remembers itself.
            </p>
            <p className="font-mono text-sm text-slate-500 leading-relaxed mb-8 max-w-md">
              Stop re-teaching your AI every session. nodestone keeps your decisions,
              conventions and history in a local memory store — so your agent walks in
              already knowing the codebase.
            </p>
            <div className="border border-white/5 rounded-lg overflow-hidden mb-8">
              {specs.map((s, i) => (
                <div key={s.k} className={`flex items-center px-4 py-2.5 font-mono text-xs ${i < specs.length - 1 ? "border-b border-white/5" : ""}`}>
                  <span className="text-slate-600 w-20 flex-shrink-0">{s.k}</span>
                  <span className="text-slate-300">{s.v}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/nodestone/pricing"
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-black text-sm font-mono font-semibold rounded-md transition-colors">
                {CTA} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/nodestone/docs"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/8 hover:border-white/15 text-slate-300 hover:text-white text-sm font-mono rounded-md transition-colors">
                <BookOpen className="w-3.5 h-3.5" /> docs
              </Link>
            </div>
          </div>

          {/* terminal demo */}
          <div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-t-lg border border-b-0 border-white/8 font-mono text-xs"
                 style={{ background: "rgba(255,255,255,0.02)" }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-700" />
                <span className="w-2 h-2 rounded-full bg-yellow-700" />
                <span className="w-2 h-2 rounded-full bg-green-700" />
              </span>
              <span className="text-slate-600 ml-2">nodestone — project memory</span>
              <span className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse inline-block" />
                <span className="text-sky-400">live</span>
              </span>
            </div>
            <div className="border border-white/8 rounded-b-lg overflow-hidden" style={{ background: "#000d1a" }}>
              <div className="p-5 font-mono text-xs space-y-1 leading-relaxed">
                <div><span className="text-sky-500">$</span> <span className="text-slate-300">nodestone init</span></div>
                <div className="text-sky-500 pl-3">✓ memory store created  (~/.nodestone/project.db)</div>
                <div className="pt-1"><span className="text-sky-500">$</span> <span className="text-slate-300">claude &quot;why do we use Redis for sessions?&quot;</span></div>
                <div className="text-slate-500 pl-3">▸ nodestone recall: 2 memories matched</div>
                <div className="text-sky-300 pl-3">▸ &quot;Decided 2026-03: Redis over JWT — needed</div>
                <div className="text-sky-300 pl-6">server-side revocation. See auth ADR.&quot;</div>
                <div className="text-slate-500 pl-3">▸ answered from memory · 0 re-explaining</div>
                <div className="flex items-center gap-1 pl-3 text-slate-700 pt-1">
                  <span className="animate-pulse">█</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <div className="border-y border-white/5" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-4 divide-x divide-white/5">
            {[
              { n: "0",     l: "re-explaining" },
              { n: "~3 MB", l: "binary size" },
              { n: "local", l: "memory store" },
              { n: "MCP",   l: "native server" },
            ].map((m) => (
              <div key={m.l} className="py-6 px-6 text-center">
                <div className="font-mono text-xl font-bold text-white mb-1">{m.n}</div>
                <div className="font-mono text-xs text-slate-600">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THE PROBLEM */}
      <section className="py-24 border-t border-white/5" style={{ background: "#0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs text-sky-700 tracking-widest uppercase">// the problem</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-mono font-black text-white tracking-tight mb-4"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.1 }}>
                every session starts<br />
                <span className="text-white/40">from zero.</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                You explain the architecture. You explain why you picked Postgres.
                You paste the same conventions. Next session — gone. Your AI is brilliant
                and amnesiac. nodestone fixes the amnesia, not the brilliance.
              </p>
              <div className="space-y-2">
                {[
                  "re-pasting context every chat",
                  "the agent re-suggesting things you already rejected",
                  "decisions lost the moment the window closes",
                  "onboarding a new model = starting over",
                ].map((p) => (
                  <div key={p} className="flex items-start gap-2.5 font-mono text-xs text-slate-500">
                    <span className="text-red-700/70 flex-shrink-0 mt-0.5">✕</span>{p}
                  </div>
                ))}
              </div>
            </div>
            <div className="panel p-6 border border-white/5 rounded-lg" style={{ background: "rgba(255,255,255,0.015)" }}>
              <p className="font-mono text-xs text-sky-700 uppercase tracking-wider mb-4">with nodestone</p>
              <div className="font-mono text-xs space-y-2.5 text-slate-400">
                <div className="flex items-start gap-2.5"><span className="text-sky-500 flex-shrink-0 mt-0.5">→</span> decisions written once, recalled forever</div>
                <div className="flex items-start gap-2.5"><span className="text-sky-500 flex-shrink-0 mt-0.5">→</span> the agent remembers what it already tried</div>
                <div className="flex items-start gap-2.5"><span className="text-sky-500 flex-shrink-0 mt-0.5">→</span> swap Claude for GPT — the memory stays</div>
                <div className="flex items-start gap-2.5"><span className="text-sky-500 flex-shrink-0 mt-0.5">→</span> context survives across machines &amp; teammates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="py-24 border-t border-white/5" style={{ background: "#0d0d0d" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs text-sky-700 tracking-widest uppercase">// how it works</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pillars.map((p) => (
              <div key={p.title} className="glass glass-hover p-5 cursor-default">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sky-500">{p.icon}</span>
                  <span className="font-mono text-xs text-sky-300 font-medium">{p.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
            <div className="glass p-5 md:col-span-2">
              <p className="font-mono text-xs text-sky-700 uppercase tracking-wider mb-4">setup</p>
              <div className="space-y-2">
                {steps.map((s) => (
                  <div key={s.n} className="flex items-start gap-3 font-mono text-xs">
                    <span className="text-slate-800 w-5 flex-shrink-0">{s.n}</span>
                    <code className="text-sky-300">{s.cmd}</code>
                    <span className="text-slate-700 hidden sm:block">// {s.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE SUITE — how nodestone completes atlas + deepstrain */}
      <section className="py-24 border-t border-white/5" style={{ background: "#0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs text-sky-700 tracking-widest uppercase">// the full loop</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <h2 className="font-mono font-black text-white tracking-tight mb-4"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.1 }}>
            atlas + deepstrain write solid code.<br />
            <span className="text-sky-400">nodestone remembers the context.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-2xl">
            Understanding, execution, and memory — one cognitive loop. atlas maps what&apos;s there,
            deepstrain changes it, and nodestone makes sure none of that hard-won context
            evaporates when the session ends.
          </p>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { name: "atlas",      role: "understands", body: "Deterministic map of your code — graph, risk, security. Knows what's there.", color: "#22d3ee", href: "/atlas" },
              { name: "deepstrain", role: "executes",    body: "Autonomous agent — reads, edits, tests, ships. Does the work.",             color: "#22c55e", href: "/deepstrain" },
              { name: "nodestone",  role: "remembers",   body: "Persistent project memory — decisions, conventions, history. Keeps the context.", color: "#0ea5e9", href: "/nodestone" },
            ].map((p) => (
              <Link key={p.name} href={p.href}
                    className="block p-5 border border-white/8 rounded-lg hover:border-white/15 transition-colors group"
                    style={{ background: "rgba(255,255,255,0.015)" }}>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: p.color + "90" }}>{p.role}</div>
                <div className="font-mono font-black text-white text-lg mb-2">{p.name}</div>
                <p className="font-mono text-xs text-slate-500 leading-relaxed">{p.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-24 border-t border-white/5" style={{ background: "#0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs text-sky-700 tracking-widest uppercase">// pricing</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="max-w-sm">
            <div className="border border-sky-900/60 rounded-lg overflow-hidden" style={{ background: "rgba(14,165,233,0.02)" }}>
              <div className="px-6 py-5 border-b border-white/5">
                <p className="font-mono text-xs text-sky-600 uppercase tracking-widest mb-3">pro</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-lg text-slate-500">{SYM}</span>
                  <span className="font-mono text-5xl font-bold text-white">{PRICE}</span>
                  <span className="font-mono text-sm text-slate-600">/mo</span>
                </div>
                <p className="font-mono text-xs text-slate-700 mt-1">free tier available · cancel anytime</p>
              </div>
              <div className="px-6 py-5 space-y-2.5">
                {["unlimited project memories","semantic + exact recall","persistent across every session","auto-summarized history","MCP server (any host)","local-first · HMAC-signed"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 font-mono text-xs text-slate-400">
                    <Zap className="w-3 h-3 text-sky-600 flex-shrink-0" />{f}
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <Link href="/nodestone/pricing"
                  className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-black text-sm font-mono font-semibold rounded-md transition-colors">
                  {CTA} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUNDLE CROSS-SELL */}
      <section className="py-16 border-t border-white/5" style={{ background: "#0a0a0a" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="rounded-xl border border-white/8 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
               style={{ background: "rgba(255,255,255,0.015)" }}>
            <div className="flex-1">
              <p className="text-xs font-mono text-sky-700 uppercase tracking-widest mb-2">also from us</p>
              <p className="font-mono font-bold text-white mb-1">
                <span className="text-[#22c55e]">deepstrain</span>
                <span className="text-slate-600 mx-2">+</span>
                <span className="text-[#22d3ee]">atlas</span>
                <span className="text-slate-500 font-normal text-xs ml-3">execution + intelligence</span>
              </p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                The agent that does the work and the analyzer that maps your code. Pair them with nodestone&apos;s memory for the full loop.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/bundle" className="text-xs font-mono px-4 py-2 rounded border border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-black transition-all whitespace-nowrap">
                bundle — save 20% →
              </Link>
              <Link href="/deepstrain" className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">deepstrain →</Link>
            </div>
          </div>
        </div>
      </section>

      <MassironFooter />
    </>
  );
}
