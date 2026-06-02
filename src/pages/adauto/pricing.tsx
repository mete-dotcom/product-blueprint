import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle, Lock, Zap, BarChart3, Globe, ShieldCheck,
  Brain, ArrowRight, Sparkles,
} from "lucide-react";
import { useHiddenTiers } from "../../lib/useHiddenTiers";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";

declare global { interface Window { Paddle: any } }

// ── Pricing constants ─────────────────────────────────────────────────────────
const BASE   = Number(process.env.NEXT_PUBLIC_ADAUTO_PRICE || "12");
const CURR   = process.env.NEXT_PUBLIC_ADAUTO_CURRENCY || "USD";
const SYM    = CURR === "USD" ? "$" : CURR;

const PADDLE_IDS = {
  pro_monthly: process.env.NEXT_PUBLIC_ADAUTO_PRO_MONTHLY || "pri_adauto_pro_m",
  pro_yearly:  process.env.NEXT_PUBLIC_ADAUTO_PRO_YEARLY  || "pri_adauto_pro_y",
};

type Period = "monthly" | "yearly";

function openPaddle(priceId: string) {
  if (!priceId || typeof window === "undefined" || !window.Paddle) return;
  window.Paddle.Checkout.open({ items: [{ priceId, quantity: 1 }] });
}

// ── Feature rows ──────────────────────────────────────────────────────────────
const FEATURES: {
  icon: JSX.Element;
  name: string;
  free: string | boolean;
  pro: string | boolean;
}[] = [
  { icon: <Sparkles className="w-3.5 h-3.5" />,   name: "AI content generation",   free: "1 campaign",  pro: "unlimited" },
  { icon: <Globe className="w-3.5 h-3.5" />,       name: "platforms",               free: "Reddit",      pro: "Reddit · dev.to · Twitter" },
  { icon: <Zap className="w-3.5 h-3.5" />,         name: "posts per day",           free: "3",           pro: "unlimited" },
  { icon: <ShieldCheck className="w-3.5 h-3.5" />, name: "approval gate",           free: true,          pro: true },
  { icon: <Brain className="w-3.5 h-3.5" />,       name: "engagement learning",     free: false,         pro: true },
  { icon: <BarChart3 className="w-3.5 h-3.5" />,   name: "ROI / cost report",       free: false,         pro: true },
  { icon: <Lock className="w-3.5 h-3.5" />,        name: "HTTP server (:8766)",     free: true,          pro: true },
  { icon: <Zap className="w-3.5 h-3.5" />,         name: "strategy algorithm",      free: "basic",       pro: "exploit + explore" },
];

const STEPS = [
  { n: "01", cmd: "pip install adauto",                note: "python ≥ 3.10" },
  { n: "02", cmd: "adauto license activate ADTO-...",  note: "key emailed after purchase" },
  { n: "03", cmd: "adauto serve",                      note: "HTTP server on :8766" },
  { n: "04", cmd: "adauto run --campaign my-product",  note: "generate → approve → post" },
];

