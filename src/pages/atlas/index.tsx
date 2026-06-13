import Link from "next/link";
import { Seo } from "../../components/Seo";
import {
  Terminal, Cpu, Lock, BarChart2, Shield, Map,
  Radio, Brain, Users, RotateCcw, GitBranch, Zap,
  ArrowRight, CheckCircle, Package, Search, Activity,
} from "lucide-react";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";

const ATLAS_PRICE = process.env.NEXT_PUBLIC_ATLAS_PRICE || "19";
const SYM         = "$";

// ── Module definitions ────────────────────────────────────────────────────────
const MODULES = [
  { id: "core",                   icon: <Package className="w-4 h-4" />,  name: "Core Engine",              desc: "AST parser (libcst), graph builder (rustworkx), HTML reporter. Included in all tiers.", tier: "free",       col: "text-slate-400"  },
  { id: "system_map",             icon: <Map className="w-4 h-4" />,      name: "System Map",               desc: "Dependency graph. Import chains, circular deps, module clusters.", tier: "solo",       col: "text-cyan-400"   },
  { id: "risk_radar",             icon: <BarChart2 className="w-4 h-4" />,name: "Risk Radar",               desc: "Hotspot detection. Cyclomatic complexity, churn rate, change coupling.", tier: "solo",       col: "text-orange-400" },
  { id: "security_shield",        icon: <Shield className="w-4 h-4" />,   name: "Security Shield",          desc: "Static security analysis. SQLi, XSS, secret exposure, unsafe patterns.", tier: "solo",       col: "text-red-400"    },
  { id: "code_health",            icon: <Cpu className="w-4 h-4" />,      name: "Code Health",              desc: "Maintainability index, dead code detection, duplication ratio.", tier: "solo",       col: "text-green-400"  },
  { id: "signal_map",             icon: <Radio className="w-4 h-4" />,    name: "Signal Map",               desc: "Cross-module signal propagation. Which changes affect which components.", tier: "pro",        col: "text-purple-400" },
  { id: "decision_center",        icon: <Brain className="w-4 h-4" />,    name: "Decision Center",          desc: "Rule-based architectural decisions. Policy enforcement, guardrails.", tier: "pro",        col: "text-indigo-400" },
  { id: "ownership_map",          icon: <Users className="w-4 h-4" />,    name: "Ownership Map",            desc: "Bus factor analysis, knowledge silos, git blame aggregation.", tier: "pro",        col: "text-yellow-400" },
  { id: "rewind",                 icon: <RotateCcw className="w-4 h-4" />,name: "Rewind",                   desc: "Snapshot diffing. Compare any two scan results, track regression.", tier: "enterprise", col: "text-teal-400"   },
  { id: "what_if",                icon: <Zap className="w-4 h-4" />,      name: "What-If",                  desc: "Impact simulation. Predict risk before you refactor or delete.", tier: "enterprise", col: "text-pink-400"   },
  { id: "commit_guard",           icon: <GitBranch className="w-4 h-4" />,name: "Commit Guard",             desc: "Pre-commit gate. Block commits that violate health or security thresholds.", tier: "enterprise", col: "text-amber-400"  },
  { id: "architecture_intelligence", icon: <Activity className="w-4 h-4" />, name: "Architecture Intelligence", desc: "Layer violations, coupling analysis, architectural anti-patterns.", tier: "enterprise", col: "text-rose-400" },
];

const TIER_LABELS: Record<string, string> = {
  free: "FREE", solo: "SOLO", pro: "PRO", enterprise: "ENT",
};
const TIER_COLORS: Record<string, string> = {
  free: "text-slate-500 border-slate-700",
  solo: "text-cyan-400 border-cyan-800",
  pro:  "text-purple-400 border-purple-800",
  enterprise: "text-amber-400 border-amber-800",
};

const steps = [
  { n: "01", cmd: "pip install code-atlas-py",                          note: "offline · LLM-free · 0 API calls" },
  { n: "02", cmd: "atlas activate-file ~/Downloads/atlas_license.json", note: "license file from purchase email"  },
  { n: "03", cmd: "atlas scan .",                                       note: "→ atlas_report.html in seconds"    },
];

