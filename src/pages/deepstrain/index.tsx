import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight, Terminal, Cpu, Lock,
  Package, Zap, BookOpen, Activity,
} from "lucide-react";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";

const CTA      = process.env.NEXT_PUBLIC_DEEPSTRAIN_CTA      || "get deepstrain";
const PRICE    = process.env.NEXT_PUBLIC_DEEPSTRAIN_PRICE    || "9";
const CURRENCY = process.env.NEXT_PUBLIC_DEEPSTRAIN_CURRENCY || "USD";
const SYM      = CURRENCY === "USD" ? "$" : CURRENCY;

const tools = [
  { cat: "filesystem", n: 12 },
  { cat: "execution",  n: 9  },
  { cat: "web",        n: 8  },
  { cat: "git",        n: 7  },
  { cat: "reasoning",  n: 6  },
  { cat: "system",     n: 5  },
  { cat: "memory",     n: 4  },
];

const specs = [
  { k: "model",    v: "deepseek-r1 / v3"   },
  { k: "tools",    v: "52 built-in"         },
  { k: "binary",   v: "~4 MB  (nuitka)"     },
  { k: "license",  v: "HMAC-signed · BYOK"  },
  { k: "runtime",  v: "python ≥ 3.11"       },
  { k: "platform", v: "win · linux · macos" },
];

const steps = [
  { n: "01", cmd: "pip install deepstrain",          note: "compiled binary from PyPI" },
  { n: "02", cmd: "deepstrain chat",                 note: "browser opens · pay · terminal activates" },
  { n: "03", cmd: 'deepstrain eval "ship this"',     note: "autonomous agent loop starts" },
];

const pillars = [
  { icon: <Package className="w-4 h-4" />,  title: "compiled binary",       body: "Nuitka-compiled .pyd/.so via PyPI. No source exposure, no interpreter overhead." },
  { icon: <Cpu className="w-4 h-4" />,      title: "local execution",        body: "Agents run on your machine. Your code and data never leave your hardware." },
  { icon: <Lock className="w-4 h-4" />,     title: "cryptographic licensing",body: "HMAC-SHA256 signed activation. Edge revocation. Works offline after first verify." },
  { icon: <Terminal className="w-4 h-4" />, title: "zero framework",         body: "stdlib + requests only. No LangChain, no orchestration overhead, no abstractions." },
  { icon: <Activity className="w-4 h-4" />, title: "deepseek byok",          body: "Bring your own API key. Requests go direct to DeepSeek — never proxied." },
];