export default function AdautoPricing() {
  const [period, setPeriod] = useState<Period>("monthly");
  const hidden = useHiddenTiers("adauto");

  const proPrice = period === "monthly" ? BASE : Math.floor(BASE * 10);
  const paddleId = period === "monthly" ? PADDLE_IDS.pro_monthly : PADDLE_IDS.pro_yearly;

  return (
    <>
      <Head>
        <title>ADAUTO Pricing — Developer Marketing Automation</title>
        <meta name="description" content={`Free: 1 campaign, 3 posts/day. Pro ${SYM}${BASE}/mo: unlimited, all platforms, engagement learning.`} />
      </Head>

      <main className="min-h-screen bg-[hsl(215,60%,4%)] text-[hsl(210,40%,95%)] font-['Inter',sans-serif]">

        <MassironNav activeProduct="adauto" />

        <div className="max-w-5xl mx-auto px-6 py-16 pt-28">

          {/* ── Header ── */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              <span className="font-mono text-[hsl(30,91%,55%)]">adauto</span>{" "}pricing
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              Human-approved · Local-first · ~{SYM}0.00034/post · BYOK DeepSeek
            </p>

            {/* ── Period toggle ── */}
            <div className="inline-flex rounded-lg border border-[hsl(215,40%,12%)] overflow-hidden">
              {(["monthly", "yearly"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-5 py-2 text-sm font-mono transition-colors ${
                    period === p
                      ? "bg-[hsl(30,91%,55%)] text-black font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {p}
                  {p === "yearly" && <span className="text-[10px] ml-1 opacity-70">save ~17%</span>}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tier cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16 max-w-2xl mx-auto">

            {/* Free */}
            {!hidden.has("free") && (
            <div className="rounded-xl border border-slate-700 bg-[hsl(215,60%,5%)] p-6 flex flex-col">
              <div className="mb-5">
                <h2 className="font-mono font-bold text-lg text-white">Free</h2>
                <p className="text-xs text-slate-500 mt-1">1 campaign · Reddit only · 3 posts/day</p>
              </div>
              <div className="mb-6">
                <span className="font-mono text-3xl font-bold text-slate-300">free</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {["1 campaign", "Reddit posts", "3 posts/day", "approval gate", "HTTP server :8766", "offline-capable"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://pypi.org/project/adauto/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center text-xs font-mono py-2.5 rounded border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
              >
                pip install adauto
              </a>
            </div>
            )}

            {/* Pro */}
            {!hidden.has("pro") && (
            <div className="rounded-xl border border-[hsl(30,91%,55%)] bg-[hsl(215,60%,5%)] p-6 flex flex-col ring-1 ring-[hsl(30,91%,55%)] ring-opacity-40 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono px-3 py-0.5 rounded-full bg-[hsl(30,91%,55%)] text-black font-semibold">
                most popular
              </div>
              <div className="mb-5">
                <h2 className="font-mono font-bold text-lg text-white">Pro</h2>
                <p className="text-xs text-slate-500 mt-1">Unlimited · All platforms · Engagement learning</p>
              </div>
              <div className="mb-6">
                <span className="font-mono text-3xl font-bold text-white">{SYM}{proPrice}</span>
                <span className="text-xs text-slate-500 ml-1 font-mono">/{period === "monthly" ? "mo" : "yr"}</span>
                {period === "yearly" && (
                  <p className="text-[10px] text-slate-600 font-mono mt-1">
                    ≈ {SYM}{Math.round(proPrice / 12)}/mo billed annually
                  </p>
                )}
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {[
                  "unlimited campaigns",
                  "Reddit · dev.to · Twitter",
                  "unlimited posts/day",
                  "approval gate",
                  "engagement learning",
                  "exploit + explore algorithm",
                  "ROI / cost report",
                  "HTTP server + mDNS",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-3 h-3 text-[hsl(30,91%,55%)] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] font-mono mb-2 text-center" style={{ color: "#fb923c" }}>1-day free trial — cancel before day 2, pay nothing</p>
              <button
                onClick={() => openPaddle(paddleId)}
                className="w-full text-sm font-mono py-2.5 rounded font-semibold transition-all flex items-center justify-center gap-2 text-black hover:opacity-90"
                style={{ background: "linear-gradient(90deg,#f59e0b,#fb923c)" }}
              >
                start free trial <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            )}

          </div>

          {/* ── Feature comparison ── */}
          <div className="mb-16">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 text-center">
              feature comparison
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[hsl(215,40%,12%)]">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[hsl(215,40%,12%)]">
                    <th className="text-left px-4 py-3 text-slate-500 font-normal w-56">feature</th>
                    <th className="px-4 py-3 font-semibold text-center text-slate-400">free</th>
                    <th className="px-4 py-3 font-semibold text-center text-[hsl(30,91%,55%)]">pro</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((f, i) => (
                    <tr
                      key={f.name}
                      className={`border-b border-[hsl(215,40%,10%)] ${i % 2 === 0 ? "bg-[hsl(215,60%,5%)]" : ""}`}
                    >
                      <td className="px-4 py-3 flex items-center gap-2 text-slate-300">
                        <span className="text-slate-600">{f.icon}</span>
                        {f.name}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500">
                        {f.free === true ? (
                          <CheckCircle className="w-4 h-4 text-slate-500 mx-auto" />
                        ) : f.free === false ? (
                          <span className="text-slate-800">—</span>
                        ) : (
                          <span>{f.free as string}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-[hsl(30,91%,65%)]">
                        {f.pro === true ? (
                          <CheckCircle className="w-4 h-4 text-[hsl(30,91%,55%)] mx-auto" />
                        ) : f.pro === false ? (
                          <span className="text-slate-800">—</span>
                        ) : (
                          <span>{f.pro as string}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Quick start ── */}
          <div className="mb-16">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6 text-center">
              quick start
            </h2>
            <div className="space-y-2">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="flex items-center gap-4 rounded-lg border border-[hsl(215,40%,12%)] bg-[hsl(215,60%,5%)] px-5 py-3"
                >
                  <span className="text-xs font-mono text-slate-600 w-6 flex-shrink-0">{s.n}</span>
                  <code className="flex-1 text-sm font-mono text-[hsl(30,91%,55%)] truncate">{s.cmd}</code>
                  <span className="text-xs text-slate-600 hidden sm:block flex-shrink-0">{s.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── License info ── */}
          <div className="rounded-xl border border-[hsl(215,40%,12%)] bg-[hsl(215,60%,5%)] p-6 text-center mb-8">
            <Lock className="w-5 h-5 text-slate-500 mx-auto mb-3" />
            <h3 className="font-mono font-semibold text-sm text-slate-200 mb-2">how licensing works</h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              After purchase, an <code className="text-slate-300">ADTO-XXXXX-XXXXX-XXXXX-XXXXX</code> key is emailed.
              Run{" "}<code className="text-slate-300">adauto license activate &lt;key&gt;</code>.
              Validated online once, then stored at{" "}
              <code className="text-slate-300">~/.adauto/license.json</code>. Offline-capable after first activation.
            </p>
            <p className="text-[10px] text-slate-600 mt-3 font-mono">
              adauto v0.1.0 · offline-capable · no telemetry · BYOK DeepSeek
            </p>
          </div>

          {/* ── Cross-sell ── */}
          <div className="rounded-xl border border-[hsl(215,40%,12%)] bg-[hsl(215,60%,5%)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">also from us</p>
              <p className="text-sm text-slate-200 font-mono font-semibold">deepstrain · atlas</p>
              <p className="text-xs text-slate-500 mt-1">autonomous agent + deterministic code intelligence</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/bundle"
                className="text-xs font-mono px-3 py-1.5 rounded border border-[hsl(30,91%,55%)] text-[hsl(30,91%,55%)] hover:bg-[hsl(30,91%,55%)] hover:text-black transition-all"
              >
                bundle — save 20% →
              </Link>
              <Link href="/" className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors">
                all products →
              </Link>
            </div>
          </div>
        </div>

        <MassironFooter />
      </main>
    </>
  );
}
