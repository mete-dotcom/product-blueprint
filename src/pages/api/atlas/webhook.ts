/**
 * POST /api/atlas/webhook
 *
 * Lemon Squeezy webhook → Atlas HMAC-signed license → KV + Resend email.
 * Tier/modules are resolved from the Lemon Squeezy variant_id.
 * If custom_data.session is present, also stores in atlas:act:{session}
 * so the CLI polling loop can pick it up immediately.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { setAtlasLicense, setAtlasActivation, getAtlasLicense } from "../../../lib/store";
import type { AtlasLicense } from "../../../lib/store";
import { fromEmail, productUrl, SUPPORT_EMAIL } from "../../../lib/site";
import {
  readRawBody, verifyLemonSignature, parseLemonEvent,
  isIssueEvent, isExpireEvent, LEMON_WEBHOOK_SECRET,
} from "../../../lib/lemonsqueezy";

// Raw bytes required for Lemon Squeezy X-Signature verification
export const config = { api: { bodyParser: false } };

const ATLAS_SECRET = process.env.ATLAS_LICENSE_SECRET || "atlas-dev-secret-do-not-use-in-production";
const RESEND_KEY   = process.env.RESEND_API_KEY       || "";
const FROM_EMAIL   = fromEmail("atlas");
const NOTIFY_EMAIL = process.env.FOUNDER_NOTIFY_EMAIL || "";
const LICENSE_DAYS = 35;

// Module lists aligned with /atlas/pricing.tsx tier definitions
const MODULES_SOLO       = ["core", "system_map"];
const MODULES_PRO        = ["core", "system_map", "risk_radar", "security_shield", "code_health", "signal_map", "atlas_mcp"];
const MODULES_ENTERPRISE = [...MODULES_PRO, "decision_center", "ownership_map", "rewind", "what_if", "commit_guard"];

// Map Lemon Squeezy variant_id → module set
const VARIANT_MODULES: Record<string, string[]> = {
  [process.env.NEXT_PUBLIC_ATLAS_SOLO_MONTHLY || "ls_atlas_solo_m"]: MODULES_SOLO,
  [process.env.NEXT_PUBLIC_ATLAS_SOLO_YEARLY  || "ls_atlas_solo_y"]: MODULES_SOLO,
  [process.env.NEXT_PUBLIC_ATLAS_PRO_MONTHLY  || "ls_atlas_pro_m"]:  MODULES_PRO,
  [process.env.NEXT_PUBLIC_ATLAS_PRO_YEARLY   || "ls_atlas_pro_y"]:  MODULES_PRO,
  [process.env.NEXT_PUBLIC_ATLAS_ENT_MONTHLY  || "ls_atlas_ent_m"]:  MODULES_ENTERPRISE,
  [process.env.NEXT_PUBLIC_ATLAS_ENT_YEARLY   || "ls_atlas_ent_y"]:  MODULES_ENTERPRISE,
};

function resolveModules(variantId: string, variantName = "", productName = ""): string[] {
  if (variantId && VARIANT_MODULES[variantId]) return VARIANT_MODULES[variantId];
  const n = `${variantName} ${productName}`.toLowerCase();
  if (n.includes("enterprise")) return MODULES_ENTERPRISE;
  if (n.includes("pro"))        return MODULES_PRO;
  return MODULES_SOLO;
}

function tierForModules(modules: string[]): string {
  if (modules.includes("commit_guard")) return "enterprise";
  if (modules.length >= 6)              return "pro";
  if (modules.length > 1)               return "solo";
  return "free";
}

function generateLicense(
  email: string, modules: string[], tier: string,
  saleId: string, subscriptionId = "",
): AtlasLicense {
  const now     = new Date();
  const expires = new Date(now.getTime() + LICENSE_DAYS * 86400000);

  const payload: Omit<AtlasLicense, "signature"> = {
    version:         "1.0",
    email,
    tier,
    modules:         [...modules].sort(),
    sale_id:         saleId,
    subscription_id: subscriptionId,
    issued_at:       now.toISOString(),
    expires_at:      expires.toISOString(),
  };

  const canonical = JSON.stringify(
    Object.fromEntries(Object.entries(payload).sort()),
  ).replace(/\s/g, "");

  const sig = crypto.createHmac("sha256", ATLAS_SECRET).update(canonical).digest("hex");
  return { ...payload, signature: sig };
}

async function notifyAdmin(subject: string, text: string): Promise<void> {
  if (!RESEND_KEY || !NOTIFY_EMAIL) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL, to: [NOTIFY_EMAIL], subject,
        html: `<pre style="font-family:monospace;font-size:14px">${text}</pre>`,
      }),
    });
  } catch { /* non-critical */ }
}

async function persistLicense(email: string, lic: AtlasLicense, sessionId?: string): Promise<void> {
  await setAtlasLicense(email, lic);
  if (sessionId) await setAtlasActivation(sessionId, lic, 7200);
}

