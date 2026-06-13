import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";

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
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors">
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
        <span className="text-amber-500">//</span> {title}
      </h2>
      <div className="space-y-4 text-slate-400 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

const NAV = [
  { id: "install",    label: "install" },
  { id: "activate",   label: "activate" },
  { id: "setup",      label: "setup" },
  { id: "campaign",   label: "first campaign" },
  { id: "commands",   label: "commands" },
  { id: "platforms",  label: "platforms" },
  { id: "ethics",     label: "ethics gate" },
  { id: "offline",    label: "offline use" },
];

export default function AdautoDocs() {
  return (
    <>
      <Head>
        <title>adauto Docs — massiron</title>
        <meta name="description" content="adauto usage guide — install, setup, campaign, approve, post. Human-in-the-loop developer marketing automation." />
      </Head>

      <main className="min-h-screen bg-[#010d1a] text-[hsl(210,40%,95%)] font-['Inter',sans-serif]">
        <MassironNav activeProduct="adauto" />

        <div className="max-w-6xl mx-auto px-6 py-12 pt-24 flex gap-12">

          {/* Sidebar */}
          <aside className="hidden lg:block w-44 flex-shrink-0 sticky top-20 self-start">
            <nav className="space-y-1">
              {NAV.map((n) => (
                <a key={n.id} href={`#${n.id}`}
                   className="block text-xs font-mono text-slate-600 hover:text-amber-400 transition-colors py-1">
                  {n.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-2xl">

            <div className="mb-12">
              <h1 className="text-3xl font-bold font-mono mb-3">
                <span className="text-amber-400">adauto</span> docs
              </h1>
              <p className="text-slate-400 text-sm">Human-in-the-loop · Local-first · Ethics gate always on · ~$0.00034/post</p>
            </div>

            <Section id="install" title="install">
              <p>adauto requires Python ≥ 3.10. No compiled dependencies.</p>
              <CodeBlock code="pip install adauto" />
              <p>Verify the installation:</p>
              <CodeBlock code="adauto --version" />
            </Section>

            <Section id="activate" title="activate">
              <p>adauto is free to install and run in dry-run mode. Posting to platforms requires a Pro license.</p>
              <p className="font-semibold text-slate-300">Browser activation (recommended)</p>
              <CodeBlock code="adauto activate" />
              <p>This opens <code className="text-slate-300 bg-white/5 px-1 rounded">massiron.com/adauto/activate</code> in your browser. Purchase → license is saved to <code className="text-slate-300 bg-white/5 px-1 rounded">~/.adauto/.license</code>. Verified offline via HMAC-SHA256.</p>
              <p>Check activation status:</p>
              <CodeBlock code="adauto status" />
            </Section>

            <Section id="setup" title="setup">
              <p>First-time setup creates a config directory at <code className="text-slate-300 bg-white/5 px-1 rounded">~/.adauto/</code> and walks you through platform credentials:</p>
              <CodeBlock code="adauto setup" />
              <p>You will be prompted for:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li><strong className="text-slate-400">Reddit</strong> — client_id + client_secret + username/password</li>
                <li><strong className="text-slate-400">dev.to</strong> — API key (Settings → Account → DEV API Keys)</li>
                <li><strong className="text-slate-400">Twitter/X</strong> — bearer token (optional)</li>
                <li><strong className="text-slate-400">HN</strong> — username + password (optional)</li>
              </ul>
              <p>Credentials are stored locally in <code className="text-slate-300 bg-white/5 px-1 rounded">~/.adauto/config.json</code>. Never sent to massiron servers.</p>
            </Section>

            <Section id="campaign" title="first campaign">
              <p>A campaign is a named release or initiative. adauto chooses the platform, angle, and format automatically:</p>
              <CodeBlock code={`# generate drafts for your campaign (no posting yet)
adauto run --campaign my-product

# review what was generated
adauto review

# approve a specific draft
adauto approve <post_id>

# approve everything in the queue
adauto approve --all

# publish approved posts
adauto post my-product`} />
              <p>Nothing ever posts without <code className="text-slate-300 bg-white/5 px-1 rounded">adauto approve</code>. This is enforced in code — there is no bypass flag.</p>
            </Section>

            <Section id="commands" title="commands">
              {[
                { cmd: "adauto run --campaign <name>",      tier: "free",  desc: "Generate content drafts. Picks platform + subreddit + style from prior engagement. Queues to pending_approval." },
                { cmd: "adauto status",                      tier: "free",  desc: "Show pending count, approved queue, post history, estimated next-run time per cooldown." },
                { cmd: "adauto review",                      tier: "free",  desc: "Interactive approval UI — read, edit, approve, or skip each draft." },
                { cmd: "adauto approve <id|--all>",          tier: "free",  desc: "Move drafts from pending to approved queue." },
                { cmd: "adauto post <campaign>",             tier: "pro",   desc: "Publish approved items. Rate-limited per platform. Supports --dry_run." },
                { cmd: "adauto report",                      tier: "free",  desc: "ROI table: cost_usd, engagement_score, cost-per-score per post." },
                { cmd: "adauto demo --campaign <name>",      tier: "pro",   desc: "Generates a VHS .tape + GIF asset from your campaign content." },
                { cmd: "adauto setup",                       tier: "free",  desc: "First-time credential configuration." },
                { cmd: "adauto activate",                    tier: "—",     desc: "Open browser to massiron.com/adauto/activate for Pro license." },
              ].map((r) => (
                <div key={r.cmd} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
                  <code className="font-mono text-amber-400/80 text-xs w-56 flex-shrink-0 mt-0.5">{r.cmd}</code>
                  <div>
                    <span className="text-xs font-mono text-slate-600 mr-3">{r.tier}</span>
                    <span className="text-xs text-slate-500">{r.desc}</span>
                  </div>
                </div>
              ))}
            </Section>

            <Section id="platforms" title="platforms">
              {[
                { name: "Reddit",     color: "text-orange-400",  note: "Subreddit targeting · flair support · score tracked per subreddit. adauto avoids self-promo violations by following r-specific rules." },
                { name: "dev.to",     color: "text-slate-300",   note: "Markdown · front matter · series support · read_time estimate. Posts as canonical articles." },
                { name: "Twitter/X",  color: "text-sky-400",     note: "Thread splitting · char limit enforcement · hashtag injection from campaign tags." },
                { name: "HN (Show)",  color: "text-amber-500",   note: "Show HN: format · no hype words · minimal CTA. adauto avoids patterns that trigger HN penalties." },
              ].map((p) => (
                <div key={p.name} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
                  <span className={`font-mono text-xs w-24 flex-shrink-0 mt-0.5 ${p.color}`}>{p.name}</span>
                  <span className="text-xs text-slate-500">{p.note}</span>
                </div>
              ))}
            </Section>

            <Section id="ethics" title="ethics gate">
              <p>Every draft passes through an ethics filter before entering the approval queue. The filter rejects:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Misleading claims or false metrics</li>
                <li>Platform-ToS violations (vote manipulation, astroturfing)</li>
                <li>Spam patterns (identical posts across subreddits)</li>
                <li>Hype language that triggers community downvote heuristics</li>
              </ul>
              <p>Rejected drafts are shown in <code className="text-slate-300 bg-white/5 px-1 rounded">adauto review</code> with the rejection reason. You can edit and resubmit.</p>
              <p>The gate runs locally — no API call to an external moderation service. The filter logic is in <code className="text-slate-300 bg-white/5 px-1 rounded">adauto/ethics.py</code> and can be audited.</p>
            </Section>

            <Section id="offline" title="offline use">
              <p>adauto runs fully offline. License verification is HMAC-SHA256 — no server ping required.</p>
              <p>Credentials and campaign state are stored locally in <code className="text-slate-300 bg-white/5 px-1 rounded">~/.adauto/</code>.</p>
              <p>Posting to platforms does require internet access (API calls to Reddit, dev.to, etc.), but adauto itself has no cloud dependency.</p>
              <CodeBlock code={`# check license without internet
adauto status

# generate drafts offline (uses local LLM or deepstrain)
adauto run --campaign my-product --dry-run`} />
            </Section>

            <div className="mt-16 pt-8 border-t border-white/5 text-center">
              <p className="text-slate-600 text-xs font-mono mb-4">ready to post?</p>
              <Link href="/adauto/activate"
                    className="inline-flex items-center gap-2 font-mono text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-lg">
                get adauto pro
              </Link>
            </div>

          </div>
        </div>

        <MassironFooter />
      </main>
    </>
  );
}
