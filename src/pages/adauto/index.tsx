import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight, Terminal, ShieldCheck, BarChart3,
  Zap, GitBranch, Brain, RefreshCw, BookOpen,
  CheckCircle, Film, Globe, Activity,
} from "lucide-react";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";

const ADAUTO_PRICE = process.env.NEXT_PUBLIC_ADAUTO_PRICE || "12";
const SYM          = "$";

/* ── data ─────────────────────────────────────────────────────────────────── */

const metrics = [
  { n: "~$0.00034", l: "per post" },
  { n: "~208",      l: "tokens / GET /" },
  { n: "4",         l: "platforms" },
  { n: "0",         l: "auto-posts ever" },
];

const tools = [
  {
    cmd:   "run",
    icon:  <Zap className="w-4 h-4" />,
    tier:  "free",
    body:  "Reads campaign config, picks the best platform+subreddit+post_type from engagement history, calls deepstrain to write the content. Queues as `pending_approval`. Never posts.",
  },
  {
    cmd:   "status",
    icon:  <Activity className="w-4 h-4" />,
    tier:  "free",
    body:  "Pending count, approved queue, per-platform post history, estimated next-run time per cooldown.",
  },
  {
    cmd:   "approve",
    icon:  <ShieldCheck className="w-4 h-4" />,
    tier:  "free",
    body:  "approve by post_id, by campaign, or `--all`. Content never moves to published without hitting this endpoint. The gate is always on.",
  },
  {
    cmd:   "post",
    icon:  <Globe className="w-4 h-4" />,
    tier:  "pro",
    body:  "Publishes approved items. Platform-native formatting — Reddit markdown, dev.to front matter, Twitter thread splitting. Rate-limited per platform. Supports dry_run.",
  },
  {
    cmd:   "report",
    icon:  <BarChart3 className="w-4 h-4" />,
    tier:  "free",
    body:  "ROI per post: cost in USD, engagement score (upvotes + 3×comments), cost-per-score. Shows which post_type on which platform delivers the lowest cost-per-score.",
  },
  {
    cmd:   "demo",
    icon:  <Film className="w-4 h-4" />,
    tier:  "pro",
    body:  "Generates a VHS .tape file for your campaign, renders it to a GIF via Charmbracelet VHS, and queues the result as a visual asset for the next post batch.",
  },
];

const loop = [
  { step: "01", title: "strategy",   col: "text-amber-500",  body: "exploit/explore algorithm picks platform + subreddit + post_type based on prior engagement scores. New install → full explore. After 2 posts → starts exploiting what works." },
  { step: "02", title: "generate",   col: "text-amber-400",  body: "deepstrain /eval writes platform-native content: Reddit prose, dev.to tutorial, Twitter thread. Injects top-performing examples as few-shot context." },
  { step: "03", title: "approve",    col: "text-white",       body: "content lands in pending_approval. You read it, edit it, or skip it. Nothing moves without `adauto approve`. No exceptions, no bypass flags." },
  { step: "04", title: "post",       col: "text-amber-400",  body: "approved items publish with platform credentials you control. Rate-limiting respects platform ToS. Post URLs stored locally for engagement polling." },
  { step: "05", title: "learn",      col: "text-amber-500",  body: "adauto polls platforms for upvotes and comments. Scores each post_type. Next `run` call automatically picks the best-scoring style for the platform." },
];

const platforms = [
  { name: "Reddit",     color: "text-orange-400",  note: "subreddit targeting · flair support · score tracked per subreddit" },
  { name: "dev.to",     color: "text-slate-300",   note: "markdown · front matter · series support · read_time estimate" },
  { name: "Twitter/X",  color: "text-sky-400",     note: "thread splitting · char limit · hashtag injection" },
  { name: "HN (Show)",  color: "text-amber-500",   note: "Show HN: format · no hype words · minimal CTA" },
];