async function sendLicenseEmail(
  toEmail: string, toName: string, modules: string[],
  lic: AtlasLicense, isRenewal: boolean,
): Promise<boolean> {
  if (!RESEND_KEY) return false;

  const licJson = JSON.stringify(lic, null, 2);
  const b64     = Buffer.from(licJson, "utf-8").toString("base64");
  const expires = lic.expires_at.slice(0, 10);

  const items = modules
    .map((m) => `<li>✅ ${m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</li>`)
    .join("");

  const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
  <h2 style="color:#6366f1">${isRenewal ? "🔄 ATLAS license renewed" : "🎉 Your ATLAS license is ready"}</h2>
  <p>Hi ${toName || ""},</p>
  <p>Your license covers:</p>
  <ul>${items}</ul>
  ${!isRenewal ? `
  <h3>Setup (2 steps)</h3>
  <ol>
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">pip install code-atlas-py</code></li>
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">atlas activate --email ${toEmail}</code></li>
  </ol>
  <p>Or place the attached <code>atlas_license.json</code> in <code>~/.atlas/</code>.</p>
  ` : `<p>Run <code>atlas activate --email ${toEmail}</code> to refresh your local license.</p>`}
  <p style="color:#64748b;font-size:13px">Valid until: ${expires}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="color:#94a3b8;font-size:12px">
    Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> ·
    <a href="${productUrl("atlas")}">${productUrl("atlas").replace(/^https?:\/\//, "")}</a>
  </p>
</body></html>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL, to: [toEmail],
        subject: isRenewal ? "ATLAS license renewed ✓" : "ATLAS license — ready to install",
        html,
        attachments: [{ filename: "atlas_license.json", content: b64 }],
      }),
    });
    return r.ok;
  } catch { return false; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ status: "ok", service: "atlas-webhook" });
  if (req.method !== "POST") return res.status(405).end();

  const rawBody   = await readRawBody(req);
  const signature = (req.headers["x-signature"] as string) || "";
  if (LEMON_WEBHOOK_SECRET && !verifyLemonSignature(rawBody, signature)) {
    return res.status(401).json({ error: "invalid signature" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try { body = JSON.parse(rawBody); } catch { return res.status(400).json({ error: "bad json" }); }
  const ev = parseLemonEvent(body);

  try {
    // ── Issue / refresh (new subscription or successful renewal) ──────────────
    if (isIssueEvent(ev.eventName)) {
      const isNew   = ev.eventName === "subscription_created";
      const modules = resolveModules(ev.variantId, ev.variantName, ev.productName);
      const tier    = tierForModules(modules);
      const lic     = generateLicense(ev.email, modules, tier, ev.orderId || ev.subscriptionId, ev.subscriptionId);
      if (ev.email) await persistLicense(ev.email, lic, isNew ? ev.session : undefined);
      const sent = ev.email ? await sendLicenseEmail(ev.email, ev.name, modules, lic, !isNew) : false;
      await notifyAdmin(
        `[ATLAS] ${isNew ? "New purchase" : "Renewal"} — ${tier}`,
        `email: ${ev.email}\nname: ${ev.name}\ntier: ${tier}\nmodules: ${modules.join(", ")}\nsub_id: ${ev.subscriptionId}`,
      );
      return res.status(200).json({ ok: true, email_sent: sent, tier, modules });
    }

    // ── Tier change (variant changed mid-subscription) ────────────────────────
    if (ev.eventName === "subscription_updated") {
      // A cancelled/expired status is handled by subscription_expired; ignore here.
      if (ev.status === "expired") return res.status(200).json({ ok: true, action: "ignored_status", status: ev.status });

      const modules  = resolveModules(ev.variantId, ev.variantName, ev.productName);
      const tier     = tierForModules(modules);
      const existing = ev.email ? await getAtlasLicense(ev.email) : null;
      if (existing && existing.tier === tier && existing.modules.join(",") === [...modules].sort().join(",")) {
        return res.status(200).json({ ok: true, action: "no_change", tier });
      }
      const lic = generateLicense(ev.email, modules, tier, ev.subscriptionId, ev.subscriptionId);
      if (ev.email) await persistLicense(ev.email, lic);
      const sent = ev.email ? await sendLicenseEmail(ev.email, ev.name, modules, lic, true) : false;
      await notifyAdmin(`[ATLAS] Tier change → ${tier}`, `email: ${ev.email}\nnew tier: ${tier}\nmodules: ${modules.join(", ")}`);
      return res.status(200).json({ ok: true, email_sent: sent, tier, modules, action: "tier_change" });
    }

    // ── Subscription truly ended → expire the license now ─────────────────────
    if (isExpireEvent(ev.eventName)) {
      if (ev.email) {
        const existing = await getAtlasLicense(ev.email);
        if (existing) {
          const cancelled: AtlasLicense = { ...existing, expires_at: new Date().toISOString() };
          const canonical = JSON.stringify(
            Object.fromEntries(
              Object.entries(cancelled).filter(([k]) => k !== "signature").sort(),
            ),
          ).replace(/\s/g, "");
          cancelled.signature = crypto.createHmac("sha256", ATLAS_SECRET).update(canonical).digest("hex");
          await setAtlasLicense(ev.email, cancelled);
        }
      }
      await notifyAdmin(`[ATLAS] Expired`, `email: ${ev.email}`);
      return res.status(200).json({ ok: true, action: "expired", email: ev.email });
    }

    // ── Cancelled but still paid until period end → keep license, just log ────
    if (ev.eventName === "subscription_cancelled") {
      await notifyAdmin(`[ATLAS] Cancelled (active until ${ev.endsAt || "period end"})`, `email: ${ev.email}`);
      return res.status(200).json({ ok: true, action: "cancelled_grace", ends_at: ev.endsAt });
    }

    console.log(`[atlas-webhook] ignored: ${ev.eventName}`);
    return res.status(200).json({ ok: true, action: "ignored", event: ev.eventName });
  } catch (err) {
    console.error("[atlas-webhook] error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}
