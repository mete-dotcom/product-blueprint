import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MassironNav } from "../components/MassironNav";
import { MassironFooter } from "../components/MassironFooter";
import { useEffect, useRef, useState } from "react";
import { Terminal, CheckCircle, ArrowRight, Zap, Shield, Lock, Eye, EyeOff } from "lucide-react";

declare global {
  interface Window { Paddle: any; }
}

const BASE_MONTHLY = Number(process.env.NEXT_PUBLIC_DEEPSTRAIN_PRICE || "9");
const CURRENCY     = process.env.NEXT_PUBLIC_DEEPSTRAIN_CURRENCY || "USD";
const SYM          = CURRENCY === "USD" ? "$" : CURRENCY;

// ── Billing periods ───────────────────────────────────────────────────────────
type Period = "monthly" | "yearly";

const SOLO_YEARLY_PRICE = 69;
const TEAM_YEARLY_PRICE = 119;

const BILLING: Record<Period, { label: string; badge: string | null }> = {
  monthly: { label: "monthly", badge: null },
  yearly:  { label: "yearly",  badge: "save 36%" },
};
const PERIODS: Period[] = ["monthly", "yearly"];

// ── Lemon Squeezy variant map ─────────────────────────────────────────────────
const LEMON_STORE   = process.env.NEXT_PUBLIC_LEMON_STORE || "massiron.lemonsqueezy.com";
const LS_VARIANTS: Record<string, string> = {
  solo_monthly: process.env.NEXT_PUBLIC_DS_SOLO_MONTHLY || "",
  solo_yearly:  process.env.NEXT_PUBLIC_DS_SOLO_YEARLY  || "",
  team_monthly: process.env.NEXT_PUBLIC_DS_TEAM_MONTHLY || "",
  team_yearly:  process.env.NEXT_PUBLIC_DS_TEAM_YEARLY  || "",
};

// ── Stages ───────────────────────────────────────────────────────────────────
type Stage = "auth" | "checkout" | "processing" | "done";

