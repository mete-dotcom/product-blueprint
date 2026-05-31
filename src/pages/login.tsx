import Head from "next/head";
import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Login failed"); return; }
      localStorage.setItem("deepstrain_token", data.token);
      localStorage.setItem("deepstrain_user",  JSON.stringify(data.user));
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In — deepstrain</title>
      </Head>

      <div className="min-h-screen flex flex-col" style={{ background: "#010d1a" }}>

        {/* Nav */}
        <nav className="border-b border-white/5" style={{ background: "rgba(1,13,26,0.92)", backdropFilter: "blur(18px)" }}>
          <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 font-mono text-sm font-semibold select-none">
              <span className="text-strain-500">▸</span>
              <span className="gradient-text tracking-tight">deepstrain</span>
            </Link>
            <Link href="/register" className="font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors">
              create account →
            </Link>
          </div>
        </nav>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-sm">

            {/* Header */}
            <div className="mb-8">
              <p className="font-mono text-xs text-slate-600 tracking-[0.2em] uppercase mb-3">account access</p>
              <h1 className="font-mono font-black text-white tracking-tight mb-2"
                  style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", lineHeight: 1.1 }}>
                sign in
              </h1>
              <p className="font-mono text-xs text-slate-500">
                manage your license · activate deepstrain · access dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 border border-red-500/20 rounded-lg flex items-start gap-2.5"
                   style={{ background: "rgba(239,68,68,0.06)" }}>
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-500 mb-2 uppercase tracking-wider">
                  email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-white/8 rounded-lg text-white text-sm font-mono placeholder-slate-700 focus:outline-none focus:border-white/25 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-500 mb-2 uppercase tracking-wider">
                  password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 border border-white/8 rounded-lg text-white text-sm font-mono placeholder-slate-700 focus:outline-none focus:border-white/25 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-3 bg-white hover:bg-slate-100 text-black font-mono font-semibold text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border border-black/30 border-t-black/80 rounded-full animate-spin" />
                    signing in...
                  </span>
                ) : (
                  <>
                    sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 font-mono text-xs text-slate-600 text-center">
              no account?{" "}
              <Link href="/register" className="text-slate-400 hover:text-white transition-colors">
                create one
              </Link>
              {" "}·{" "}
              <Link href="/deepstrain/pricing" className="text-slate-400 hover:text-white transition-colors">
                pricing
              </Link>
            </div>

          </div>
        </div>

        <footer className="py-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-5 text-center font-mono text-xs text-slate-800">
            © {new Date().getFullYear()} deepstrain · atlas · adauto
          </div>
        </footer>
      </div>
    </>
  );
}
