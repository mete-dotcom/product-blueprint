/**
 * POST /api/track
 * { path, ref? }
 *
 * Founder visit-notification endpoint.
 * - Only fires for high-intent pages (pricing, bundle, register, activate)
 * - Per-path KV debounce: 2 hours (so one session doesn't flood inbox)
 * - Global hourly cap: 8 emails/hour across all paths
 * - Sends mobile-friendly Resend email to FOUNDER_NOTIFY_EMAIL
 * - Always returns 200 immediately — never blocks the client
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

const RESEND_KEY    = process.env.RESEND_API_KEY          || "";
const FOUNDER_EMAIL = process.env.FOUNDER_NOTIFY_EMAIL    || "";
const FROM_EMAIL    = process.env.ATLAS_FROM_EMAIL        || "noreply@atlas.tools";
const HOURLY_CAP    = 8;

// Paths that signal real buying intent
const INTENT_PATHS: Record<string, string> = {
  "/":                 "deepstrain — home",
  "/pricing":          "deepstrain — pricing",
  "/atlas":            "atlas — home",
  "/atlas/pricing":    "atlas — pricing",
  "/bundle":           "bundle page",
  "/register":         "register",
  "/login":            "login",
  "/atlas/activate":   "atlas — activate",
  "/activate":         "deepstrain — activate",
  "/atlas/dashboard":  "atlas — dashboard",
  "/dashboard":        "deepstrain — dashboard",
};

// Product badge colours (inline styles, email-safe)
const PRODUCT_COLOR: Record<string, string> = {
  atlas:      "#6366f1",
  deepstrain: "#06b6d4",
  bundle:     "#f59e0b",
  auth:       "#64748b",
};

function productFor(path: string): keyof typeof PRODUCT_COLOR {
  if (path.startsWith("/atlas"))   return "atlas";
  if (path === "/bundle")          return "bundle";
  if (["/login","/register"].includes(path)) return "auth";
  return "deepstrain";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Always respond immediately — tracking must never delay the page
  res.status(200).json({ ok: true });

  if (req.method !== "POST") return;
  if (!RESEND_KEY || !FOUNDER_EMAIL) return;

  const rawPath  = String(req.body?.path  ?? "/");
  const ref      = String(req.body?.ref   ?? "");
  const cleanPath = rawPath.split("?")[0].toLowerCase();

  const label = INTENT_PATHS[cleanPath];
  if (!label) return; // not a page we care about

  try {
    // ── Per-path debounce: 2 hours ──────────────────────────────────────────
    const pathKey = `track:p:${cleanPath.replace(/\//g, "_")}`;
    const seen    = await kv.get(pathKey);
    if (seen) return;

    // ── Global hourly cap ───────────────────────────────────────────────────
    const hourTag = `track:h:${new Date().toISOString().slice(0, 13)}`; // "2026-05-27T10"
    const count   = await kv.incr(hourTag);
    if (count === 1) await kv.expire(hourTag, 3600);
    if (count > HOURLY_CAP) return;

    // Set debounce AFTER passing the cap check (so cap doesn't burn debounce slots)
    await kv.set(pathKey, 1, { ex: 7200 });

    // ── Build email ─────────────────────────────────────────────────────────
    const product = productFor(cleanPath);
    const color   = PRODUCT_COLOR[product];
    const trTime  = new Date().toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      dateStyle: "short",
      timeStyle: "short",
    });

    const refRow = ref && ref !== "direct"
      ? `<tr><td style="color:#94a3b8;font-size:12px;padding:4px 0">from</td>
         <td style="font-size:12px;padding:4px 0 4px 12px;color:#e2e8f0">${ref.slice(0, 80)}</td></tr>`
      : "";

    const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0f172a;font-family:system-ui,-apple-system,sans-serif">
<div style="max-width:420px;margin:0 auto;padding:24px 16px">

  <!-- badge -->
  <div style="display:inline-block;background:${color}22;border:1px solid ${color}55;
              border-radius:999px;padding:3px 12px;font-size:11px;color:${color};
              letter-spacing:.08em;text-transform:uppercase;font-weight:600;margin-bottom:16px">
    ${product}
  </div>

  <!-- headline -->
  <h1 style="margin:0 0 4px;font-size:20px;color:#f1f5f9;line-height:1.3">
    👀 someone's on <span style="color:${color}">${label.split(" — ")[1] || label}</span>
  </h1>
  <p style="margin:0 0 20px;font-size:13px;color:#64748b">${trTime} TR</p>

  <!-- detail table -->
  <table style="width:100%;border-collapse:collapse;background:#1e293b;
                border-radius:10px;overflow:hidden;border:1px solid #334155">
    <tr style="border-bottom:1px solid #334155">
      <td style="color:#94a3b8;font-size:12px;padding:10px 14px">page</td>
      <td style="font-size:13px;padding:10px 14px;color:#e2e8f0;font-family:monospace">${cleanPath}</td>
    </tr>
    ${refRow}
    <tr>
      <td style="color:#94a3b8;font-size:12px;padding:10px 14px">cooldown</td>
      <td style="font-size:12px;padding:10px 14px;color:#64748b">2h (no repeat spam)</td>
    </tr>
  </table>

  <p style="margin:20px 0 0;font-size:11px;color:#334155;text-align:center">
    deepstrain + atlas · visitor alert · auto-debounced
  </p>
</div>
</body></html>`;

    await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body:    JSON.stringify({
        from:    FROM_EMAIL,
        to:      [FOUNDER_EMAIL],
        subject: `👀 ${label} — ${trTime}`,
        html,
      }),
    });
  } catch {
    // Silently ignore — tracking must never cause errors the user sees
  }
}