export default function Activate() {
  const router  = useRouter();
  const session = (router.query.session as string) || "";
  // pricing page may pass billing period via ?billing=quarterly and tier via ?tier=team
  const billingParam = (router.query.billing as string) || "monthly";
  const tierParam    = (router.query.tier    as string) || "solo";

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
  const tier     = tierParam === "team" ? "team" : "solo";
  const price    = period === "monthly"
    ? (tier === "team" ? 15 : BASE_MONTHLY)
    : (tier === "team" ? Math.round(TEAM_YEARLY_PRICE / 12) : Math.round(SOLO_YEARLY_PRICE / 12));
  const savings  = plan.badge
    ? `${plan.badge} — billed ${SYM}${tier === "team" ? TEAM_YEARLY_PRICE : SOLO_YEARLY_PRICE} yearly`
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
      const res = await fetch("/api/activate-session", {
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
        // needs_payment — proceed to Paddle checkout
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
    const tier      = tierParam === "team" ? "team" : "solo";
    const variantId = LS_VARIANTS[`${tier}_${period}`] || LS_VARIANTS["solo_monthly"];
    if (!variantId) return;

    const params = new URLSearchParams();
    if (email)   params.set("checkout[email]",            email);
    if (session) params.set("checkout[custom][session]",  session);
    params.set("checkout[custom][product]", "deepstrain");

    window.location.href = `https://${LEMON_STORE}/buy/${variantId}?${params.toString()}`;
  };

  return (
    <>
      <Head>
        <title>activate deepstrain — massiron</title>
        <meta name="description" content="Activate your deepstrain professional license." />
      </Head>

      <MassironNav />

      <section className="min-h-screen pt-24 pb-24 bg-[#030712] flex items-center justify-center relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-strain-500/5 rounded-full blur-[120px]" />

        <div className="relative z-10 w-full max-w-md mx-auto px-4">

          {/* ── AUTH STAGE ── */}
          {stage === "auth" && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-strain-500/15 border border-strain-500/25 text-strain-300 text-xs font-mono mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-strain-400 animate-pulse" />
                  terminal activation
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  activate <span className="text-strain-400">deepstrain</span>
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

              <form onSubmit={handleAuth} className="glass p-8 space-y-5">
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-strain-500/60 focus:bg-white/8 transition-all text-sm"
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
                      className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-strain-500/60 transition-all text-sm"
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
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-strain-600 hover:bg-strain-500 disabled:opacity-60 disabled:cursor-wait text-white font-semibold rounded-xl transition-all duration-200 glow group"
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
                  new here? we'll create your account automatically.
                  <br />
                  already a member? just log in — no re-registration needed.
                </p>
              </form>

              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600 font-mono">
                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-strain-600" />secure</span>
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-strain-600" />no sharing</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-strain-600" />auto-activates</span>
              </div>
            </>
          )}

          {/* ── CHECKOUT STAGE ── */}
          {stage === "checkout" && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-strain-500/15 border border-strain-500/25 text-strain-300 text-xs font-mono mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-strain-400 animate-pulse" />
                  choose a plan
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  unlock <span className="text-strain-400">52 tools</span>
                </h1>
                <p className="text-gray-400 text-sm">
                  signed in as <span className="text-strain-400 font-mono">{email}</span>
                </p>
              </div>

              {/* Billing toggle — 4 options */}
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
                            ? "bg-strain-600 text-white"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {b.label}
                        {b.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-strain-400/20 text-strain-300 whitespace-nowrap hidden sm:inline">
                            {b.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plan card */}
              <div className="glass p-8 ring-2 ring-strain-500/30 shadow-2xl shadow-strain-500/10 mb-6">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-xl text-gray-400 font-light mb-1">{SYM}</span>
                  <span className="text-6xl font-bold text-white leading-none">{price}</span>
                  <span className="text-gray-400 mb-2">/mo</span>
                </div>
                {savings && <p className="text-green-400 text-xs font-mono mb-4">{savings}</p>}
                {!savings && (
                  <p className="text-gray-600 text-xs font-mono mb-4">billed monthly · cancel anytime</p>
                )}

                <ul className="space-y-2 mb-7">
                  {[
                    "51 AI tools + sub-agents",
                    "surgical code editing",
                    "byok deepseek api",
                    "offline execution token",
                    "7-day grace period",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <Zap className="w-3.5 h-3.5 text-strain-400 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleCheckout}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-strain-600 hover:bg-strain-500 text-white font-semibold rounded-xl transition-all duration-200 glow group"
                >
                  pay {SYM}{period === "monthly" ? price : (tier === "team" ? TEAM_YEARLY_PRICE : SOLO_YEARLY_PRICE)}
                  {period === "monthly" ? "/mo" : "/yr"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-gray-600 font-mono">
                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-strain-600" />secure checkout</span>
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-strain-600" />cancel anytime</span>
              </div>
            </>
          )}

          {/* ── PROCESSING STAGE ── */}
          {stage === "processing" && (
            <div className="text-center glass p-12">
              <div className="w-12 h-12 border-2 border-strain-500/30 border-t-strain-400 rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-white mb-2">processing payment</h2>
              <p className="text-gray-400 text-sm">generating your license…</p>
            </div>
          )}

          {/* ── DONE STAGE ── */}
          {stage === "done" && (
            <div className="text-center glass p-12">
              <CheckCircle className="w-16 h-16 text-strain-400 mx-auto mb-6" />

              {alreadyActivated ? (
                // Returning user — had an active license, no payment needed
                <>
                  <h2 className="text-2xl font-bold text-white mb-3">welcome back!</h2>
                  <p className="text-gray-300 text-sm mb-6">
                    your license is active. your terminal is activating now.
                  </p>
                </>
              ) : (
                // New payment confirmed
                <>
                  <h2 className="text-2xl font-bold text-white mb-3">payment confirmed</h2>
                  <p className="text-gray-300 text-sm mb-6">
                    your terminal is activating automatically.
                  </p>
                </>
              )}

              {session ? (
                /* CLI-first: terminal is polling → will auto-activate */
                <>
                  <div className="glass p-4 font-mono text-sm text-left mb-6">
                    <div className="text-gray-500 mb-1">terminal output:</div>
                    <div className="text-strain-400">. . . . . . . .</div>
                    <div className="text-green-400 mt-1">✓ deepstrain pro activated!</div>
                  </div>
                  <p className="text-xs text-gray-600">
                    if the terminal is still waiting, press{" "}
                    <code className="text-strain-400">Ctrl+C</code> and run{" "}
                    <code className="text-strain-400">deepstrain chat</code> again.
                  </p>
                </>
              ) : (
                /* Web-first: no terminal was polling */
                <>
                  <div className="glass p-4 font-mono text-sm text-left mb-6">
                    <div className="text-gray-500 mb-1">run in your terminal:</div>
                    <div className="text-strain-400 mt-1">$ deepstrain chat</div>
                    <div className="text-green-400 mt-1">✓ activates automatically</div>
                  </div>
                  <p className="text-xs text-gray-600">
                    no key to copy — deepstrain detects your account automatically.
                  </p>
                </>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
