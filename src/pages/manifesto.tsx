import Head from "next/head";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MassironNav } from "../components/MassironNav";
import { MassironFooter } from "../components/MassironFooter";

export default function Manifesto() {
  return (
    <>
      <Head>
        <title>massiron manifesto — the model is rented. the intelligence is forged.</title>
        <meta name="description"
          content="massiron builds the intelligence into the tools — deterministic, offline-capable, local-first. Any brain, any budget. The result doesn't change." />
      </Head>

      <MassironNav />

      <main className="min-h-screen pt-14" style={{ background: "#010d1a" }}>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-28">
          {/* grid bg */}
          <div className="absolute inset-0 opacity-[0.02]"
               style={{ backgroundImage: "linear-gradient(rgba(34,211,238,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,1) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
          {/* glows */}
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
               style={{ background: "radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)" }} />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
               style={{ background: "radial-gradient(circle, rgba(34,211,238,0.04), transparent 70%)" }} />

          <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
            <p className="font-mono text-xs text-slate-600 tracking-[0.3em] uppercase mb-8">
              massiron · manifesto
            </p>
            <h1 className="font-mono font-black tracking-tighter leading-[1.05] text-white mb-6"
                style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
              the model is rented.<br />
              <span className="massiron-gradient-text">the intelligence is forged.</span>
            </h1>
            <p className="text-slate-400 font-mono text-sm leading-relaxed max-w-xl mx-auto">
              This is the belief that produced deepstrain, atlas, and adauto.
              Not a mission statement. A design constraint.
            </p>
          </div>
        </section>

        {/* ── The core argument ── */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-2xl mx-auto px-5 space-y-16 font-mono">

            <div>
              <p className="text-xs text-slate-600 tracking-[0.25em] uppercase mb-5">§1 — the trap</p>
              <h2 className="text-xl font-bold text-white mb-5 leading-snug">
                You are renting the intelligence you depend on.
              </h2>
              <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>
                  Every time you call a cloud model, you are not owning an outcome.
                  You are renting a probability. The model might be deprecated next quarter.
                  The price might double. The context window might fill up.
                  The session might end in five hours.
                </p>
                <p>
                  And the deepest trap: the <em>intelligence</em> lives in the API call,
                  not in your tools. Which means the intelligence belongs to them, not you.
                </p>
                <p className="text-white">
                  This is not a complaint about AI pricing. It is a design observation.
                  If the intelligence lives in the model, you are permanently dependent on whoever controls the model.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600 tracking-[0.25em] uppercase mb-5">§2 — the inversion</p>
              <h2 className="text-xl font-bold text-white mb-5 leading-snug">
                Build the intelligence into the tools. Make the model the driver, not the passenger.
              </h2>
              <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>
                  If your tool <em>understands</em> your code — deterministically, through pure AST analysis,
                  without any model — then the model only needs to <em>decide</em> what to do next.
                  That is a much cheaper and less critical job.
                  A local LLM running on your laptop can do it.
                </p>
                <p>
                  If your tool can <em>execute</em> 52 engineering operations — read files, run tests,
                  edit code, call git — and if it documents its own capabilities in 208 tokens,
                  then almost any LLM can drive it. You own the capability.
                  The brain is just an interpreter.
                </p>
                <p className="text-white">
                  This is the inversion: intelligence into tools, model out of the critical path.
                  Same result. Swappable brain. No ceiling.
                </p>
              </div>
            </div>

            {/* pull quote */}
            <blockquote className="border-l-2 pl-6"
              style={{ borderColor: "#6366f1" }}>
              <p className="text-lg font-bold text-white leading-snug">
                "A free local model + atlas (deterministic understanding) + deepstrain (autonomous execution)
                should produce frontier-grade results on real engineering tasks.
                If it doesn't, that's a tools problem, not a model problem."
              </p>
              <footer className="text-xs text-slate-600 mt-3">
                — the design constraint behind every massiron product
              </footer>
            </blockquote>

            <div>
              <p className="text-xs text-slate-600 tracking-[0.25em] uppercase mb-5">§3 — ownership</p>
              <h2 className="text-xl font-bold text-white mb-5 leading-snug">
                Local-first is not a privacy feature. It is a sovereignty position.
              </h2>
              <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>
                  Your code never leaves your machine. Not because we are being careful.
                  Because there is no route for it to leave. The tools are local.
                  The analysis is local. The execution is local.
                </p>
                <p>
                  The only thing that leaves is the minimum context an LLM needs to make a decision —
                  and you control which LLM that is, and where it runs.
                </p>
                <p className="text-white">
                  Offline-capable after first activation. HMAC-signed license that validates locally.
                  No server required to read a dependency graph that was computed entirely on your machine.
                  You own the result.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600 tracking-[0.25em] uppercase mb-5">§4 — the three tools</p>
              <h2 className="text-xl font-bold text-white mb-6 leading-snug">
                One intelligence layer. Three instruments.
              </h2>
              <div className="space-y-5">
                {[
                  {
                    name: "atlas",
                    color: "#6366f1",
                    role: "understands",
                    body: "Pure AST analysis. No LLM, no guesses. Dependency graphs, risk scoring, security patterns, code health — all deterministic. atlas gives any model a ground truth to work from instead of a hallucinated map.",
                    href: "/atlas",
                  },
                  {
                    name: "deepstrain",
                    color: "#22d3ee",
                    role: "executes",
                    body: "52 engineering tools. A model plugs in, drives them, and ships the task. Not a suggestion engine — an executor. The work gets done whether the brain is DeepSeek R1, a local Ollama instance, or whatever replaces both of them next year.",
                    href: "/deepstrain",
                  },
                  {
                    name: "adauto",
                    color: "#f59e0b",
                    role: "narrates",
                    body: "Developer marketing that understands context. Tracks what resonates, adapts. Posts only after your approval. ~$0.00034 per post. The narrative stays alive without you watching it — because any LLM can drive 5 HTTP tools given 208 tokens of context.",
                    href: "/adauto",
                  },
                ].map(t => (
                  <div key={t.name} className="rounded-xl border border-white/8 p-5"
                       style={{ background: "rgba(255,255,255,0.015)" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono font-bold text-sm" style={{ color: t.color }}>{t.name}</span>
                      <span className="text-xs text-slate-700">—</span>
                      <span className="text-xs text-slate-600">{t.role}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{t.body}</p>
                    <Link href={t.href}
                      className="inline-flex items-center gap-1 text-xs font-mono transition-colors"
                      style={{ color: t.color }}>
                      explore {t.name} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600 tracking-[0.25em] uppercase mb-5">§5 — the name</p>
              <h2 className="text-xl font-bold text-white mb-5 leading-snug">
                massiron — forged, not assembled.
              </h2>
              <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>
                  Iron is forged. You don't snap it together from components.
                  You heat it, shape it under pressure, and it becomes stronger in the process.
                </p>
                <p>
                  The intelligence in massiron tools is the same way.
                  It's not a thin wrapper around a model API.
                  It's baked into AST parsers, execution loops, tool signatures —
                  deterministic structure that doesn't degrade when the model changes.
                </p>
                <p className="text-white">
                  Forged once. Works forever. The brain is rented. The tool is permanent.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 border-t border-white/5" style={{ background: "#000810" }}>
          <div className="max-w-2xl mx-auto px-5 text-center font-mono">
            <p className="text-xs text-slate-600 tracking-[0.3em] uppercase mb-6">start forging</p>
            <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
              three tools. one intelligence layer.<br/>
              <span className="massiron-gradient-text">yours, outright.</span>
            </h2>
            <p className="text-slate-500 text-sm mb-10">
              start with one. they connect when you need them to.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "deepstrain", href: "/deepstrain", color: "#22d3ee" },
                { label: "atlas",      href: "/atlas",      color: "#6366f1" },
                { label: "adauto",     href: "/adauto",     color: "#f59e0b" },
              ].map(p => (
                <Link key={p.href} href={p.href}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 text-sm font-mono rounded-md transition-all text-slate-300 hover:text-white">
                  {p.label}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                              style={{ color: p.color }} />
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>

      <MassironFooter />
    </>
  );
}
