import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";
import { Copy, CheckCircle, ArrowRight } from "lucide-react";

// ── Code block with copy ──────────────────────────────────────────────────────
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
        <span className="text-xs font-mono text-gray-500">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-sky-400 transition-colors">
          {copied ? <><CheckCircle className="w-3 h-3" />copied</> : <><Copy className="w-3 h-3" />copy</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-black/40">
        <code className="text-sm font-mono text-gray-300 whitespace-pre">{code.trim()}</code>
      </pre>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-7 h-7 rounded-full bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-xs font-mono text-sky-300 flex-shrink-0">
          {n}
        </span>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="pl-10">{children}</div>
    </div>
  );
}

export default function NodestoneDocs() {
  return (
    <>
      <Head>
        <title>docs — nodestone</title>
        <meta name="description" content="nodestone quickstart: install, nodestone init, nodestone mcp, and wiring it into Claude Code." />
      </Head>

      <MassironNav activeProduct="nodestone" />

      <div className="min-h-screen pt-24 pb-24 bg-[#030712]">
        <div className="max-w-3xl mx-auto px-5">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-8 font-mono">
            <Link href="/nodestone" className="hover:text-sky-400 transition-colors">nodestone</Link>
            <span>/</span>
            <span className="text-gray-400">docs</span>
          </div>

          <p className="text-sky-400 text-xs font-mono tracking-widest uppercase mb-3">quickstart</p>
          <h1 className="text-4xl font-bold text-white mb-3">give your project a memory</h1>
          <p className="text-gray-400 text-base leading-relaxed mb-12 max-w-xl">
            Three commands. After this, every session your AI starts already knowing your
            decisions, conventions, and history — no re-explaining.
          </p>

          <Step n="1" title="install">
            <p className="text-gray-400 text-sm mb-2">Compiled binary from PyPI. Python ≥ 3.11.</p>
            <CodeBlock lang="bash" code="pip install nodestone" />
          </Step>

          <Step n="2" title="nodestone init">
            <p className="text-gray-400 text-sm mb-2">
              Creates a local memory store for the current project and activates your license.
              Your browser opens the activation page; the terminal picks up the signed license
              automatically — no key to paste.
            </p>
            <CodeBlock lang="bash" code={`cd your-project
nodestone init
# → browser opens for activation (Free / Pro / Team)
# → memory store created at ~/.nodestone/<project>.db
# ✓ nodestone ready`} />
            <p className="text-gray-400 text-sm mb-2 mt-4">Write and recall memories directly:</p>
            <CodeBlock lang="bash" code={`# remember a decision
nodestone remember "auth: Redis sessions over JWT — need server-side revocation"

# recall it later, semantically
nodestone recall "why redis for auth?"
# → "auth: Redis sessions over JWT — need server-side revocation"`} />
          </Step>

          <Step n="3" title="nodestone mcp">
            <p className="text-gray-400 text-sm mb-2">
              Starts the MCP server over stdio. Any MCP-compatible host can now read and write
              your project memory — automatically, at the start of every session.
            </p>
            <CodeBlock lang="bash" code={`nodestone mcp
# MCP server ready — stdio transport
# project memory exposed: recall / remember / summarize
# waiting for tool calls...`} />
          </Step>

          <Step n="4" title="claude mcp add">
            <p className="text-gray-400 text-sm mb-2">
              Wire nodestone into Claude Code (or any MCP host) once. From then on, Claude reads
              your project memory before it does anything.
            </p>
            <CodeBlock lang="bash" code={`# Claude Code CLI
claude mcp add nodestone nodestone mcp

# verify
claude mcp list
# → nodestone   nodestone mcp   ✓ running`} />
            <p className="text-gray-400 text-sm mb-2 mt-4">Or add it manually to your MCP config:</p>
            <CodeBlock lang="json" code={`{
  "mcpServers": {
    "nodestone": {
      "command": "nodestone",
      "args": ["mcp"]
    }
  }
}`} />
            <p className="text-gray-400 text-sm mb-2 mt-4">
              Team tier serves the same memory over HTTP so every developer shares one context:
            </p>
            <CodeBlock lang="bash" code={`# on the shared host
nodestone mcp --http --port 8770

# on any teammate's machine
claude mcp add nodestone-remote --transport http http://YOUR-IP:8770`} />
          </Step>

          {/* pairs-with note */}
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.04] p-5 mt-12">
            <p className="text-sky-300 text-sm font-semibold mb-1">pairs with atlas + deepstrain</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              atlas maps your code and deepstrain changes it — point both at the same project and
              nodestone keeps the context they generate. Understand, execute, remember: one loop.
            </p>
          </div>

          {/* cross-sell */}
          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">also from us</p>
              <p className="text-sm font-mono font-semibold text-gray-300">deepstrain — autonomous execution · atlas — code intelligence</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/nodestone/pricing" className="text-xs font-mono px-3 py-1.5 rounded border border-sky-500/40 text-sky-400 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all inline-flex items-center gap-1.5">
                see pricing <ArrowRight className="w-3 h-3" />
              </Link>
              <Link href="/bundle" className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">bundle →</Link>
            </div>
          </div>

        </div>
      </div>

      <MassironFooter />
    </>
  );
}
