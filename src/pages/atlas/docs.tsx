import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { Copy, CheckCircle, ArrowRight } from "lucide-react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-xs font-mono text-slate-500">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[hsl(192,91%,47%)] transition-colors">
          {copied ? <><CheckCircle className="w-3 h-3" />copied</> : <><Copy className="w-3 h-3" />copy</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-black/40">
        <code className="text-sm font-mono text-slate-300 whitespace-pre">{code.trim()}</code>
      </pre>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <h2 className="text-lg font-bold text-white font-mono mb-6 flex items-center gap-3">
        <span className="text-[hsl(192,91%,47%)]">//</span> {title}
      </h2>
      <div className="space-y-4 text-slate-400 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

const NAV = [
  { id: "install",     label: "install" },
  { id: "activate",    label: "activate" },
  { id: "scan",        label: "first scan" },
  { id: "modules",     label: "modules" },
  { id: "mcp",         label: "mcp server" },
  { id: "cli",         label: "cli reference" },
  { id: "offline",     label: "offline use" },
];

export default function AtlasDocs() {
  return (
    <>
      <Head>
        <title>ATLAS Docs — Deterministic Code Intelligence</title>
        <meta name="description" content="ATLAS usage guide — install, activate, scan, modules, MCP server, CLI reference." />
      </Head>

      <main className="min-h-screen bg-[hsl(215,60%,4%)] text-[hsl(210,40%,95%)] font-['Inter',sans-serif]">

        {/* Nav */}
        <nav className="border-b border-[hsl(215,40%,12%)] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto sticky top-0 bg-[hsl(215,60%,4%)] z-10">
          <div className="flex items-center gap-5">
            <Link href="/atlas" className="text-sm text-slate-400 hover:text-white transition-colors font-mono">← atlas</Link>
            <span className="text-xs font-mono text-slate-600 uppercase tracking-widest">docs</span>
          </div>
          <Link href="/atlas/pricing" className="text-xs font-mono px-3 py-1.5 rounded border border-[hsl(192,91%,47%)] text-[hsl(192,91%,47%)] hover:bg-[hsl(192,91%,47%)] hover:text-black transition-all">
            get atlas →
          </Link>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">

          {/* Sidebar */}
          <aside className="hidden lg:block w-44 flex-shrink-0 sticky top-20 self-start">
            <nav className="space-y-1">
              {NAV.map((n) => (
                <a key={n.id} href={`#${n.id}`}
                   className="block text-xs font-mono text-slate-600 hover:text-[hsl(192,91%,47%)] transition-colors py-1">
                  {n.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-2xl">

            <div className="mb-12">
              <h1 className="text-3xl font-bold font-mono mb-3">
                <span className="text-[hsl(192,91%,47%)]">atlas</span> docs
              </h1>
              <p className="text-slate-400 text-sm">Deterministic · Offline · HMAC-licensed · No LLM required.</p>
            </div>

            <Section id="install" title="install">
              <p>ATLAS ships as a Python package. Requires Python ≥ 3.10.</p>
              <CodeBlock code="pip install atlas-intel" />
              <p>Verify:</p>
              <CodeBlock code="atlas --version" />
            </Section>

            <Section id="activate" title="activate">
              <p>After purchase you receive an <code className="text-slate-300 bg-white/5 px-1 rounded">atlas_license.json</code> by email. Two ways to activate:</p>
              <p className="font-semibold text-slate-300">Option A — file drop (recommended)</p>
              <CodeBlock code={`# drop the file atlas receives by email
atlas activate-file ~/Downloads/atlas_license.json`} />
              <p className="font-semibold text-slate-300">Option B — email + password</p>
              <CodeBlock code="atlas activate --email you@example.com" />
              <p>Verify activation:</p>
              <CodeBlock code="atlas status" />
              <p>License is stored at <code className="text-slate-300 bg-white/5 px-1 rounded">~/.atlas/atlas_license.json</code>. Verified offline via HMAC-SHA256.</p>
            </Section>

            <Section id="scan" title="first scan">
              <p>Run a full scan of the current directory:</p>
              <CodeBlock code={`cd your-project
atlas scan .`} />
              <p>Opens <code className="text-slate-300 bg-white/5 px-1 rounded">report.html</code> in your browser. The HTML file is fully self-contained — share it with your team without any server.</p>
              <p>Scan a specific path or output to a custom file:</p>
              <CodeBlock code={`atlas scan ./src --output analysis.html
atlas scan . --no-open          # don't open browser
atlas scan . --format json      # JSON output instead of HTML`} />
            </Section>

            <Section id="modules" title="modules">
              <p>Modules unlock on activation based on your tier. Run <code className="text-slate-300 bg-white/5 px-1 rounded">atlas status</code> to see which are active.</p>
              {[
                { name: "Core Engine",      tier: "free",       desc: "AST parser, graph builder, HTML reporter. Included in all tiers." },
                { name: "System Map",       tier: "solo+",      desc: "Dependency graph visualization. Import chains, circular deps, module clusters." },
                { name: "Risk Radar",       tier: "pro+",       desc: "Hotspot detection. Cyclomatic complexity, churn rate, change coupling." },
                { name: "Security Shield",  tier: "pro+",       desc: "Static security analysis. SQLi, XSS, secret exposure, unsafe patterns." },
                { name: "Code Health",      tier: "pro+",       desc: "Maintainability index, dead code detection, duplication ratio." },
                { name: "Signal Map",       tier: "pro+",       desc: "Cross-module signal propagation. Which changes affect which components." },
                { name: "Atlas MCP Server", tier: "pro+",       desc: "Expose atlas scan results via MCP protocol to any AI agent." },
                { name: "Decision Center",  tier: "enterprise", desc: "Rule-based architectural decisions. Policy enforcement, guardrails." },
                { name: "Ownership Map",    tier: "enterprise", desc: "Bus factor analysis, knowledge silos, git blame aggregation." },
                { name: "Rewind",           tier: "enterprise", desc: "Snapshot diffing. Compare any two scan results, track regression." },
                { name: "What-If",          tier: "enterprise", desc: "Impact simulation. Predict risk before you refactor or delete." },
                { name: "Commit Guard",     tier: "enterprise", desc: "Pre-commit gate. Block commits that violate health or security thresholds." },
              ].map((m) => (
                <div key={m.name} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
                  <span className="font-mono text-[hsl(192,91%,47%)] text-xs w-28 flex-shrink-0 mt-0.5">{m.name}</span>
                  <div>
                    <span className="text-xs font-mono text-slate-600 mr-3">{m.tier}</span>
                    <span className="text-xs text-slate-500">{m.desc}</span>
                  </div>
                </div>
              ))}
            </Section>

            <Section id="mcp" title="mcp server">
              <p>Atlas Pro includes an MCP server — AI agents can query scan results directly without reading HTML.</p>
              <p className="font-semibold text-slate-300">Start the Atlas MCP server</p>
              <CodeBlock code={`# stdio mode (Claude Code, Cursor, Gemini CLI)
atlas mcp

# HTTP mode (multi-client, LAN access)
atlas mcp --http --port 9000`} />
              <p className="font-semibold text-slate-300">Connect from Claude Code</p>
              <CodeBlock code={`# stdio
claude mcp add atlas

# HTTP
claude mcp add atlas-remote --transport http http://localhost:9000`} />
              <p>Once connected, your AI agent can call <code className="text-slate-300 bg-white/5 px-1 rounded">atlas_scan</code>, <code className="text-slate-300 bg-white/5 px-1 rounded">atlas_query</code>, and other tools without leaving the chat context.</p>
            </Section>

            <Section id="cli" title="cli reference">
              <CodeBlock code={`atlas scan <path>           # run full analysis
atlas scan . --module risk  # run specific module only
atlas status                # show license, tier, active modules
atlas activate-file <path>  # activate from license file
atlas activate --email <e>  # activate via credentials
atlas mcp                   # start MCP server (stdio)
atlas mcp --http            # start MCP server (HTTP)
atlas update                # check for updates
atlas --version             # print version`} />
            </Section>

            <Section id="offline" title="offline use">
              <p>Atlas works completely offline after activation. The license is verified locally via HMAC-SHA256 — no network call required.</p>
              <p>The only time network access is needed:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Initial activation</li>
                <li>License renewal (35-day cycle)</li>
                <li>Downloading updates via <code className="text-slate-300 bg-white/5 px-1 rounded">atlas update</code></li>
              </ul>
              <p>Air-gapped environments: distribute the <code className="text-slate-300 bg-white/5 px-1 rounded">atlas_license.json</code> file manually and use <code className="text-slate-300 bg-white/5 px-1 rounded">atlas activate-file</code>.</p>
            </Section>

            {/* Cross-sell */}
            <div className="mt-16 rounded-xl border border-[hsl(215,40%,12%)] bg-[hsl(215,60%,5%)] p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-slate-500 mb-1">also from us</p>
                <p className="text-sm font-mono font-semibold text-slate-200">deepstrain — AI engineering agent</p>
                <p className="text-xs text-slate-500 mt-1">52 tools · autonomous loops · MCP server · BYOK</p>
              </div>
              <Link href="/" className="flex items-center gap-1.5 text-xs font-mono text-[hsl(192,91%,47%)] hover:text-[hsl(192,91%,65%)] transition-colors flex-shrink-0">
                deepstrain.dev <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <footer className="border-t border-[hsl(215,40%,12%)] py-8 px-6 text-center">
          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 font-mono">
            <Link href="/" className="hover:text-slate-400 transition-colors">deepstrain</Link>
            <span>·</span>
            <Link href="/atlas" className="hover:text-slate-400 transition-colors text-slate-400">atlas</Link>
            <span>·</span>
            <Link href="/atlas/pricing" className="hover:text-slate-400 transition-colors">pricing</Link>
            <span>·</span>
            <a href="mailto:support@atlas.tools" className="hover:text-slate-400 transition-colors">support</a>
          </div>
        </footer>
      </main>
    </>
  );
}
