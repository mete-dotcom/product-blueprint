/**
 * /admin/tiers — admin-only UI to show/hide pricing tiers.
 *
 * Enter the admin key once (kept in memory only, never persisted), then
 * toggle any tier. Changes hit /api/admin/tiers and take effect on the
 * public pricing pages within ~60s (edge cache).
 */

import Head from "next/head";
import { useState } from "react";
import { MassironNav } from "../../components/MassironNav";

type Catalog = Record<string, string[]>;
type Visibility = Record<string, boolean>;

export default function AdminTiers() {
  const [key, setKey]               = useState("");
  const [authed, setAuthed]         = useState(false);
  const [catalog, setCatalog]       = useState<Catalog>({});
  const [visibility, setVisibility] = useState<Visibility>({});
  const [error, setError]           = useState("");
  const [busy, setBusy]             = useState(false);

  async function load() {
    setError(""); setBusy(true);
    try {
      const r = await fetch("/api/admin/tiers", { headers: { "x-admin-key": key } });
      if (r.status === 401) { setError("Wrong admin key"); setBusy(false); return; }
      const d = await r.json();
      setCatalog(d.catalog ?? {});
      setVisibility(d.visibility ?? {});
      setAuthed(true);
    } catch { setError("Failed to load"); }
    setBusy(false);
  }

  async function toggle(product: string, tier: string, visible: boolean) {
    const k = `${product}:${tier}`;
    setVisibility((v) => ({ ...v, [k]: visible })); // optimistic
    try {
      const r = await fetch("/api/admin/tiers", {
        method: "POST",
        headers: { "x-admin-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ product, tier, visible }),
      });
      const d = await r.json();
      if (d.visibility) setVisibility(d.visibility);
    } catch {
      setVisibility((v) => ({ ...v, [k]: !visible })); // revert
      setError("Update failed");
    }
  }

  const isVisible = (product: string, tier: string) => visibility[`${product}:${tier}`] !== false;

  return (
    <>
      <Head><title>Admin · Tier Visibility</title><meta name="robots" content="noindex" /></Head>
      <main className="min-h-screen bg-[#07070b] text-slate-200 font-mono px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold mb-1">Tier Visibility</h1>
          <p className="text-xs text-slate-500 mb-8">Show / hide pricing tiers across all product pages.</p>

          {!authed ? (
            <div className="bg-[#111118] border border-white/10 rounded-xl p-6 max-w-sm">
              <label className="block text-xs text-slate-400 mb-2">Admin key</label>
              <input
                type="password" value={key} onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                className="w-full bg-[#1a1a25] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="x-admin-key"
              />
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              <button
                onClick={load} disabled={busy || !key}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg py-2 text-sm font-semibold transition-colors"
              >
                {busy ? "Loading…" : "Unlock"}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {error && <p className="text-red-400 text-xs">{error}</p>}
              {Object.entries(catalog).map(([product, tiers]) => (
                <div key={product}>
                  <h2 className="text-sm font-semibold text-indigo-400 mb-3 lowercase">{product}</h2>
                  <div className="space-y-2">
                    {tiers.map((tier) => {
                      const visible = isVisible(product, tier);
                      return (
                        <div key={tier} className="flex items-center justify-between bg-[#111118] border border-white/10 rounded-lg px-4 py-3">
                          <span className="text-sm capitalize">{tier}</span>
                          <button
                            onClick={() => toggle(product, tier, !visible)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${visible ? "bg-emerald-600" : "bg-slate-700"}`}
                            aria-label={`toggle ${product} ${tier}`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${visible ? "left-[26px]" : "left-0.5"}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-slate-600">Changes apply to public pricing pages within ~60s (edge cache).</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