const steps = [
  { n: "01", cmd: "pip install adauto",                      note: "pure python · no compiled deps" },
  { n: "02", cmd: "adauto init && adauto serve",             note: "HTTP :8766 · 6 tools loaded" },
  { n: "03", cmd: "adauto run --campaign my-product",        note: "generate → queue for review" },
  { n: "04", cmd: "adauto review",                           note: "approve / edit / skip interactively" },
  { n: "05", cmd: "adauto post my-product",                  note: "publish approved posts only" },
];

/* ── component ────────────────────────────────────────────────────────────── */
export default function AdautoHome() {
  return (
    <>
      <Head>
        <title>adauto — developer marketing that learns</title>
        <meta name="description"
          content="Local-first developer marketing automation. Generates posts, learns from engagement, requires human approval. $0.00034/post. pip install adauto." />
      </Head>

      <MassironNav activeProduct="adauto" />

      {/* ── HERO ── */}
      <section className="relative pt-14 overflow-hidden" style={{ background: "#010d1a", minHeight: "100vh" }}>
        <div className="absolute inset-0 opacity-[0.02]"
             style={{ backgroundImage: "linear-gradient(rgba(245,158,11,1) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,1) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(245,158,11,0.04), transparent 70%)" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-28">
          <p className="font-mono text-xs text-slate-600 tracking-[0.3em] uppercase mb-6">03 / ecosystem</p>

          <h1 className="font-mono font-black text-white tracking-tight mb-5 leading-[1.0]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            your product ships.
            <br />
            <span className="text-white/35">does anyone know?</span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mb-3 font-mono">
            adauto is a local HTTP server with 6 tools. It generates developer marketing content,
            tracks what gets upvotes, and only posts after you approve it.
          </p>
          <p className="font-mono text-sm text-slate-500 mb-12">
            ~$0.00034/post · runs on your machine · 0 auto-posts ever
          </p>

          <div className="flex flex-wrap gap-3 mb-16">
            <Link href="/adauto/pricing"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-black font-mono font-semibold text-sm rounded-md transition-colors">
              get adauto
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="https://pypi.org/project/adauto/"
               className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 text-slate-300 font-mono text-sm rounded-md transition-colors">
              <Terminal className="w-4 h-4" />
              pip install adauto
            </a>
          </div>

          {/* terminal: live campaign run */}
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 px-3 py-2 rounded-t-lg border border-b-0 border-white/8 font-mono text-xs"
                 style={{ background: "rgba(255,255,255,0.025)" }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-700" />
                <span className="w-2 h-2 rounded-full bg-yellow-700" />
                <span className="w-2 h-2 rounded-full bg-green-700" />
              </span>
              <span className="text-slate-600 ml-2">adauto — campaign run</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                <span className="text-amber-600">live</span>
              </span>
            </div>
            <div className="border border-white/8 rounded-b-lg p-5 font-mono text-xs space-y-1.5 leading-relaxed"
                 style={{ background: "#000d1a" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/demos/adauto.gif" alt="adauto demo"
                   className="w-full block mb-3" style={{ minHeight: "140px" }}
                   onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div><span className="text-amber-600">$</span> <span className="text-slate-300">adauto run --campaign deepstrain-launch</span></div>
              <div className="text-amber-900 pl-3">strategy: exploit reddit/r/MachineLearning (score 14.2, 3 posts)</div>
              <div className="text-amber-900 pl-3">  explore: dev.to long-form (untried)</div>
              <div className="text-amber-800 pl-3">calling deepstrain /eval (2 posts)...</div>
              <div className="text-amber-700 pl-3">  ✓ reddit  (412 tokens · $0.00014) → pending_approval</div>
              <div className="text-amber-700 pl-3">  ✓ dev.to  (890 tokens · $0.00030) → pending_approval</div>
              <div className="pt-1"><span className="text-amber-600">$</span> <span className="text-slate-300">adauto review</span></div>
              <div className="text-slate-500 pl-3">reddit post — [a]pprove [s]kip [e]dit [v]iew full</div>
              <div className="text-slate-500 pl-3">&gt; <span className="text-amber-400">a</span>   ✓ approved</div>
              <div className="text-slate-500 pl-3">dev.to post — [a]pprove [s]kip [e]dit [v]iew full</div>
              <div className="text-slate-500 pl-3">&gt; <span className="text-amber-400">e</span>   [edit mode]  → approved</div>
              <div className="pt-1"><span className="text-amber-600">$</span> <span className="text-slate-300">adauto post deepstrain-launch</span></div>
              <div style={{ color: "hsl(30,91%,55%)" }} className="pl-3">  ✓ posted reddit · ✓ posted dev.to · total: $0.00044</div>
              <div className="flex items-center gap-1 pl-3 text-slate-800 pt-1">
                <span className="animate-pulse">█</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ── */}
      <div className="border-y border-white/5" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
            {metrics.map((m) => (
              <div key={m.l} className="py-5 px-6 text-center">
                <div className="font-mono text-xl font-black text-white mb-0.5">{m.n}</div>
                <div className="font-mono text-xs text-slate-600">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── THE LOOP ── */}
      <section className="py-24 border-t border-white/5" style={{ background: "#00080f" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "hsl(30,91%,30%)" }}>// the flywheel</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="font-mono text-xs text-slate-700">gets smarter with every post</span>
          </div>

          <div className="grid md:grid-cols-5 gap-2">
            {loop.map((l, i) => (
              <div key={l.step}
                   className="relative rounded-lg border border-white/5 p-5"
                   style={{ background: "rgba(255,255,255,0.02)" }}>
                {i < loop.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-6 w-5 h-5 text-white/10 hidden md:block z-10" />
                )}
                <div className="font-mono text-[10px] text-slate-700 mb-3">{l.step}</div>
                <div className={`font-mono text-sm font-extrabold mb-2 ${l.col}`}>{l.title}</div>
                <p className="font-mono text-xs text-slate-600 leading-relaxed">{l.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-lg border border-white/5 font-mono text-xs text-slate-600"
               style={{ background: "rgba(245,158,11,0.03)" }}>
            <span style={{ color: "hsl(30,91%,40%)" }}>exploit/explore:</span>{" "}
            with 0-1 historical posts → explores all post_types. With ≥2 → exploits the best-scoring type for that platform+subreddit pair. Score = upvotes + 3×comments. You can override at any time with{" "}
            <code className="text-slate-400">--post-type</code>.
          </div>
        </div>
      </section>

      {/* ── THE APPROVAL GATE ── */}
      <section className="py-24 border-t border-white/5" style={{ background: "#010d1a" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-baseline gap-3 mb-10">
                <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "hsl(30,91%,30%)" }}>// approval gate</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <h2 className="font-mono font-black text-white tracking-tight mb-4"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", lineHeight: 1.1 }}>
                every post touches
                <br /><span className="text-white/40">your eyes first.</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                The approval gate is not a setting. It's architecture. There is no flag,
                no config option, and no API call that bypasses it.
                Generated content goes to <code className="text-amber-600 text-xs">pending_approval</code>.
                It stays there until you say otherwise.
              </p>
              <div className="space-y-3 font-mono text-xs">
                {[
                  ["[a]pprove", "moves to approved queue, will publish on next `post` call"],
                  ["[s]kip",    "removes from queue, learning data not affected"],
                  ["[e]dit",    "opens inline editor → edit title + body → auto-approves"],
                  ["[v]iew",    "renders full post before deciding"],
                  ["[q]uit",    "pauses review, picks up later — nothing lost"],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-start gap-3">
                    <code className="text-amber-500 w-20 flex-shrink-0">{key}</code>
                    <span className="text-slate-500">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-3 mb-10">
                <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "hsl(30,91%,30%)" }}>// platforms</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="space-y-2 mb-10">
                {platforms.map((p) => (
                  <div key={p.name}
                       className="rounded-lg border border-white/5 px-4 py-3.5"
                       style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-sm font-bold ${p.color}`}>{p.name}</span>
                    </div>
                    <p className="font-mono text-xs text-slate-600">{p.note}</p>
                  </div>
                ))}
              </div>

              {/* campaign config example */}
              <div className="rounded-lg border border-white/5 overflow-hidden"
                   style={{ background: "#000d1a" }}>
                <div className="px-3 py-2 border-b border-white/5 font-mono text-[10px] text-slate-600">
                  ~/.adauto/campaigns/deepstrain.toml
                </div>
                <div className="p-4 font-mono text-xs space-y-0.5 leading-relaxed">
                  <div className="text-amber-900">[campaign]</div>
                  <div><span className="text-slate-500">product</span><span className="text-white/20"> = </span><span className="text-amber-600">"deepstrain"</span></div>
                  <div><span className="text-slate-500">tagline</span><span className="text-white/20"> = </span><span className="text-amber-600">"autonomous AI agent for developers"</span></div>
                  <div><span className="text-slate-500">install_cmd</span><span className="text-white/20"> = </span><span className="text-amber-600">"pip install deepstrain"</span></div>
                  <div className="pt-1 text-amber-900">[[platforms]]</div>
                  <div><span className="text-slate-500">name</span><span className="text-white/20"> = </span><span className="text-amber-600">"reddit"</span></div>
                  <div><span className="text-slate-500">subreddits</span><span className="text-white/20"> = </span><span className="text-slate-400">["MachineLearning", "Python", "LocalLLaMA"]</span></div>
                  <div><span className="text-slate-500">posts_per_day</span><span className="text-white/20"> = </span><span className="text-slate-400">2</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VHS DEMO GENERATION ── */}
      <section className="py-24 border-t border-white/5" style={{ background: "#00080f" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "hsl(30,91%,30%)" }}>// demo generation</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="font-mono text-xs text-slate-700">new · adauto demo</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-mono font-black text-white tracking-tight mb-4"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.1 }}>
                posts with <span className="text-white/40">terminal GIFs</span>
                <br />perform better.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                adauto generates VHS <code className="text-amber-500 text-xs">.tape</code> files
                customised for your campaign, renders them to animated GIFs with{" "}
                <a href="https://github.com/charmbracelet/vhs" className="text-amber-500 hover:text-amber-400 transition-colors" target="_blank" rel="noopener noreferrer">Charmbracelet VHS</a>,
                and queues the GIF as a visual asset for the next post batch.
              </p>
              <div className="space-y-2 mb-8 font-mono text-xs text-slate-600">
                <div><span className="text-white/20">→</span> generates a `.tape` matched to your campaign product</div>
                <div><span className="text-white/20">→</span> shows install → activate → run in terminal</div>
                <div><span className="text-white/20">→</span> renders GIF via `vhs` (if installed) or queues the tape</div>
                <div><span className="text-white/20">→</span> attaches GIF path to next post batch as `visual_asset`</div>
              </div>
              <div className="rounded-lg border border-white/5 overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.02)" }}>
                {[
                  { n: "01", cmd: "adauto demo generate --campaign deepstrain",  note: "writes demos/deepstrain.tape" },
                  { n: "02", cmd: "adauto demo render --campaign deepstrain",    note: "runs vhs → demos/deepstrain.gif" },
                  { n: "03", cmd: "adauto run --campaign deepstrain",            note: "includes gif in post" },
                ].map((s, i, arr) => (
                  <div key={s.n}
                       className={`flex items-center gap-4 px-4 py-3 font-mono text-xs ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
                    <span className="text-amber-900 w-5 text-right flex-shrink-0">{s.n}</span>
                    <code className="text-amber-500 flex-1 truncate">{s.cmd}</code>
                    <span className="text-slate-700 text-right hidden sm:block">{s.note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/5 overflow-hidden"
                 style={{ background: "#000d1a" }}>
              <div className="px-3 py-2 border-b border-white/5 font-mono text-[10px] text-slate-600">
                demos/deepstrain.tape  (auto-generated)
              </div>
              <div className="p-4 font-mono text-xs space-y-0.5 leading-relaxed">
                <div className="text-slate-600">Output deepstrain.gif</div>
                <div className="text-slate-600">Set Shell "bash"</div>
                <div className="text-slate-600">Set FontSize 14</div>
                <div className="text-slate-600">Set Theme "Catppuccin Mocha"</div>
                <div className="text-slate-600">Set Width 900</div>
                <div className="pt-2 text-slate-700"># adauto-generated from campaign config</div>
                <div className="text-amber-700">Type "pip install deepstrain"</div>
                <div className="text-amber-700">Enter</div>
                <div className="text-amber-700">Sleep 3s</div>
                <div className="text-amber-700">Type "deepstrain configure"</div>
                <div className="text-amber-700">Enter</div>
                <div className="text-amber-700">Sleep 1s</div>
                <div className="text-amber-700">Type "strain chat \"fix all test failures\""</div>
                <div className="text-amber-700">Enter</div>
                <div className="text-amber-700">Sleep 6s</div>
                <div className="pt-2 text-slate-700"># tagline injected from campaign.tagline</div>
                <div className="text-amber-900"># autonomous AI agent for developers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE / DEEPSTRAIN DEPENDENCY ── */}
      <section className="py-24 border-t border-white/5" style={{ background: "#010d1a" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "hsl(30,91%,30%)" }}>// how adauto works</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="font-mono text-xs text-slate-700">adauto is not standalone</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-mono font-black text-white tracking-tight mb-4"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.1 }}>
                adauto writes nothing.
                <br /><span className="text-white/40">deepstrain writes everything.</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                adauto is a <strong className="text-white">workflow layer</strong>, not an LLM wrapper.
                For every <code className="text-amber-600 text-xs">adauto run</code>, it builds a structured prompt,
                calls <code className="text-amber-600 text-xs">POST deepstrain:8765/eval</code>,
                and parses the JSON back. deepstrain is the engine.
              </p>
              <div className="space-y-3 font-mono text-xs mb-8">
                <div className="p-3 rounded-lg border border-white/5" style={{ background: "rgba(245,158,11,0.03)" }}>
                  <div className="text-amber-600 mb-2 text-[10px] uppercase tracking-wider">required: deepstrain serve</div>
                  <code className="text-slate-400">
                    deepstrain serve --port 8765  <span className="text-slate-700"># must be running</span><br />
                    adauto serve --ds-url http://localhost:8765
                  </code>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Without deepstrain running, <code className="text-slate-500">adauto generate</code> fails immediately.
                  Use <code className="text-slate-500">adauto service install</code> + <code className="text-slate-500">deepstrain service install</code> to auto-start both on boot.
                </p>
              </div>

              {/* data flow */}
              <div className="space-y-1.5 font-mono text-[11px]">
                {[
                  ["adauto run",         "strategy engine picks platform + post_type"],
                  ["→ /eval (deepstrain)", "builds prompt: campaign + tone + examples"],
                  ["← JSON response",    `{title, body, tags, estimated_chars}`],
                  ["→ pending_approval", "lands in local SQLite, never posts"],
                  ["adauto review",      "you read, edit, skip, or approve"],
                  ["adauto post",        "posts only what you approved"],
                  ["adauto report",      "engagement score → updates strategy"],
                ].map(([step, note]) => (
                  <div key={step as string} className="flex items-start gap-3">
                    <code className={`flex-shrink-0 w-40 ${(step as string).startsWith("→") ? "text-amber-800" : (step as string).startsWith("←") ? "text-slate-600" : "text-amber-500"}`}>
                      {step as string}
                    </code>
                    <span className="text-slate-600">{note as string}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* plan-first eval */}
            <div>
              <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "#000d1a" }}>
                <div className="px-4 py-2.5 border-b border-white/5 font-mono text-[10px] text-slate-600">
                  POST /eval · plan-first for complex queries
                </div>
                <div className="p-5 font-mono text-xs space-y-3 leading-relaxed">
                  <div className="text-slate-600 text-[10px] uppercase tracking-wider">simple query → direct execute</div>
                  <div>
                    <div className="text-amber-500">POST /eval</div>
                    <div className="text-slate-500 pl-3">{`{"prompt": "run campaign deepstrain"}`}</div>
                    <div className="text-slate-600 pl-3">→ calls _tool_run() immediately</div>
                    <div className="text-amber-700 pl-3">{`{"answer": "2 posts queued", "tool_called": "run"}`}</div>
                  </div>

                  <div className="border-t border-white/5 pt-3 text-slate-600 text-[10px] uppercase tracking-wider">
                    complex query → plan → approve → execute
                  </div>
                  <div>
                    <div className="text-amber-500">POST /eval</div>
                    <div className="text-slate-500 pl-3">{`{"prompt": "run all campaigns this week, full cycle"}`}</div>
                    <div className="text-amber-700 pl-3">{`{"status": "plan_ready", "plan_id": "a4f2b1c3"}`}</div>
                    <div className="text-slate-600 pl-3 text-[10px]">plan: 1. run → 2. approve → 3. post → 4. report</div>
                  </div>
                  <div>
                    <div className="text-amber-500">POST /eval  <span className="text-slate-700">(step 2: execute plan)</span></div>
                    <div className="text-slate-500 pl-3">{`{"plan_id":"a4f2b1c3","approved":true}`}</div>
                    <div className="text-amber-700 pl-3">{`{"plan_executed": "a4f2b1c3", "result": {...}}`}</div>
                  </div>

                  <div className="border-t border-white/5 pt-3 text-slate-700 text-[10px]">
                    idle_timeout: 1800s → auto-shutdown · OS service restarts on next request via mDNS
                  </div>
                </div>
              </div>

              {/* mDNS / LAN */}
              <div className="mt-4 p-4 rounded-lg border border-white/5 font-mono text-xs"
                   style={{ background: "rgba(255,255,255,0.015)" }}>
                <div className="text-slate-400 font-semibold mb-2">adauto.local:8766</div>
                <div className="text-slate-600 text-[10px] space-y-1">
                  <div>mDNS broadcast on LAN — any device on the network can reach it</div>
                  <div>GET / → ~208 tokens of self-description → any LLM can drive a full campaign</div>
                  <div className="text-amber-900">deepstrain.local:8765 · atlas-intel.local:8767 · adauto.local:8766</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 TOOLS ── */}
      <section className="py-24 border-t border-white/5" style={{ background: "#010d1a" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-12">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "hsl(30,91%,30%)" }}>// 6 tools</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="font-mono text-xs text-slate-700">POST /exec · GET /</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((t) => (
              <div key={t.cmd}
                   className="rounded-lg border border-white/5 p-5 hover:border-white/10 transition-colors"
                   style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span style={{ color: "hsl(30,91%,40%)" }}>{t.icon}</span>
                    <code className="font-mono text-sm font-bold text-white">{t.cmd}</code>
                  </div>
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                    t.tier === "free"
                      ? "text-slate-500 border-white/10 bg-white/3"
                      : "text-amber-500/80 border-amber-800/50 bg-amber-950/30"
                  }`}>
                    {t.tier}
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-500 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>

          {/* HTTP interface note */}
          <div className="mt-8 p-5 rounded-lg border border-white/5 font-mono text-xs"
               style={{ background: "rgba(255,255,255,0.015)" }}>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-slate-400 font-bold">GET /</span>
              <span className="text-slate-600">→ ~208 tokens of self-description · any LLM can drive a full campaign loop</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-slate-700">
              <div><span className="text-amber-800">POST /exec</span> · <code>{`{"tool":"run","args":{"campaign":"deepstrain"}}`}</code></div>
              <div><span className="text-amber-800">POST /approve</span> · <code>{`{"campaign":"deepstrain"}`}</code></div>
              <div><span className="text-amber-800">POST /eval</span> · natural language fallback for LLM orchestration</div>
              <div><span className="text-amber-800">adauto.local:8766</span> · mDNS broadcast on LAN</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK START ── */}
      <section className="py-20 border-t border-white/5" style={{ background: "#00080f" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-10">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "hsl(30,91%,30%)" }}>// quick start</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="max-w-3xl space-y-2">
            {steps.map((s, i) => (
              <div key={s.n}
                   className="flex items-center gap-4 rounded-lg border border-white/5 px-4 py-3 font-mono text-xs"
                   style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-amber-900 w-5 text-right flex-shrink-0">{s.n}</span>
                <code className="text-amber-400 flex-1">{s.cmd}</code>
                <span className="text-slate-700 hidden sm:block">{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 border-t border-white/5" style={{ background: "#010d1a" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-baseline gap-3 mb-10">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "hsl(30,91%,30%)" }}>// pricing</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            {/* Free */}
            <div className="rounded-xl border border-white/8 p-6"
                 style={{ background: "rgba(255,255,255,0.015)" }}>
              <p className="font-mono text-xs text-slate-600 uppercase tracking-widest mb-3">free</p>
              <div className="font-mono text-4xl font-black text-white mb-1">{SYM}0</div>
              <p className="font-mono text-xs text-slate-600 mb-6">1 campaign · 3 posts/day · run + status + approve</p>
              {[
                "pip install adauto",
                "1 campaign config",
                "Reddit + dev.to + Twitter",
                "approval gate (always)",
                "engagement learning",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 font-mono text-xs text-slate-500 mb-2">
                  <CheckCircle className="w-3 h-3 text-white/20 flex-shrink-0" />
                  {f}
                </div>
              ))}
              <a href="https://pypi.org/project/adauto/"
                 className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-mono text-xs transition-all">
                pip install adauto
              </a>
            </div>

            {/* Pro */}
            <div className="rounded-xl border p-6"
                 style={{ background: "rgba(245,158,11,0.04)", borderColor: "hsl(30,91%,25%)", boxShadow: "0 0 24px rgba(245,158,11,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "hsl(30,91%,35%)" }}>pro</p>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded border"
                      style={{ color: "hsl(30,91%,55%)", borderColor: "hsl(30,91%,25%)", background: "rgba(245,158,11,0.08)" }}>
                  most popular
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono text-sm text-slate-500">{SYM}</span>
                <span className="font-mono text-4xl font-black" style={{ color: "hsl(30,91%,55%)" }}>{ADAUTO_PRICE}</span>
                <span className="font-mono text-xs text-slate-600">/mo</span>
              </div>
              <p className="font-mono text-xs text-slate-600 mb-6">unlimited campaigns · all platforms · VHS demo generation</p>
              {[
                "everything in free",
                "unlimited campaigns",
                "post + report tools",
                "demo (VHS tape generation)",
                "OS service (auto-start)",
                "LAN mDNS broadcast",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 font-mono text-xs text-slate-400 mb-2">
                  <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(30,91%,40%)" }} />
                  {f}
                </div>
              ))}
              <Link href="/adauto/pricing"
                className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-mono text-sm font-semibold transition-all text-black bg-white hover:bg-slate-100">
                get adauto pro <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section className="py-16 border-t border-white/5" style={{ background: "#00080f" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="rounded-2xl border border-white/8 p-8"
               style={{ background: "rgba(255,255,255,0.015)" }}>
            <p className="font-mono text-xs text-slate-600 uppercase tracking-widest mb-5">// ecosystem</p>
            <h3 className="font-mono font-black text-white text-xl mb-3 tracking-tight">
              atlas <span className="text-white/20">maps</span> · deepstrain <span className="text-white/20">ships</span> · adauto <span className="text-white/20">narrates</span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl mb-6">
              Three tools, one loop. atlas tells you what your codebase looks like.
              deepstrain changes it. adauto turns the change into distribution.
              Each tool knows about the others and cross-references them in its output.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/bundle"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-black font-mono font-semibold text-sm rounded-md transition-colors">
                bundle — save 20% <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-mono text-sm rounded-md transition-colors">
                <BookOpen className="w-3.5 h-3.5" />
                all products
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MassironFooter />
    </>
  );
}
