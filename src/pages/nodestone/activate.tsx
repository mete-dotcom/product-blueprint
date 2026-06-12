/**
 * /nodestone/activate
 *
 * Web-based activation for the nodestone CLI.
 * Flow:
 *   1. CLI opens this page with ?session=<id>
 *   2. User logs in (or registers) → existing license pushed to KV
 *   3. Or: user has no license → Lemon Squeezy checkout (buy/{variantId} redirect)
 *   4. CLI polls /api/nodestone/session?id=<id> and writes license locally
 *
 * Payment: Lemon Squeezy (NOT Paddle) — we redirect to {LEMON_STORE}/buy/{variantId}.
 */

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MassironNav } from "../../components/MassironNav";
import { MassironFooter } from "../../components/MassironFooter";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, ArrowRight, Zap, Shield, Lock, Eye, EyeOff } from "lucide-react";

const BASE_MONTHLY = Number(process.env.NEXT_PUBLIC_NODESTONE_PRICE || "7");
const TEAM_MONTHLY = Number(process.env.NEXT_PUBLIC_NODESTONE_TEAM_PRICE || "15");
const CURRENCY     = process.env.NEXT_PUBLIC_NODESTONE_CURRENCY || "USD";
const SYM          = CURRENCY === "USD" ? "$" : CURRENCY;

// ── Billing periods ───────────────────────────────────────────────────────────
type Period = "monthly" | "yearly";

const PRO_YEARLY_PRICE  = 59;
const TEAM_YEARLY_PRICE = 119;

const BILLING: Record<Period, { label: string; badge: string | null }> = {
  monthly: { label: "monthly", badge: null },
  yearly:  { label: "yearly",  badge: "save 30%" },
};
const PERIODS: Period[] = ["monthly", "yearly"];

// ── Lemon Squeezy variant map ─────────────────────────────────────────────────
// TODO: replace the fallback placeholder ids with real Lemon Squeezy variant IDs
// once the nodestone products exist in the store. Set them via NEXT_PUBLIC_NS_* env.
const LEMON_STORE   = process.env.NEXT_PUBLIC_LEMON_STORE || "massiron.lemonsqueezy.com";
const LS_VARIANTS: Record<string, string> = {
  pro_monthly:  process.env.NEXT_PUBLIC_NS_PRO_MONTHLY  || "ls_ns_pro_m",
  pro_yearly:   process.env.NEXT_PUBLIC_NS_PRO_YEARLY   || "ls_ns_pro_y",
  team_monthly: process.env.NEXT_PUBLIC_NS_TEAM_MONTHLY || "ls_ns_team_m",
  team_yearly:  process.env.NEXT_PUBLIC_NS_TEAM_YEARLY  || "ls_ns_team_y",
};

// ── Stages ───────────────────────────────────────────────────────────────────
type Stage = "auth" | "checkout" | "processing" | "done";

