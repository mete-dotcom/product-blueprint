/**
 * /atlas/activate
 *
 * Web-based activation for the ATLAS CLI.
 * Flow:
 *   1. CLI opens this page with ?session=<id>
 *   2. User logs in (or registers) → existing license pushed to KV
 *   3. Or: user clicks Checkout → Paddle → webhook stores license
 *   4. CLI polls /api/atlas/session?id=<id> and writes license locally
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

type Stage = "auth" | "checking" | "checkout" | "polling" | "done" | "error";

export default function AtlasActivate() {
  const router = useRouter();
  const sessionId = useRef<string>("");
  const cliMode = useRef(false);

  const [stage, setStage] = useState<Stage>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [modules, setModules] = useState<string[]>([]);
  const [tier, setTier] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const s = String(router.query.session ?? "");
    if (s) {
      sessionId.current = s;
      cliMode.current = true;
    }
  }, [router.isReady, router.query.session]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStage("checking");

    const r = await fetch("/api/atlas/activate-cli", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();

    if (data.success) {
      setModules(data.license?.modules ?? []);
      setTier(data.license?.tier ?? "");
      if (cliMode.current) {
        // Push to KV so CLI can pick up
        await fetch("/api/atlas/activate-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, session: sessionId.current }),
        });
        setStage("polling");
        pollForCLI();
      } else {
        setStage("done");
      }
    } else if (data.error?.includes("no active") || data.error?.includes("expired")) {
      setStage("checkout");
    } else {
      setError(data.error ?? "Login failed");
      setStage("auth");
    }
  }

  // ── CLI polling ───────────────────────────────────────────────────────────
  function pollForCLI() {
    if (!cliMode.current) return;
    const id = sessionId.current;
    let attempts = 0;
    const iv = setInterval(async () => {
      attempts++;
      if (attempts > 150) { clearInterval(iv); setStage("error"); return; }
      try {
        const r = await fetch(`/api/atlas/session?id=${id}`);
        const d = await r.json();
        if (d.status === "ready") { clearInterval(iv); setStage("done"); }
      } catch { /* ignore */ }
    }, 2000);
  }

  // ── Paddle checkout ───────────────────────────────────────────────────────
  function openCheckout(priceId: string) {
    if (!priceId) {
      setError("Checkout unavailable — contact support@atlas.tools");
      return;
    }
    const w = window as unknown as { Paddle?: { Checkout?: { open: (o: object) => void } } };
    w.Paddle?.Checkout?.open({
      items: [{ priceId, quantity: 1 }],
      customData: { session: sessionId.current, product: "atlas", email },
      successUrl: `${window.location.origin}/atlas/activate?session=${sessionId.current}&done=1`,
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>ATLAS Activate</title>
        {process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && (
          <script
            src="https://cdn.paddle.com/paddle/v2/paddle.js"
            onLoad={() => {
              const w = window as unknown as { Paddle?: { Environment?: { set: (e: string) => void }; Initialize: (o: object) => void } };
              if (process.env.NEXT_PUBLIC_PADDLE_SANDBOX === "true")
                w.Paddle?.Environment?.set("sandbox");
              w.Paddle?.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });
            }}
          />
        )}
      </Head>
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">A</div>
              <span className="text-white font-semibold text-xl">ATLAS</span>
            </div>
            {cliMode.current && (
              <span className="block text-xs text-indigo-400 bg-indigo-950 border border-indigo-800 rounded-full px-3 py-1 inline-block mt-1">
                CLI mode — license will be sent to your terminal
              </span>
            )}
          </div>

          {/* ── Stage: auth ── */}
          {(stage === "auth" || stage === "checking") && (
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
              <h2 className="text-white text-lg font-semibold mb-1">Sign in to activate</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your atlas.tools credentials</p>
              <form onSubmit={handleAuth} className="space-y-4">
                <input
                  type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1a25] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="password" placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1a25] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit" disabled={stage === "checking"}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  {stage === "checking" ? "Checking…" : "Continue"}
                </button>
              </form>
              <p className="text-center text-slate-500 text-xs mt-4">
                No account?{" "}
                <a href="/register" className="text-indigo-400 hover:text-indigo-300">Create one free</a>
              </p>
            </div>
          )}

          {/* ── Stage: checkout ── */}
          {stage === "checkout" && (
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
              <h2 className="text-white text-lg font-semibold mb-1">Choose your plan</h2>
              <p className="text-slate-400 text-sm mb-6">
                Core module is always free. Unlock additional modules with a subscription.
              </p>
              <div className="space-y-3">
                {/* Prices pulled from env at build time — NEXT_PUBLIC_ vars are inlined by Next.js */}
                {([
                  {
                    label: "Solo",
                    price: `$${process.env.NEXT_PUBLIC_ATLAS_PRICE ?? "19"}/mo`,
                    desc:  "Core Engine · System Map",
                    id:    process.env.NEXT_PUBLIC_ATLAS_SOLO_MONTHLY ?? "",
                  },
                  {
                    label: "Pro",
                    price: `$${String(Number(process.env.NEXT_PUBLIC_ATLAS_PRICE ?? "19") * 2)}/mo`,
                    desc:  "Solo + Risk Radar · Security Shield · Code Health · Signal Map · MCP Server",
                    id:    process.env.NEXT_PUBLIC_ATLAS_PRO_MONTHLY ?? "",
                  },
                  {
                    label: "Enterprise",
                    price: `$${String(Number(process.env.NEXT_PUBLIC_ATLAS_PRICE ?? "19") * 4)}/mo`,
                    desc:  "Pro + Decision Center · Ownership Map · Rewind · What-If · Commit Guard",
                    id:    process.env.NEXT_PUBLIC_ATLAS_ENT_MONTHLY ?? "",
                  },
                ] as { label: string; price: string; desc: string; id: string }[]).map((plan) => (
                  <button
                    key={plan.label}
                    onClick={() => openCheckout(plan.id)}
                    className="w-full text-left bg-[#1a1a25] hover:bg-[#22222f] border border-white/10 hover:border-indigo-500/50 rounded-xl p-4 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{plan.label}</span>
                      <span className="text-indigo-400 font-semibold">{plan.price}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{plan.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-center mt-4">
                <a href="/atlas/pricing" className="text-indigo-400 hover:text-indigo-300 text-xs">
                  See full pricing →
                </a>
              </p>
            </div>
          )}

          {/* ── Stage: polling ── */}
          {stage === "polling" && (
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-white font-semibold mb-2">Sending to terminal…</h2>
              <p className="text-slate-400 text-sm">Your license is being delivered to the CLI.</p>
            </div>
          )}

          {/* ── Stage: done ── */}
          {stage === "done" && (
            <div className="bg-[#111118] border border-emerald-800/40 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white font-semibold mb-2">
                {cliMode.current ? "License sent to terminal ✓" : "Activated ✓"}
              </h2>
              {tier && <p className="text-emerald-400 text-sm mb-1 capitalize">{tier} plan</p>}
              {modules.length > 0 && (
                <p className="text-slate-500 text-xs">{modules.join(" · ")}</p>
              )}
              {!cliMode.current && (
                <p className="text-slate-400 text-sm mt-4">
                  Run <code className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300">atlas scan .</code> to start
                </p>
              )}
            </div>
          )}

          {/* ── Stage: error ── */}
          {stage === "error" && (
            <div className="bg-[#111118] border border-red-800/40 rounded-2xl p-8 text-center">
              <p className="text-red-400 font-semibold mb-2">Session expired</p>
              <p className="text-slate-400 text-sm mb-4">Run <code className="bg-slate-800 px-2 py-0.5 rounded">atlas activate</code> again</p>
              <button onClick={() => setStage("auth")} className="text-indigo-400 hover:text-indigo-300 text-sm">
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
