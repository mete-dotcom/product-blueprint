/**
 * POST /api/nodestone/webhook
 *
 * Lemon Squeezy webhook → nodestone HMAC-signed license → KV + Resend email.
 * Handles free / pro / team tiers independently from the other products.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { setNodestoneLicense, setNodestoneActivation, getNodestoneLicense } from "../../../lib/store";
import type { NodestoneLicense } from "../../../lib/store";
import { fromEmail, productUrl, SUPPORT_EMAIL } from "../../../lib/site";
import {
  readRawBody, verifyLemonSignature, parseLemonEvent,
  isIssueEvent, isExpireEvent, LEMON_WEBHOOK_SECRET,
} from "../../../lib/lemonsqueezy";

// Raw bytes required for Lemon Squeezy X-Signature verification
export const config = { api: { bodyParser: false } };

const NS_SECRET    = process.env.NODESTONE_LICENSE_SECRET || "ns-dev-secret-do-not-use-in-production";
const RESEND_KEY   = process.env.RESEND_API_KEY            || "";
const FROM_EMAIL   = fromEmail("nodestone");
const NOTIFY_EMAIL = process.env.FOUNDER_NOTIFY_EMAIL      || "";
const LICENSE_DAYS = 35;

type NSTier = "free" | "pro" | "team";

// Map Lemon Squeezy variant_id → tier
// TODO: real Lemon Squeezy variant IDs go in NEXT_PUBLIC_NS_* env vars; the
// fallback strings (ls_ns_*) are placeholders until those products exist.
const VARIANT_TIERS: Record<string, NSTier> = {
  [process.env.NEXT_PUBLIC_NS_FREE_MONTHLY || "ls_ns_free_m"]: "free",
  [process.env.NEXT_PUBLIC_NS_PRO_MONTHLY  || "ls_ns_pro_m"]:  "pro",
  [process.env.NEXT_PUBLIC_NS_PRO_YEARLY   || "ls_ns_pro_y"]:  "pro",
  [process.env.NEXT_PUBLIC_NS_TEAM_MONTHLY || "ls_ns_team_m"]: "team",
  [process.env.NEXT_PUBLIC_NS_TEAM_YEARLY  || "ls_ns_team_y"]: "team",
};

function resolveTier(variantId: string, variantName = "", productName = ""): NSTier {
  if (variantId && VARIANT_TIERS[variantId]) return VARIANT_TIERS[variantId];
  const n = `${variantName} ${productName}`.toLowerCase();
  if (n.includes("team")) return "team";
  if (n.includes("pro"))  return "pro";
  return "free";
}

function generateLicense(email: string, tier: NSTier, saleId: string, subscriptionId = ""): NodestoneLicense {
  const now     = new Date();
  const expires = new Date(now.getTime() + LICENSE_DAYS * 86400000);

  const payload: Omit<NodestoneLicense, "signature"> = {
    version:         "1.0",
    email,
    tier,
    sale_id:         saleId,
    subscription_id: subscriptionId,
    issued_at:       now.toISOString(),
    expires_at:      expires.toISOString(),
  };

  const canonical = JSON.stringify(
    Object.fromEntries(Object.entries(payload).sort()),
  ).replace(/\s/g, "");

  const sig = crypto.createHmac("sha256", NS_SECRET).update(canonical).digest("hex");
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

async function persistLicense(email: string, lic: NodestoneLicense, sessionId?: string): Promise<void> {
  await setNodestoneLicense(email, lic);
  if (sessionId) await setNodestoneActivation(sessionId, lic, 7200);
}

async function sendLicenseEmail(
  toEmail: string, toName: string, tier: NSTier,
  lic: NodestoneLicense, isRenewal: boolean,
): Promise<boolean> {
  if (!RESEND_KEY) return false;

  const licJson = JSON.stringify(lic, null, 2);
  const b64     = Buffer.from(licJson, "utf-8").toString("base64");
  const expires = lic.expires_at.slice(0, 10);

  const tierFeatures: Record<NSTier, string[]> = {
    free: ["1 project memory", "session continuity — local context store", "nodestone init + nodestone mcp", "MCP server (stdio)"],
    pro:  ["Unlimited project memories", "persistent context across every session", "semantic recall — ask your project anything", "auto-summarized history", "HMAC-signed offline token"],
    team: ["Everything in Pro", "shared team memory — one context, every dev", "HTTP MCP transport — LAN & VPN", "seat-based billing"],
  };

  const items = tierFeatures[tier].map((f) => `<li>✅ ${f}</li>`).join("");

  const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
  <h2 style="color:#0ea5e9">${isRenewal ? "🔄 nodestone license renewed" : "🎉 Your nodestone license is ready"}</h2>
  <p>Hi ${toName || ""},</p>
  <p>Your <strong>${tier}</strong> license includes:</p>
  <ul>${items}</ul>
  ${!isRenewal ? `
  <h3>Activate in 2 steps</h3>
  <ol>
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">pip install nodestone</code></li>
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">nodestone init</code></li>
  </ol>
  <p>Or place the attached <code>nodestone_license.json</code> in <code>~/.nodestone/</code>.</p>
  ` : `<p>Run <code>nodestone init</code> to refresh your local license.</p>`}
  <p style="color:#64748b;font-size:13px">Valid until: ${expires} · tier: ${tier}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="color:#94a3b8;font-size:12px">
    Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> ·
    <a href="${productUrl("nodestone")}">${productUrl("nodestone").replace(/^https?:\/\//, "")}</a>
  </p>
</body></html>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body:    JSON.stringify({
        from: FROM_EMAIL, to: [toEmail],
        subject: isRenewal ? "nodestone license renewed ✓" : "nodestone license — ready to activate",
        html,
        attachments: [{ filename: "nodestone_license.json", content: b64 }],
      }),
    });
    return r.ok;
  } catch { return false; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ status: "ok", service: "nodestone-webhook" });
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
    // ── Issue / refresh ───────────────────────────────────────────────────────
    if (isIssueEvent(ev.eventName)) {
      const isNew = ev.eventName === "subscription_created";
      const tier  = resolveTier(ev.variantId, ev.variantName, ev.productName);
      const lic   = generateLicense(ev.email, tier, ev.orderId || ev.subscriptionId, ev.subscriptionId);
      if (ev.email) await persistLicense(ev.email, lic, isNew ? ev.session : undefined);
      const sent = ev.email ? await sendLicenseEmail(ev.email, ev.name, tier, lic, !isNew) : false;
      await notifyAdmin(
        `[NODESTONE] ${isNew ? "New purchase" : "Renewal"} — ${tier}`,
        `email: ${ev.email}\nname: ${ev.name}\ntier: ${tier}\nsub_id: ${ev.subscriptionId}`,
      );
      return res.status(200).json({ ok: true, email_sent: sent, tier });
    }

    // ── Tier change (variant changed mid-subscription) ────────────────────────
    if (ev.eventName === "subscription_updated") {
      if (ev.status === "expired") return res.status(200).json({ ok: true, action: "ignored_status", status: ev.status });

      const tier     = resolveTier(ev.variantId, ev.variantName, ev.productName);
      const existing = ev.email ? await getNodestoneLicense(ev.email) : null;
      if (existing && existing.tier === tier) {
        return res.status(200).json({ ok: true, action: "no_change", tier });
      }
      const lic = generateLicense(ev.email, tier, ev.subscriptionId, ev.subscriptionId);
      if (ev.email) await persistLicense(ev.email, lic);
      const sent = ev.email ? await sendLicenseEmail(ev.email, ev.name, tier, lic, true) : false;
      await notifyAdmin(`[NODESTONE] Tier change → ${tier}`, `email: ${ev.email}\nnew tier: ${tier}`);
      return res.status(200).json({ ok: true, email_sent: sent, tier, action: "tier_change" });
    }

    // ── Subscription truly ended → expire the license now ─────────────────────
    if (isExpireEvent(ev.eventName)) {
      if (ev.email) {
        const existing = await getNodestoneLicense(ev.email);
        if (existing) {
          const dead: NodestoneLicense = { ...existing, expires_at: new Date().toISOString() };
          const canonical = JSON.stringify(
            Object.fromEntries(Object.entries(dead).filter(([k]) => k !== "signature").sort()),
          ).replace(/\s/g, "");
          dead.signature = crypto.createHmac("sha256", NS_SECRET).update(canonical).digest("hex");
          await setNodestoneLicense(ev.email, dead);
        }
      }
      await notifyAdmin(`[NODESTONE] Expired`, `email: ${ev.email}`);
      return res.status(200).json({ ok: true, action: "expired", email: ev.email });
    }

    // ── Cancelled but still paid until period end → keep, just log ────────────
    if (ev.eventName === "subscription_cancelled") {
      await notifyAdmin(`[NODESTONE] Cancelled (active until ${ev.endsAt || "period end"})`, `email: ${ev.email}`);
      return res.status(200).json({ ok: true, action: "cancelled_grace", ends_at: ev.endsAt });
    }

    console.log(`[nodestone-webhook] ignored: ${ev.eventName}`);
    return res.status(200).json({ ok: true, action: "ignored", event: ev.eventName });
  } catch (err) {
    console.error("[nodestone-webhook] error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}