const mcpTools = [
  { name: "scan_project",       desc: "Full scan + graph build on demand" },
  { name: "top_risks",          desc: "Highest risk_score nodes in the graph" },
  { name: "detect_violations",  desc: "Security issues, arch violations, dead code" },
  { name: "simulate_change",    desc: "Blast radius: what breaks if X changes?" },
  { name: "pack_context",       desc: "AI-ready context pack for a query/issue" },
  { name: "trace_calls",        desc: "Call chain from root to leaf" },
  { name: "dead_code",          desc: "Unreachable functions and orphan classes" },
  { name: "security_issues",    desc: "Bandit + custom pattern matches" },
  { name: "graph_summary",      desc: "Node count, edge count, health score" },
  { name: "node_info",          desc: "Full signals for a single symbol" },
  { name: "module_output",      desc: "Raw output of any loaded module" },
];

// ── Graph nodes/edges for SVG visualization ───────────────────────────────────
type GNode = { id: string; label: string; x: number; y: number; risk: number; kind: "file"|"fn"|"cls" };
type GEdge = { from: string; to: string };

const GNODES: GNode[] = [
  { id: "api",        label: "api.routes",          x: 240, y: 40,  risk: 28,  kind: "file" },
  { id: "auth",       label: "auth.validate_token", x: 80,  y: 130, risk: 61,  kind: "fn"   },
  { id: "order",      label: "order.create_order",  x: 400, y: 130, risk: 43,  kind: "fn"   },
  { id: "payment",    label: "payment.charge_card", x: 540, y: 240, risk: 87,  kind: "fn"   },
  { id: "db",         label: "db.get_user",         x: 80,  y: 260, risk: 19,  kind: "fn"   },
  { id: "cache",      label: "cache.lookup",        x: 220, y: 340, risk: 12,  kind: "fn"   },
  { id: "stripe",     label: "stripe.charge",       x: 540, y: 370, risk: 82,  kind: "fn"   },
  { id: "discount",   label: "discount.apply",      x: 390, y: 260, risk: 24,  kind: "fn"   },
];

const GEDGES: GEdge[] = [
  { from: "api",     to: "auth"     },
  { from: "api",     to: "order"    },
  { from: "auth",    to: "db"       },
  { from: "db",      to: "cache"    },
  { from: "order",   to: "payment"  },
  { from: "order",   to: "discount" },
  { from: "payment", to: "stripe"   },
];

function riskColor(r: number) {
  if (r >= 70) return "#ef4444";
  if (r >= 40) return "#f97316";
  return "#22d3ee";
}
function riskRing(r: number) {
  if (r >= 70) return "rgba(239,68,68,0.18)";
  if (r >= 40) return "rgba(249,115,22,0.12)";
  return "transparent";
}

