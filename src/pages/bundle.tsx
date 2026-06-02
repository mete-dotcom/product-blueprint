import Head from "next/head";
import Link from "next/link";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";
import { MassironNav } from "../components/MassironNav";
import { MassironFooter } from "../components/MassironFooter";
import { useState } from "react";

declare global { interface Window { Paddle: any } }

const DS_TEAM_PRICE   = Number(process.env.NEXT_PUBLIC_DEEPSTRAIN_TEAM_PRICE || "19");
const ATLAS_PRO_PRICE = Number(process.env.NEXT_PUBLIC_ATLAS_PRO_PRICE || "29");
const DISCOUNT        = 0.20;
const CURRENCY        = process.env.NEXT_PUBLIC_DEEPSTRAIN_CURRENCY || "USD";
const SYM             = CURRENCY === "USD" ? "$" : CURRENCY;

const BUNDLE_DS_PADDLE   = process.env.NEXT_PUBLIC_BUNDLE_DS_PADDLE   || "pri_bundle_ds_team";
const BUNDLE_ATLAS_PADDLE = process.env.NEXT_PUBLIC_BUNDLE_ATLAS_PADDLE || "pri_bundle_atlas_pro";

const combined    = DS_TEAM_PRICE + ATLAS_PRO_PRICE;
const bundlePrice = Math.floor(combined * (1 - DISCOUNT));
const savings     = combined - bundlePrice;

function openPaddle(priceIds: string[]) {
  if (typeof window === "undefined" || !window.Paddle) return;
  // open first, then upsell second — or use Paddle multi-item if available
  window.Paddle.Checkout.open({
    items: priceIds.map((id) => ({ priceId: id, quantity: 1 })),
  });
}

export default function Bundle() {
  const [started, setStarted] = useState(false);

  return (
    <>
      <Head>
        <title>Bundle — deepstrain + ATLAS</title>
        <meta name="description" content={`Get deepstrain Team + ATLAS Pro together and save ${Math.round(DISCOUNT * 100)}%.`} />
      </Head>

      <main className="min-h-screen bg-[#010d1a] text-[hsl(210,40%,95%)] font-['Inter',sans-serif]">

        <MassironNav />

        <div className="max-w-3xl mx-auto px-6 py-20 pt-28">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-block text-xs font-mono px-3 py-1 rounded-full border border-white/10 text-slate-500 mb-6">
              limited offer · {Math.round(DISCOUNT * 100)}% off when you get both
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <span className="text-[hsl(192,91%,47%)] font-mono">deepstrain</span>
              <span className="text-slate-600 mx-3 font-light">+</span>
              <span className="text-[hsl(192,91%,47%)] font-mono">atlas</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              Two independent products. One for AI-driven execution, one for deterministic analysis.
              Together they cover the full engineering intelligence stack.
            </p>
          </div>

          {/* Product cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">

            {/* deepstrain */}
            <div className="rounded-xl border border-[hsl(192,60%,20%)] bg-[hsl(215,60%,5%)] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono font-bold text-[hsl(192,91%,47%)]">deepstrain</span>
                <span className="text-xs font-mono text-slate-500 border border-slate-700 px-2 py-0.5 rounded">team</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">AI engineering agent — autonomous execution runtime.</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {[
                  "52 engineering tools",
                  "MCP server (stdio + HTTP)",
                  "LAN / VPN access · multi-client",
                  "deepstrain_eval — autonomous loops",
                  "local LLM support (Ollama, LM Studio)",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-[hsl(192,91%,47%)] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-white/5 font-mono text-sm">
                <span className="text-slate-500 line-through text-xs">{SYM}{DS_TEAM_PRICE}/mo</span>
                <span className="text-white font-bold ml-2">{SYM}{Math.floor(DS_TEAM_PRICE * (1 - DISCOUNT))}/mo</span>
              </div>
            </div>

            {/* atlas */}
            <div className="rounded-xl border border-[hsl(192,60%,20%)] bg-[hsl(215,60%,5%)] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono font-bold text-[hsl(192,91%,47%)]">atlas</span>
                <span className="text-xs font-mono text-slate-500 border border-slate-700 px-2 py-0.5 rounded">pro</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Deterministic code intelligence — offline, no LLM.</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {[
                  "Core Engine + System Map",
                  "Risk Radar · Security Shield",
                  "Code Health · Signal Map",
                  "Atlas MCP Server",
                  "100% offline · HMAC-licensed",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-[hsl(192,91%,47%)] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-white/5 font-mono text-sm">
                <span className="text-slate-500 line-through text-xs">{SYM}{ATLAS_PRO_PRICE}/mo</span>
                <span className="text-white font-bold ml-2">{SYM}{Math.floor(ATLAS_PRO_PRICE * (1 - DISCOUNT))}/mo</span>
              </div>
            </div>
          </div>

          {/* Bundle CTA */}
          <div className="rounded-xl border border-[hsl(192,91%,47%)] bg-[hsl(192,91%,47%,0.05)] p-8 text-center">
            <p className="text-xs font-mono text-[hsl(192,91%,47%)] uppercase tracking-widest mb-2">bundle price</p>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-slate-500 line-through text-lg font-mono">{SYM}{combined}</span>
              <span className="text-5xl font-bold font-mono text-white">{SYM}{bundlePrice}</span>
              <span className="text-slate-400 text-sm font-mono">/mo</span>
            </div>
            <p className="text-xs text-[hsl(192,91%,47%)] font-mono mb-8">
              you save {SYM}{savings}/mo · {Math.round(DISCOUNT * 100)}% off combined price
            </p>

            {!started ? (
              <button
                onClick={() => { setStarted(true); openPaddle([BUNDLE_DS_PADDLE, BUNDLE_ATLAS_PADDLE]); }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[hsl(192,91%,47%)] text-black font-bold font-mono rounded-lg hover:bg-[hsl(192,91%,55%)] transition-colors text-sm"
              >
                get the bundle <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm font-mono text-[hsl(192,91%,47%)]">
                <Zap className="w-4 h-4 animate-pulse" />
                checkout opening…
              </div>
            )}

            <p className="text-xs text-slate-600 font-mono mt-4">
              two separate licenses delivered · cancel each independently · no lock-in
            </p>
          </div>

          {/* Clarification */}
          <div className="mt-8 text-center text-xs text-slate-600 font-mono leading-relaxed">
            <p>deepstrain and ATLAS are independent products with separate licenses, pricing, and roadmaps.</p>
            <p className="mt-1">The bundle is a purchase convenience — not a merged product.</p>
            <p className="mt-1">
              <Link href="/pricing" className="text-slate-500 hover:text-slate-300 transition-colors">deepstrain pricing</Link>
              <span className="mx-2">·</span>
              <Link href="/atlas/pricing" className="text-slate-500 hover:text-slate-300 transition-colors">atlas pricing</Link>
            </p>
          </div>
        </div>

        <MassironFooter />
      </main>
    </>
  );
}