export default function NodestoneActivate() {
  const router  = useRouter();
  const session = (router.query.session as string) || "";
  const billingParam = (router.query.billing as string) || "monthly";
  const tierParam    = (router.query.tier    as string) || "pro";

  // ── Auth state ────────────────────────────────────────────────────────────
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [authErr,  setAuthErr]  = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // ── Checkout state ────────────────────────────────────────────────────────
  const [stage,  setStage]  = useState<Stage>("auth");
  const [period, setPeriod] = useState<Period>(
    (PERIODS.includes(billingParam as Period) ? billingParam : "monthly") as Period
  );

  // ── Activation state ──────────────────────────────────────────────────────
  const [alreadyActivated, setAlreadyActivated] = useState(false); // skipped checkout

  const plan     = BILLING[period];
  const tier     = tierParam === "team" ? "team" : "pro";
  const price    = period === "monthly"
    ? (tier === "team" ? TEAM_MONTHLY : BASE_MONTHLY)
    : (tier === "team" ? Math.round(TEAM_YEARLY_PRICE / 12) : Math.round(PRO_YEARLY_PRICE / 12));
  const savings  = plan.badge
    ? `${plan.badge} — billed ${SYM}${tier === "team" ? TEAM_YEARLY_PRICE : PRO_YEARLY_PRICE} yearly`
    : null;

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => { emailRef.current?.focus(); }, []);

  // ── Auth submit ───────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setAuthErr("Email and password are required."); return; }
    if (password.length < 8) { setAuthErr("Password must be at least 8 characters."); return; }

    setAuthErr("");
    setAuthBusy(true);
    try {
      const res = await fetch("/api/nodestone/activate-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, session }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 401 = wrong password for existing account
        setAuthErr(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.status === "activated") {
        // Existing user with active license — CLI is already activating via KV poll
        setAlreadyActivated(true);
        setStage("done");
      } else {
        // needs_payment / expired — proceed to Lemon Squeezy checkout
        setStage("checkout");
      }
    } catch {
      setAuthErr("Network error. Please check your connection and try again.");
    } finally {
      setAuthBusy(false);
    }
  };

  // ── Lemon Squeezy checkout ───────────────────────────────────────────────
  const handleCheckout = () => {
    const variantId = LS_VARIANTS[`${tier}_${period}`] || LS_VARIANTS["pro_monthly"];
    if (!variantId) return;

    const params = new URLSearchParams();
    if (email)   params.set("checkout[email]",            email);
    if (session) params.set("checkout[custom][session]",  session);
    params.set("checkout[custom][product]", "nodestone");

    window.location.href = `https://${LEMON_STORE}/buy/${variantId}?${params.toString()}`;
  };

  return (
    <>
      <Head>
        <title>activate nodestone — massiron</title>
        <meta name="description" content="Activate your nodestone license." />
      </Head>

      <MassironNav activeProduct="nodestone" />

      <section className="min-h-screen pt-24 pb-24 bg-[#030712] flex items-center justify-center relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-sky-500/5 rounded-full blur-[120px]" />

        <div className="relative z-10 w-full max-w-md mx-auto px-4">

          {/* ── AUTH STAGE ── */}
          {stage === "auth" && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-300 text-xs font-mono mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  terminal activation
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  activate <span className="text-sky-400">nodestone</span>
                </h1>
                <p className="text-gray-400 text-sm">
                  create an account or sign in — your terminal activates automatically.
                </p>
                {session && (
                  <p className="mt-2 text-xs text-gray-600 font-mono">
                    session: {session.slice(0, 8)}…
                  </p>
                )}
              </div>

              <form onSubmit={handleAuth} className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-mono">
                    email
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/60 focus:bg-white/8 transition-all text-sm"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-mono">
                    password
                    <span className="text-gray-600 font-normal ml-1">(min 8 chars)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="at least 8 characters"
                      className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/60 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {authErr && (
                  <p className="text-red-400 text-sm font-mono bg-red-500/10 px-4 py-2.5 rounded-lg border border-red-500/20">
                    {authErr}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 disabled:cursor-wait text-white font-semibold rounded-xl transition-all duration-200 group"
                >
                  {authBusy ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      checking…
                    </>
                  ) : (
                    <>
                      continue
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-600">
                  new here? we&apos;ll create your account automatically.
                  <br />
                  already a member? just log in — no re-registration needed.
                </p>
              </form>

              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600 font-mono">
                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-sky-600" />secure</span>
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-sky-600" />local memory</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-sky-600" />auto-activates</span>
              </div>
            </>
          )}

          {/* ── CHECKOUT STAGE ── */}
          {stage === "checkout" && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-300 text-xs font-mono mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  choose a plan
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  unlock <span className="text-sky-400">persistent memory</span>
                </h1>
                <p className="text-gray-400 text-sm">
                  signed in as <span className="text-sky-400 font-mono">{email}</span>
                </p>
              </div>

              {/* Billing toggle */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex flex-wrap justify-center p-1 rounded-xl bg-white/5 border border-white/10 gap-1">
                  {PERIODS.map((p) => {
                    const b = BILLING[p];
                    return (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`relative px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          period === p
                            ? "bg-sky-600 text-white"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {b.label}
                        {b.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 whitespace-nowrap hidden sm:inline">
                            {b.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plan card */}
              <div className="rounded-2xl border-2 border-sky-500/30 bg-white/[0.02] p-8 shadow-2xl shadow-sky-500/10 mb-6">
                <p className="font-mono text-xs text-sky-400 uppercase tracking-widest mb-3 capitalize">{tier} plan</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-xl text-gray-400 font-light mb-1">{SYM}</span>
                  <span className="text-6xl font-bold text-white leading-none">{price}</span>
                  <span className="text-gray-400 mb-2">/mo{tier === "team" ? " per seat" : ""}</span>
                </div>
                {savings && <p className="text-green-400 text-xs font-mono mb-4">{savings}</p>}
                {!savings && (
                  <p className="text-gray-600 text-xs font-mono mb-4">billed monthly · cancel anytime</p>
                )}

                <ul className="space-y-2 mb-7">
                  {(tier === "team"
                    ? ["everything in Pro", "shared team memory", "HTTP MCP — LAN & VPN", "concurrent clients", "seat-based billing"]
                    : ["unlimited project memories", "semantic recall", "auto-summarized history", "MCP server (any host)", "local-first · HMAC-signed"]
                  ).map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <Zap className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleCheckout}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition-all duration-200 group"
                >
                  pay {SYM}{period === "monthly" ? price : (tier === "team" ? TEAM_YEARLY_PRICE : PRO_YEARLY_PRICE)}
                  {period === "monthly" ? "/mo" : "/yr"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-gray-600 font-mono">
                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-sky-600" />secure checkout</span>
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-sky-600" />cancel anytime</span>
              </div>
            </>
          )}

          {/* ── PROCESSING STAGE ── */}
          {stage === "processing" && (
            <div className="text-center rounded-2xl border border-white/10 bg-white/[0.02] p-12">
              <div className="w-12 h-12 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-white mb-2">processing payment</h2>
              <p className="text-gray-400 text-sm">generating your license…</p>
            </div>
          )}

          {/* ── DONE STAGE ── */}
          {stage === "done" && (
            <div className="text-center rounded-2xl border border-white/10 bg-white/[0.02] p-12">
              <CheckCircle className="w-16 h-16 text-sky-400 mx-auto mb-6" />

              {alreadyActivated ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-3">welcome back!</h2>
                  <p className="text-gray-300 text-sm mb-6">
                    your license is active. your terminal is activating now.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-3">payment confirmed</h2>
                  <p className="text-gray-300 text-sm mb-6">
                    your terminal is activating automatically.
                  </p>
                </>
              )}

              {session ? (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 font-mono text-sm text-left mb-6">
                    <div className="text-gray-500 mb-1">terminal output:</div>
                    <div className="text-sky-400">. . . . . . . .</div>
                    <div className="text-green-400 mt-1">✓ nodestone activated!</div>
                  </div>
                  <p className="text-xs text-gray-600">
                    if the terminal is still waiting, press{" "}
                    <code className="text-sky-400">Ctrl+C</code> and run{" "}
                    <code className="text-sky-400">nodestone init</code> again.
                  </p>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 font-mono text-sm text-left mb-6">
                    <div className="text-gray-500 mb-1">run in your terminal:</div>
                    <div className="text-sky-400 mt-1">$ nodestone init</div>
                    <div className="text-green-400 mt-1">✓ activates automatically</div>
                  </div>
                  <p className="text-xs text-gray-600">
                    no key to copy — nodestone detects your account automatically.
                  </p>
                </>
              )}
              <p className="mt-6">
                <Link href="/nodestone/docs" className="text-sky-400 hover:text-sky-300 text-xs font-mono">read the docs →</Link>
              </p>
            </div>
          )}

        </div>
      </section>

      <MassironFooter />
    </>
  );
}