export default function DeepstrainHome() {
  return (
    <>
      <Head>
        <title>deepstrain — autonomous execution runtime</title>
        <meta name="description" content="Terminal-native AI agent. 52 tools, DeepSeek R1, compiled binary. No framework overhead." />
      </Head>

      <MassironNav activeProduct="deepstrain" />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-14 overflow-hidden"
               style={{ background: "#010d1a" }}>
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: "linear-gradient(rgba(34,211,238,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,1) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04]"
             style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-mono text-strain-600 tracking-[0.2em] uppercase mb-6">autonomous execution runtime</p>
            <h1 className="font-mono font-black leading-none tracking-tighter mb-6"
                style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
              <span className="gradient-text">deep</span><span className="text-white">strain</span>
            </h1>
            <div className="border border-white/5 rounded-lg overflow-hidden mb-8">
              {specs.map((s, i) => (
                <div key={s.k} className={`flex items-center px-4 py-2.5 font-mono text-xs ${i < specs.length - 1 ? "border-b border-white/5" : ""}`}>
                  <span className="text-slate-600 w-20 flex-shrink-0">{s.k}</span>
                  <span className="text-slate-300">{s.v}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/deepstrain/pricing"
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-black text-sm font-mono font-semibold rounded-md transition-colors">
                {CTA} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/deepstrain/docs"
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
              <span className="text-slate-600 ml-2">deepstrain — autonomous agent</span>
              <span className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-strain-400 animate-pulse inline-block" />
                <span className="text-strain-400">live</span>
              </span>
            </div>
            <div className="border border-white/8 rounded-b-lg overflow-hidden" style={{ background: "#000d1a" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/demos/deepstrain.gif" alt="deepstrain demo"
                   className="w-full block" style={{ minHeight: "240px", objectFit: "cover" }}
                   onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div className="p-5 font-mono text-xs space-y-1 leading-relaxed">
                <div><span className="text-strain-500">$</span> <span className="text-slate-300">pip install deepstrain</span></div>
                <div className="text-strain-500 pl-3">✓ deepstrain installed  (4.1 MB compiled)</div>
                <div className="pt-1"><span className="text-strain-500">$</span> <span className="text-slate-300">deepstrain eval &quot;run tests, fix failures, repeat until green&quot;</span></div>
                <div className="text-deep-400 pl-3">▸ reading codebase (37 files)...</div>
                <div className="text-deep-400 pl-3">▸ running pytest — 4 failures found</div>
                <div className="text-deep-400 pl-3">▸ patching src/auth/session.py</div>
                <div className="text-strain-400 pl-3">▸ all 47 tests pass  ·  3 turns</div>
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
              { n: "52",    l: "tools" },
              { n: "~4 MB", l: "binary size" },
              { n: "3",     l: "commands to start" },
              { n: "BYOK",  l: "deepseek api" },
            ].map((m) => (
              <div key={m.l} className="py-6 px-6 text-center">
                <div className="font-mono text-xl font-bold text-white mb-1">{m.n}</div>
                <div className="font-mono text-xs text-slate-600">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOOLS */}
      <section className="py-24 border-t border-white/5" style={{ background: "#00080f" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs text-strain-700 tracking-widest uppercase">// toolset</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="font-mono text-xs text-slate-700">52 total</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-1">
              {tools.map((t) => (
                <div key={t.cat} className="flex items-center gap-3 font-mono text-xs py-1.5">
                  <span className="text-strain-700 w-4 text-right">{t.n}</span>
                  <div className="flex-1 h-px" style={{ background: `rgba(6,182,212,${0.08 + (t.n / 52) * 0.25})` }} />
                  <span className="text-slate-500 w-24">{t.cat}</span>
                </div>
              ))}
            </div>
            <div className="panel p-6">
              <p className="font-mono text-xs text-strain-700 uppercase tracking-wider mb-4">execution model</p>
              <div className="font-mono text-xs space-y-2 text-slate-500">
                <div><span className="text-strain-600">→</span> tools run in parallel where safe</div>
                <div><span className="text-strain-600">→</span> autonomous loop until task complete</div>
                <div><span className="text-strain-600">→</span> HMAC-signed execution graph</div>
                <div><span className="text-strain-600">→</span> deterministic replay for auditability</div>
                <div><span className="text-strain-600">→</span> keyring-backed secret storage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="py-24 border-t border-white/5" style={{ background: "#010d1a" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs text-strain-700 tracking-widest uppercase">// architecture</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pillars.map((p) => (
              <div key={p.title} className="glass glass-hover p-5 cursor-default">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-strain-500">{p.icon}</span>
                  <span className="font-mono text-xs text-strain-300 font-medium">{p.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
            <div className="glass p-5 md:col-span-2">
              <p className="font-mono text-xs text-strain-700 uppercase tracking-wider mb-4">setup</p>
              <div className="space-y-2">
                {steps.map((s) => (
                  <div key={s.n} className="flex items-start gap-3 font-mono text-xs">
                    <span className="text-slate-800 w-5 flex-shrink-0">{s.n}</span>
                    <code className="text-strain-300">{s.cmd}</code>
                    <span className="text-slate-700 hidden sm:block">// {s.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEEPSEEK ENGINE */}
      <section className="py-24 border-t border-white/5" style={{ background: "#010d1a" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-mono text-xs text-strain-700 tracking-widest uppercase">// the engine</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          {/* architecture overview */}
          <div className="mb-12 p-5 rounded-lg border border-white/5 font-mono text-xs"
               style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="text-slate-600 mb-3">// two separate LLMs — don't confuse them</div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-white font-bold mb-2">① deepstrain's engine</div>
                <div className="text-strain-400 mb-1">always DeepSeek — cloud or local</div>
                <div className="text-slate-600">This is what executes tasks: reads files,</div>
                <div className="text-slate-600">runs tools, loops until done. You provide</div>
                <div className="text-slate-600">the DeepSeek key (BYOK). Non-negotiable.</div>
              </div>
              <div>
                <div className="text-white font-bold mb-2">② your chat LLM</div>
                <div className="text-slate-300 mb-1">anything — Claude, GPT, Ollama, etc.</div>
                <div className="text-slate-600">This is what you talk to. It understands</div>
                <div className="text-slate-600">your intent, then calls deepstrain as an</div>
                <div className="text-slate-600">MCP tool. deepstrain does the actual work.</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-slate-700">
              you → [Claude / GPT / Ollama / any] ──MCP──▶ deepstrain ──DeepSeek──▶ your codebase
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* left: DeepSeek cloud vs local */}
            <div>
              <h2 className="font-mono font-black text-white tracking-tight mb-4"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.1 }}>
                DeepSeek: cloud <span className="text-white/40">or</span> local.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                deepstrain's execution engine is always DeepSeek — either the cloud API
                (BYOK, ~$0.009/task) or a local DeepSeek model running via Ollama.
                Other models are not supported as the deepstrain engine.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  {
                    label: "cloud (default)",
                    sub:   "platform.deepseek.com",
                    note:  "API key in deepstrain configure · ~$0.009/task · no GPU needed",
                    col:   "text-strain-400",
                    bg:    "rgba(6,182,212,0.04)",
                    border:"border-strain-900/50",
                  },
                  {
                    label: "local deepseek",
                    sub:   "Ollama · deepseek-r1:7b/14b/32b",
                    note:  "GPU on your machine · $0/task · fully air-gapped",
                    col:   "text-slate-200",
                    bg:    "rgba(255,255,255,0.02)",
                    border:"border-white/8",
                  },
                ].map((o) => (
                  <div key={o.label}
                       className={`rounded-lg border ${o.border} px-4 py-3.5`}
                       style={{ background: o.bg }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-xs font-bold ${o.col}`}>{o.label}</span>
                      <code className="font-mono text-[10px] text-slate-600">{o.sub}</code>
                    </div>
                    <p className="font-mono text-xs text-slate-600">{o.note}</p>
                  </div>
                ))}
              </div>

              {/* local deepseek models */}
              <div className="rounded-lg border border-white/5 overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.015)" }}>
                <div className="px-4 py-2 border-b border-white/5 font-mono text-[10px] text-slate-600">
                  local deepseek models (ollama)
                </div>
                {[
                  { m: "deepseek-r1:1.5b", vram: "~1.5 GB", note: "fast, lightweight" },
                  { m: "deepseek-r1:7b",   vram: "~4.7 GB", note: "recommended balance" },
                  { m: "deepseek-r1:14b",  vram: "~9 GB",   note: "complex refactors" },
                  { m: "deepseek-r1:32b",  vram: "~20 GB",  note: "near-cloud quality" },
                ].map((r) => (
                  <div key={r.m} className="flex items-center gap-3 px-4 py-2 border-b border-white/5 last:border-0 font-mono text-xs">
                    <code className="text-strain-400 flex-1">{r.m}</code>
                    <span className="text-slate-700 w-16 text-right">{r.vram}</span>
                    <span className="text-slate-700 hidden sm:block w-32 text-right">{r.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* right: two terminals — cloud vs local */}
            <div className="space-y-4">
              {/* cloud config */}
              <div>
                <div className="font-mono text-[10px] text-slate-700 mb-1.5 pl-1">cloud deepseek (default)</div>
                <div className="border border-white/8 rounded-lg p-4 font-mono text-xs space-y-1 leading-relaxed"
                     style={{ background: "#000d1a" }}>
                  <div><span className="text-strain-600">$</span> <span className="text-slate-300">deepstrain configure</span></div>
                  <div className="text-slate-600 pl-3">api_key: <span className="text-strain-400">sk-••••••••••••••••</span>  <span className="text-slate-700"># your deepseek key</span></div>
                  <div className="text-slate-600 pl-3">model:   <span className="text-strain-400">deepseek-v3</span></div>
                  <div className="text-slate-600 pl-3">base_url: <span className="text-slate-700">platform.deepseek.com/v1</span></div>
                  <div className="pt-1"><span className="text-strain-600">$</span> <span className="text-slate-300">strain chat <span className="text-strain-400">&quot;fix all test failures&quot;</span></span></div>
                  <div className="text-strain-400 pl-3">▸ all 47 tests pass  ·  3 turns  ·  $0.009</div>
                </div>
              </div>

              {/* local config */}
              <div>
                <div className="font-mono text-[10px] text-slate-700 mb-1.5 pl-1">local deepseek via ollama</div>
                <div className="border border-white/8 rounded-lg p-4 font-mono text-xs space-y-1 leading-relaxed"
                     style={{ background: "#000d1a" }}>
                  <div><span className="text-strain-600">$</span> <span className="text-slate-300">ollama pull deepseek-r1:7b</span></div>
                  <div className="text-slate-600 pl-3">✓ deepseek-r1:7b  (4.7 GB)  ready</div>
                  <div className="pt-1"><span className="text-strain-600">$</span> <span className="text-slate-300">deepstrain configure</span></div>
                  <div className="text-slate-600 pl-3">api_key: <span className="text-strain-700">none</span>  <span className="text-slate-700"># no key for local</span></div>
                  <div className="text-slate-600 pl-3">model:   <span className="text-strain-400">deepseek-r1:7b</span></div>
                  <div className="text-slate-600 pl-3">base_url: <span className="text-strain-400">http://localhost:11434/v1</span></div>
                  <div className="pt-1"><span className="text-strain-600">$</span> <span className="text-slate-300">strain chat <span className="text-strain-400">&quot;fix all test failures&quot;</span></span></div>
                  <div className="text-strain-700 pl-3">▸ engine: deepseek-r1:7b (local)  ·  0 external calls</div>
                  <div className="text-strain-400 pl-3">▸ all 47 tests pass  ·  5 turns  ·  $0.000</div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-white/5 font-mono text-xs text-slate-600"
                   style={{ background: "rgba(255,255,255,0.015)" }}>
                <span className="text-white/40">note:</span> local deepseek = same architecture, more turns for same quality.
                cloud deepseek-v3 is faster and more capable for complex tasks.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MCP — WORKS WITH ANY CHAT LLM */}
      <section className="py-24 border-t border-white/5" style={{ background: "#00080f" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs text-strain-700 tracking-widest uppercase">// mcp — your chat LLM</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="font-mono text-xs text-slate-700">use any frontend</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-mono font-black text-white tracking-tight mb-4"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.1 }}>
                talk to Claude.<br />
                <span className="text-white/40">it talks to deepstrain.</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                deepstrain exposes an MCP server. Any LLM that supports MCP tools —
                Claude, GPT-4, a local Ollama model, Continue.dev — can call deepstrain
                and have it execute tasks using DeepSeek internally.
                Your chat interface is your choice. The execution engine is always DeepSeek.
              </p>

              {/* compatible chat frontends */}
              <div className="space-y-2 mb-8">
                {[
                  { name: "Claude Desktop", note: "MCP native — add deepstrain in settings.json" },
                  { name: "Ollama + Open WebUI", note: "local, free chat → deepstrain MCP tools" },
                  { name: "Continue.dev",  note: "IDE plugin → deepstrain as provider" },
                  { name: "GPT-4 / API",   note: "function calling → deepstrain tools" },
                  { name: "direct CLI",    note: "strain chat — standalone, no external LLM" },
                ].map((c) => (
                  <div key={c.name}
                       className="flex items-center gap-3 rounded-lg border border-white/5 px-4 py-2.5 font-mono text-xs"
                       style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="text-slate-300 w-40 flex-shrink-0">{c.name}</span>
                    <span className="text-slate-600">{c.note}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg border border-white/5 font-mono text-xs space-y-1.5 text-slate-600"
                   style={{ background: "rgba(255,255,255,0.015)" }}>
                <div className="text-slate-400 font-bold mb-2">cost breakdown (local chat example)</div>
                <div className="flex justify-between"><span>chat LLM (Ollama)</span><span className="text-white/40">$0.000</span></div>
                <div className="flex justify-between"><span>deepstrain subscription</span><span className="text-strain-400">$9/mo</span></div>
                <div className="flex justify-between"><span>DeepSeek API (local deepseek-r1)</span><span className="text-white/40">$0.000</span></div>
                <div className="border-t border-white/5 mt-2 pt-2 flex justify-between text-slate-300">
                  <span>total / month</span><span className="text-white font-bold">$9 flat</span>
                </div>
              </div>
            </div>

            {/* right: Claude Desktop MCP config */}
            <div className="space-y-4">
              <div>
                <div className="font-mono text-[10px] text-slate-700 mb-1.5 pl-1">Claude Desktop — mcp config</div>
                <div className="border border-white/8 rounded-lg overflow-hidden"
                     style={{ background: "#000d1a" }}>
                  <div className="px-3 py-2 border-b border-white/5 font-mono text-[10px] text-slate-600">
                    ~/Library/Application Support/Claude/claude_desktop_config.json
                  </div>
                  <div className="p-4 font-mono text-xs space-y-0.5">
                    <div className="text-slate-500">{"{"}</div>
                    <div className="pl-4 text-slate-500">{'"mcpServers"'}: {"{"}</div>
                    <div className="pl-8 text-slate-500">{'"deepstrain"'}: {"{"}</div>
                    <div className="pl-12"><span className="text-strain-700">"command"</span><span className="text-white/20">: </span><span className="text-strain-400">"deepstrain"</span><span className="text-white/20">,</span></div>
                    <div className="pl-12"><span className="text-strain-700">"args"</span><span className="text-white/20">: </span><span className="text-strain-400">["mcp"]</span></div>
                    <div className="pl-8 text-slate-500">{"}"}</div>
                    <div className="pl-4 text-slate-500">{"}"}</div>
                    <div className="text-slate-500">{"}"}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-slate-700 mb-1.5 pl-1">result — Claude calls deepstrain</div>
                <div className="border border-white/8 rounded-lg p-4 font-mono text-xs space-y-1 leading-relaxed"
                     style={{ background: "#000d1a" }}>
                  <div className="text-slate-600">[Claude] "run the tests and fix any failures"</div>
                  <div className="text-strain-700 pl-3">→ deepstrain_eval("run pytest, fix failures")</div>
                  <div className="text-strain-600 pl-6">▸ engine: deepseek-v3 · reading codebase...</div>
                  <div className="text-strain-600 pl-6">▸ running pytest — 4 failures found</div>
                  <div className="text-strain-600 pl-6">▸ patching src/auth/session.py</div>
                  <div className="text-strain-400 pl-6">▸ all 47 tests pass  ·  3 turns  ·  $0.009</div>
                  <div className="pt-1 text-slate-500">[Claude] "Done. Fixed 4 test failures — deepstrain</div>
                  <div className="text-slate-500 pl-12">completed in 3 turns (~$0.009 via DeepSeek)."</div>
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-slate-700 mb-1.5 pl-1">start MCP server</div>
                <div className="border border-white/8 rounded-lg p-4 font-mono text-xs space-y-1"
                     style={{ background: "#000d1a" }}>
                  <div><span className="text-strain-600">$</span> <span className="text-slate-300">deepstrain mcp</span></div>
                  <div className="text-strain-700 pl-3">MCP server ready — stdio transport</div>
                  <div className="text-strain-700 pl-3">51 tools registered</div>
                  <div className="text-strain-700 pl-3">engine: deepseek-v3 (platform.deepseek.com)</div>
                  <div className="text-slate-700 pl-3">waiting for tool calls...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-24 border-t border-white/5" style={{ background: "#00080f" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs text-strain-700 tracking-widest uppercase">// pricing</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="max-w-sm">
            <div className="border border-strain-900/60 rounded-lg overflow-hidden" style={{ background: "rgba(6,182,212,0.02)" }}>
              <div className="px-6 py-5 border-b border-white/5">
                <p className="font-mono text-xs text-strain-600 uppercase tracking-widest mb-3">professional</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-lg text-slate-500">{SYM}</span>
                  <span className="font-mono text-5xl font-bold text-white">{PRICE}</span>
                  <span className="font-mono text-sm text-slate-600">/mo</span>
                </div>
                <p className="font-mono text-xs text-slate-700 mt-1">cancel anytime</p>
              </div>
              <div className="px-6 py-5 space-y-2.5">
                {["unlimited agent runs","byok deepseek api","52 tools","offline-capable","cloud activation + revocation","keyring secret storage","gui settings panel"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 font-mono text-xs text-slate-400">
                    <Zap className="w-3 h-3 text-strain-600 flex-shrink-0" />{f}
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <Link href="/deepstrain/pricing"
                  className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-black text-sm font-mono font-semibold rounded-md transition-colors">
                  {CTA} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ATLAS CROSS-SELL */}
      <section className="py-16 border-t border-white/5" style={{ background: "#00080f" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="rounded-xl border border-white/8 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
               style={{ background: "rgba(255,255,255,0.015)" }}>
            <div className="flex-1">
              <p className="text-xs font-mono text-strain-700 uppercase tracking-widest mb-2">also from us</p>
              <p className="font-mono font-bold text-white mb-1">
                <span className="text-[hsl(192,91%,47%)]">ATLAS</span>
                <span className="text-slate-500 font-normal text-xs ml-3">deterministic code intelligence</span>
              </p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                Offline AST analysis. No LLM, no API calls, no telemetry. Dependency graphs, security scanning, hotspot detection.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/bundle" className="text-xs font-mono px-4 py-2 rounded border border-[hsl(192,91%,47%)] text-[hsl(192,91%,47%)] hover:bg-[hsl(192,91%,47%)] hover:text-black transition-all whitespace-nowrap">
                bundle — save 20% →
              </Link>
              <Link href="/atlas" className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">atlas →</Link>
            </div>
          </div>
        </div>
      </section>

      <MassironFooter />
    </>
  );
}