function CodeGraph() {
  const W = 640, H = 430;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 430 }}>
      {/* edges */}
      {GEDGES.map((e) => {
        const from = GNODES.find((n) => n.id === e.from)!;
        const to   = GNODES.find((n) => n.id === e.to)!;
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.sqrt(dx*dx+dy*dy);
        const r   = 18;
        const sx  = from.x + (dx/len)*r, sy = from.y + (dy/len)*r;
        const tx  = to.x   - (dx/len)*r, ty = to.y   - (dy/len)*r;
        return (
          <g key={`${e.from}-${e.to}`}>
            <line x1={sx} y1={sy} x2={tx} y2={ty} stroke="rgba(255,255,255,0.08)" strokeWidth="1" markerEnd="url(#arr)" />
          </g>
        );
      })}
      {/* arrowhead marker */}
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.2)" />
        </marker>
      </defs>
      {/* nodes */}
      {GNODES.map((n) => (
        <g key={n.id} transform={`translate(${n.x},${n.y})`}>
          {/* risk halo */}
          <circle r={28} fill={riskRing(n.risk)} />
          {/* node circle */}
          <circle r={18} fill="rgba(255,255,255,0.04)" stroke={riskColor(n.risk)} strokeWidth={n.risk >= 70 ? 1.5 : 1} />
          {/* risk score badge */}
          {n.risk >= 40 && (
            <text x={13} y={-13} fontSize="8" fill={riskColor(n.risk)} fontFamily="monospace" fontWeight="bold">
              {n.risk}
            </text>
          )}
          {/* label */}
          <text y={32} fontSize="9" fill="rgba(255,255,255,0.45)" fontFamily="monospace" textAnchor="middle">
            {n.label.split(".")[0]}
          </text>
          <text y={42} fontSize="8" fill="rgba(255,255,255,0.25)" fontFamily="monospace" textAnchor="middle">
            .{n.label.split(".")[1]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function AtlasHome() {
  return (
    <>
      <Seo
        title="atlas — deterministic code intelligence"
        description="Offline code analysis. No LLM, no guesses. atlas scan . → HTML report, dependency graph, risk map and security scan in seconds. Same code, same answer, forever."
        path="/atlas"
      />

      <div className="min-h-screen font-mono" style={{ background: "#010d1a", color: "#e2e8f0" }}>

        <MassironNav activeProduct="atlas" />

        {/* ── HERO ── */}
        <section className="relative pt-14 overflow-hidden" style={{ minHeight: "100vh" }}>
          {/* grid bg */}
          <div className="absolute inset-0 opacity-[0.018]"
               style={{ backgroundImage: "linear-gradient(rgba(34,211,238,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,1) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] rounded-full pointer-events-none"
               style={{ background: "radial-gradient(circle, rgba(34,211,238,0.04), transparent 70%)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-5 py-28">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* left */}
              <div>
                <p className="text-xs text-slate-600 tracking-[0.3em] uppercase mb-6">01 / ecosystem · code intelligence</p>
                <h1 className="font-black text-white tracking-tight mb-5 leading-[1.0]"
                    style={{ fontSize: "clamp(2.4rem, 5vw, 4.5rem)" }}>
                  your codebase,<br />
                  <span className="text-cyan-400">mapped.</span>
                </h1>
                <p className="text-slate-300 text-lg leading-relaxed max-w-lg mb-3">
                  atlas scans your Python project and builds a call graph, dependency tree,
                  and risk map — deterministically. No LLM, no API calls, no telemetry.
                </p>
                <p className="text-sm text-slate-500 mb-12">
                  28s · 221 files · 1563 symbols · offline forever
                </p>

                <div className="flex flex-wrap gap-3 mb-12">
                  <Link href="/atlas/pricing"
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-black font-semibold text-sm rounded-md transition-colors">
                    get atlas
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/atlas/demo"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-cyan-400/30 hover:border-cyan-400/60 text-cyan-400 text-sm rounded-md transition-colors">
                    <Activity className="w-4 h-4" />
                    live report demo
                  </Link>
                  <a href="https://pypi.org/project/code-atlas-py/"
                     className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 text-slate-300 text-sm rounded-md transition-colors">
                    <Terminal className="w-4 h-4" />
                    pip install code-atlas-py
                  </a>
                </div>

                {/* pillars */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    [<Lock className="w-3.5 h-3.5" key="l" />,    "100% offline",    "no API calls, no telemetry"],
                    [<Cpu className="w-3.5 h-3.5" key="c" />,     "LLM-free",        "same input → same output, always"],
                    [<Package className="w-3.5 h-3.5" key="p" />, "pip installable", "windows · linux · macos"],
                    [<Terminal className="w-3.5 h-3.5" key="t" />, "HTML report",    "one self-contained .html file"],
                  ].map(([icon, title, body]) => (
                    <div key={title as string} className="rounded-lg border border-white/5 p-3.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        {icon}
                        <span className="text-xs font-semibold text-white">{title as string}</span>
                      </div>
                      <p className="text-xs text-slate-600">{body as string}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* right: graph visualization */}
              <div>
                <div className="rounded-xl border border-white/8 overflow-hidden"
                     style={{ background: "#000d1a" }}>
                  <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-900" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-900" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-700" />
                      </div>
                      <span className="text-[10px] text-slate-600">call graph · risk overlay · 8 nodes shown</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-700">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#ef4444", opacity: 0.7 }} /> risk ≥ 70
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#f97316", opacity: 0.7 }} /> risk ≥ 40
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#22d3ee", opacity: 0.7 }} /> ok
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <CodeGraph />
                  </div>
                  <div className="border-t border-white/5 px-4 py-2.5 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs font-black text-white">71.4<span className="text-slate-600 font-normal">/100</span></div>
                      <div className="text-[10px] text-slate-600">health</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-red-400">2</div>
                      <div className="text-[10px] text-slate-600">critical hotspots</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-orange-400">3</div>
                      <div className="text-[10px] text-slate-600">security issues</div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-700 mt-2 text-center">
                  live from <code className="text-slate-600">atlas scan .</code> · nodes colored by risk_score · edges from call graph
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── METRICS STRIP ── */}
        <div className="border-y border-white/5" style={{ background: "rgba(255,255,255,0.01)" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
              {[
                { n: "0",    l: "API calls"          },
                { n: "28s",  l: "221-file scan"      },
                { n: "12+",  l: "analysis modules"   },
                { n: "100%", l: "offline"            },
              ].map((m) => (
                <div key={m.l} className="py-5 px-6 text-center">
                  <div className="text-xl font-black text-white mb-0.5">{m.n}</div>
                  <div className="text-xs text-slate-600">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── WHAT YOU GET ── */}
        <section className="py-24 border-t border-white/5" style={{ background: "#00080f" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="text-xs tracking-widest uppercase text-cyan-900">// the report</span>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-slate-700">atlas_report.html — one file, no internet</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* graph panel */}
              <div className="lg:col-span-2 rounded-xl border border-white/8 overflow-hidden" style={{ background: "#000d1a" }}>
                <div className="px-4 py-2.5 border-b border-white/5 text-[10px] text-slate-600">
                  system_map · call_graph.svg — dependency topology
                </div>
                {/* bigger graph */}
                <div className="p-6">
                  {/* module dependency mockup */}
                  <div className="space-y-2 font-mono text-xs">
                    {[
                      { from: "api.routes", to: ["auth.middleware", "order.handler", "payment.service"], depth: 0 },
                      { from: "auth.middleware", to: ["db.users", "cache.sessions"], depth: 1 },
                      { from: "order.handler", to: ["payment.service", "inventory.check"], depth: 1 },
                      { from: "payment.service", to: ["stripe.client"], depth: 1, risk: true },
                      { from: "stripe.client", to: [], depth: 2, critical: true },
                    ].map((row) => (
                      <div key={row.from} className="flex items-center gap-2" style={{ paddingLeft: row.depth * 20 }}>
                        <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${row.critical ? "bg-red-500" : row.risk ? "bg-orange-500" : "bg-cyan-400"}`} />
                        <span className={`${row.critical ? "text-red-400" : row.risk ? "text-orange-400" : "text-slate-300"}`}>
                          {row.from}
                        </span>
                        {row.critical && <span className="text-red-600 text-[10px]">⚠ risk: 87 · 3 callers</span>}
                        {row.risk && !row.critical && <span className="text-orange-700 text-[10px]">risk: 43</span>}
                        {row.to.length > 0 && (
                          <span className="text-white/15">
                            → {row.to.join(", ")}
                          </span>
                        )}
                      </div>
                    ))}
                    <div className="pt-3 border-t border-white/5 text-slate-700 text-[10px]">
                      1563 nodes · 4712 edges · 2 circular dependency chains detected
                    </div>
                  </div>
                </div>
              </div>

              {/* insights panel */}
              <div className="space-y-3">
                <div className="rounded-xl border border-red-900/30 p-4" style={{ background: "rgba(239,68,68,0.04)" }}>
                  <div className="text-[10px] text-red-600 uppercase tracking-widest mb-2">// critical</div>
                  <div className="space-y-2">
                    {[
                      { sym: "stripe.charge",      note: "risk: 87 · hardcoded secret path" },
                      { sym: "payment.charge_card", note: "risk: 82 · no rate limit · 41 callers" },
                    ].map((i) => (
                      <div key={i.sym} className="text-xs">
                        <div className="text-red-400 font-semibold">{i.sym}</div>
                        <div className="text-slate-600 text-[10px]">{i.note}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-orange-900/30 p-4" style={{ background: "rgba(249,115,22,0.04)" }}>
                  <div className="text-[10px] text-orange-600 uppercase tracking-widest mb-2">// high</div>
                  <div className="space-y-2">
                    {[
                      { sym: "auth.validate_token", note: "risk: 61 · cyclomatic: 14" },
                      { sym: "order.create_order",  note: "risk: 43 · 6 downstream deps" },
                    ].map((i) => (
                      <div key={i.sym} className="text-xs">
                        <div className="text-orange-400 font-semibold">{i.sym}</div>
                        <div className="text-slate-600 text-[10px]">{i.note}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">// health</div>
                  <div className="text-3xl font-black text-white mb-1">71.4<span className="text-slate-700 text-sm font-normal">/100</span></div>
                  <div className="text-[10px] text-slate-700">Fair — 3 modules need attention</div>
                  <div className="mt-3 space-y-1.5">
                    {[
                      { label: "complexity", pct: 68, col: "#f97316" },
                      { label: "duplication", pct: 23, col: "#22d3ee" },
                      { label: "dead code",  pct: 11, col: "#22d3ee" },
                    ].map((b) => (
                      <div key={b.label} className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-600 w-20">{b.label}</span>
                        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.col, opacity: 0.7 }} />
                        </div>
                        <span className="text-slate-700 w-6 text-right">{b.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ATLAS ASK ── */}
        <section className="py-24 border-t border-white/5" style={{ background: "#010d1a" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="text-xs tracking-widest uppercase text-cyan-900">// atlas ask</span>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-slate-700">natural language · deterministic · 0 tokens</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-black text-white tracking-tight mb-4"
                    style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", lineHeight: 1.1 }}>
                  query your codebase<br />
                  <span className="text-white/35">without spending a token.</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  <code className="text-cyan-400 text-xs">atlas ask</code> runs a deterministic NLP engine against your code graph.
                  Intent detection, entity extraction, BFS traversal — no LLM, no API key, instant.
                </p>
                <div className="space-y-2 text-xs text-slate-600">
                  {[
                    ["atlas ask \"describe the project\"",             "overview: architecture summary + top-level modules"],
                    ["atlas ask \"why is validate_token risky?\"",     "risk: complexity score + upstream callers + security flags"],
                    ["atlas ask \"what breaks if PaymentService changes?\"", "impact: BFS downstream — N connected symbols"],
                    ["atlas ask \"dead code in auth module\"",         "orphan: unreachable functions with no callers"],
                  ].map(([cmd, result]) => (
                    <div key={cmd as string} className="flex gap-3">
                      <code className="text-cyan-600 flex-shrink-0 w-64 truncate text-[10px]">{cmd as string}</code>
                      <span className="text-slate-700 text-[10px]">→ {result as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* terminal mockup */}
              <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "#000d1a" }}>
                <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-900" />
                    <span className="w-2 h-2 rounded-full bg-yellow-900" />
                    <span className="w-2 h-2 rounded-full bg-green-700" />
                  </div>
                  <span className="text-[10px] text-slate-600 ml-2">atlas ask "why is validate_token risky?"</span>
                </div>
                <div className="p-5 text-xs space-y-2 leading-relaxed">
                  <div><span className="text-cyan-400">$</span> <span className="text-slate-300">atlas ask "why is validate_token risky?"</span></div>
                  <div className="pt-1 border-l-2 border-cyan-900 pl-3 space-y-1.5 text-slate-400">
                    <div className="text-cyan-400 text-[10px] font-semibold">ATLAS Intelligence — RISK</div>
                    <div><span className="text-white">auth.validate_token</span> <span className="text-slate-600">(auth/middleware.py:47)</span></div>
                    <div className="text-slate-500">Risk score: <span className="text-orange-400">61/100</span></div>
                    <div className="text-slate-500">Cyclomatic complexity: <span className="text-orange-400">14</span> (threshold: 10)</div>
                    <div className="text-slate-500">Centrality: <span className="text-white">0.847</span> — high blast radius</div>
                    <div className="pt-1 text-slate-600 text-[10px]">Callers (14 upstream):</div>
                    <div className="text-slate-600 text-[10px] pl-2">· api.routes.get_user (routes.py:23)</div>
                    <div className="text-slate-600 text-[10px] pl-2">· api.routes.create_order (routes.py:58)</div>
                    <div className="text-slate-600 text-[10px] pl-2">· ... 12 more</div>
                    <div className="pt-1 text-slate-600 text-[10px]">Security flags:</div>
                    <div className="text-red-600 text-[10px] pl-2">· hardcoded JWT_SECRET fallback detected</div>
                    <div className="text-red-600 text-[10px] pl-2">· bare except clause swallows token errors</div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-800 pt-1">
                    <span className="animate-pulse">█</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MODULES ── */}
        <section className="py-24 border-t border-white/5" style={{ background: "#00080f" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="text-xs tracking-widest uppercase text-cyan-900">// modules</span>
              <div className="flex-1 h-px bg-white/5" />
              <Link href="/atlas/pricing" className="text-xs text-slate-700 hover:text-slate-500 transition-colors">
                see tiers →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODULES.map((m) => (
                <div key={m.id}
                     className="rounded-lg border border-white/5 p-4 hover:border-white/10 transition-colors"
                     style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`flex items-center gap-2 ${m.col}`}>
                      {m.icon}
                      <span className="text-sm font-semibold text-white">{m.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TIER_COLORS[m.tier]}`}>
                      {TIER_LABELS[m.tier]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MCP ── */}
        <section className="py-24 border-t border-white/5" style={{ background: "#010d1a" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="text-xs tracking-widest uppercase text-cyan-900">// atlas mcp</span>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-slate-700">stdio + HTTP · 11 tools · Claude Code · Cursor · CI</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-black text-white tracking-tight mb-4"
                    style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.1 }}>
                  every module<br />
                  <span className="text-white/35">machine-consumable.</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  <code className="text-cyan-400 text-xs">atlas mcp --project .</code> starts a stdio MCP server.
                  Every analysis module becomes a callable tool for Claude Code, Cursor, or any MCP host.
                  Nothing is UI-only.
                </p>
                <div className="space-y-2 mb-8">
                  {[
                    { label: "Claude Code / Cursor (stdio)", cmd: "atlas mcp --project ." },
                    { label: "HTTP (multi-device, CI)",      cmd: "atlas mcp --project . --transport http --pre-scan" },
                    { label: "claude_desktop_config.json",   cmd: `{"command":"atlas","args":["mcp","--project","."]}` },
                  ].map((row) => (
                    <div key={row.label} className="rounded-lg border border-white/5 px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="text-[10px] text-slate-600 mb-1">{row.label}</div>
                      <code className="text-cyan-400 text-xs">{row.cmd}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* tools grid */}
              <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "#000d1a" }}>
                <div className="px-4 py-2.5 border-b border-white/5 text-[10px] text-slate-600">
                  11 MCP tools exposed · atlas mcp --project .
                </div>
                <div className="p-4 grid grid-cols-1 gap-1">
                  {mcpTools.map((t) => (
                    <div key={t.name} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                      <code className="text-cyan-400 text-[11px] w-40 flex-shrink-0">{t.name}</code>
                      <span className="text-slate-600 text-[10px]">{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* atlas → deepstrain bridge */}
            <div className="mt-8 rounded-xl border border-white/5 p-6" style={{ background: "rgba(255,255,255,0.015)" }}>
              <div className="flex items-baseline gap-2 mb-3">
                <Search className="w-3.5 h-3.5 text-cyan-600" />
                <span className="text-xs font-semibold text-white">atlas surgeon → deepstrain</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-2xl mb-4">
                <code className="text-cyan-400">atlas surgeon validate_token</code> generates a surgical refactor prompt
                from the live call graph — callers, callees, risk scores, existing patterns.
                Send that prompt to <code className="text-white/50">deepstrain eval</code> and it executes the change with full tool access.
              </p>
              <div className="font-mono text-xs text-slate-700">
                atlas scan → graph → <span className="text-cyan-600">atlas surgeon</span> → surgical prompt → <span className="text-white/40">deepstrain eval</span> → code change
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK START ── */}
        <section className="py-20 border-t border-white/5" style={{ background: "#00080f" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="text-xs tracking-widest uppercase text-cyan-900">// quick start</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="max-w-3xl space-y-2">
              {steps.map((s) => (
                <div key={s.n}
                     className="flex items-center gap-4 rounded-lg border border-white/5 px-4 py-3 text-xs"
                     style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-cyan-900 w-5 text-right flex-shrink-0">{s.n}</span>
                  <code className="text-cyan-400 flex-1">{s.cmd}</code>
                  <span className="text-slate-700 hidden sm:block">{s.note}</span>
                </div>
              ))}
              <div className="pt-4 px-4 text-[10px] text-slate-700">
                also: <code className="text-slate-600">atlas ask "describe the project"</code> · <code className="text-slate-600">atlas context "auth bug"</code> · <code className="text-slate-600">atlas mcp --project .</code>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING CARD ── */}
        <section className="py-20 border-t border-white/5" style={{ background: "#010d1a" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="text-xs tracking-widest uppercase text-cyan-900">// pricing</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
              {[
                { tier: "Solo",       price: "19",  note: "indie dev",   features: ["core + system_map + risk_radar","security_shield + code_health","atlas ask + atlas context","MCP server (stdio + HTTP)"] },
                { tier: "Pro",        price: "39",  note: "team of 5",   features: ["everything in Solo","signal_map + decision_center","ownership_map + what_if","atlas export (portable ZIP)"], highlight: true },
                { tier: "Enterprise", price: "99",  note: "org-wide",    features: ["everything in Pro","architecture_intelligence","commit_guard + rewind","unspaghetti (refactor assistant)"] },
              ].map((p) => (
                <div key={p.tier} className={`rounded-xl border p-5 ${p.highlight ? "border-cyan-800/60" : "border-white/8"}`}
                     style={{ background: p.highlight ? "rgba(34,211,238,0.04)" : "rgba(255,255,255,0.015)" }}>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">{p.tier}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xs text-slate-500">{SYM}</span>
                    <span className={`text-3xl font-black ${p.highlight ? "text-cyan-400" : "text-white"}`}>{p.price}</span>
                    <span className="text-xs text-slate-600">/mo</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mb-4">{p.note}</p>
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-xs text-slate-400 mb-1.5">
                      <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-cyan-800" />
                      {f}
                    </div>
                  ))}
                  <Link href="/atlas/pricing"
                    className={`mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${p.highlight ? "bg-white text-black hover:bg-slate-100" : "border border-white/10 hover:border-white/20 text-slate-400 hover:text-white"}`}>
                    get {p.tier.toLowerCase()} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ECOSYSTEM ── */}
        <section className="py-16 border-t border-white/5" style={{ background: "#00080f" }}>
          <div className="max-w-7xl mx-auto px-5">
            <div className="rounded-2xl border border-white/8 p-8" style={{ background: "rgba(255,255,255,0.015)" }}>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-4">// ecosystem</p>
              <h3 className="font-black text-white text-xl mb-3 tracking-tight">
                atlas <span className="text-white/20">maps</span> · deepstrain <span className="text-white/20">ships</span> · adauto <span className="text-white/20">narrates</span>
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl mb-6">
                atlas tells you what your codebase looks like — deterministically, offline, with no tokens.
                deepstrain changes it. adauto turns the change into distribution.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/bundle"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-black font-semibold text-sm rounded-md transition-colors">
                  bundle — save 20% <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-sm rounded-md transition-colors">
                  all products
                </Link>
              </div>
            </div>
          </div>
        </section>

        <MassironFooter />

      </div>
    </>
  );
}
