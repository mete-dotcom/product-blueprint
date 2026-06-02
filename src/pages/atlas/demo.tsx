import Head from "next/head";
import Link from "next/link";
import { ArrowRight, ExternalLink, Zap } from "lucide-react";
import { MassironNav } from "../../components/MassironNav";

export default function AtlasDemo() {
  return (
    <>
      <Head>
        <title>ATLAS — Live Report Demo</title>
        <meta
          name="description"
          content="Live ATLAS report: pycode-atlas v0.9.0 scanning its own source code. 1,999 functions, 29,148 edges, health 89/100. No LLM, zero tokens."
        />
      </Head>

      <main className="min-h-screen bg-[hsl(215,60%,4%)] text-[hsl(210,40%,95%)]">
        <MassironNav activeProduct="atlas" />

        {/* ── Top banner ── */}
        <div className="pt-16 border-b border-white/5 bg-[hsl(215,60%,4%)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[hsl(192,91%,47%)]/15 text-[hsl(192,91%,47%)] border border-[hsl(192,91%,47%)]/20 uppercase tracking-widest">
                  live demo
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  atlas scanning itself — pycode-atlas v0.9.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                1,999 functions · 29,148 edges · health 89/100 · 0 LLM tokens · generated offline
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href="/demos/atlas_report.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
              >
                open full screen <ExternalLink className="w-3 h-3" />
              </a>
              <Link
                href="/atlas/pricing"
                className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded bg-[hsl(192,91%,47%)] text-black font-semibold hover:bg-[hsl(192,91%,55%)] transition-all"
              >
                get atlas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Proof points strip ── */}
        <div className="border-b border-white/5 bg-[hsl(215,60%,3%)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-1">
            {[
              ["69s", "full scan, 388 files, 111k lines"],
              ["0", "LLM tokens — fully deterministic"],
              ["1,544", "dead functions confirmed"],
              ["33", "false positives rescued by atlas verify"],
              ["89/100", "architecture health score"],
            ].map(([val, label]) => (
              <div key={val} className="flex items-center gap-1.5 text-[11px] font-mono">
                <Zap className="w-3 h-3 text-[hsl(192,91%,47%)]" />
                <span className="text-white font-semibold">{val}</span>
                <span className="text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Iframe ── */}
        <div className="w-full" style={{ height: "calc(100vh - 160px)" }}>
          <iframe
            src="/demos/atlas_report.html"
            className="w-full h-full border-0"
            title="ATLAS Report Demo — pycode-atlas v0.9.0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* ── Bottom CTA ── */}
        <div className="border-t border-white/5 bg-[hsl(215,60%,4%)] py-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm text-slate-300 mb-1">
              This report was generated with{" "}
              <code className="text-[hsl(192,91%,47%)] font-mono">atlas scan .</code>
              {" "}— one command, no API key, no account.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Free tier includes the full scan engine and this HTML report. Paid modules unlock risk radar, security shield, MCP server, and more.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://pypi.org/project/pycode-atlas/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-mono px-4 py-2 rounded border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
              >
                pip install pycode-atlas
              </a>
              <Link
                href="/atlas/pricing"
                className="inline-flex items-center gap-2 text-sm font-mono px-4 py-2 rounded bg-[hsl(192,91%,47%)] text-black font-semibold hover:bg-[hsl(192,91%,55%)] transition-all"
              >
                see pricing <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
