/**
 * POST /api/adauto/webhook
 *
 * Lemon Squeezy webhook → adauto HMAC-signed license → KV + Resend email.
 * adauto has a single paid tier ("pro"); everything else is "free".
 * If custom_data.session is present, also stores in adauto:act:{session}
 * so the CLI polling loop can pick it up immediately.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { setAdautoLicense, setAdautoActivation, getAdautoLicense } from "../../../lib/store";
import type { AdautoLicense } from "../../../lib/store";
import { fromEmail, productUrl, SUPPORT_EMAIL } from "../../../lib/site";
import {
  readRawBody, verifyLemonSignature, parseLemonEvent,
  isIssueEvent, isExpireEvent, LEMON_WEBHOOK_SECRET,
} from "../../../lib/lemonsqueezy";

// Raw bytes required for Lemon Squeezy X-Signature verification
export const config = { api: { bodyParser: false } };

const AD_SECRET    = process.env.ADAUTO_LICENSE_SECRET || "adauto-dev-secret-do-not-use-in-production";
const RESEND_KEY   = process.env.RESEND_API_KEY        || "";
const FROM_EMAIL   = fromEmail("adauto");
const NOTIFY_EMAIL = process.env.FOUNDER_NOTIFY_EMAIL  || "";
const LICENSE_DAYS = 35;

type ADTier = "free" | "pro";

// Map Lemon Squeezy variant_id → tier
const VARIANT_TIERS: Record<string, ADTier> = {
  [process.env.NEXT_PUBLIC_ADAUTO_PRO_MONTHLY || "ls_adauto_pro_m"]: "pro",
  [process.env.NEXT_PUBLIC_ADAUTO_PRO_YEARLY  || "ls_adauto_pro_y"]: "pro",
};

function resolveTier(variantId: string, variantName = "", productName = ""): ADTier {
  if (variantId && VARIANT_TIERS[variantId]) return VARIANT_TIERS[variantId];
  return `${variantName} ${productName}`.toLowerCase().includes("pro") ? "pro" : "free";
}

/** Deterministic ADTO-XXXXX-XXXXX-XXXXX-XXXXX key from email + sale_id. */
function generateKey(email: string, saleId: string): string {
  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  const digest = crypto.createHmac("sha256", AD_SECRET).update(`${email}:${saleId}`).digest();
  let out = "";
  for (let i = 0; i < 20; i++) out += ALPHABET[digest[i] % ALPHABET.length];
  return `ADTO-${out.slice(0, 5)}-${out.slice(5, 10)}-${out.slice(10, 15)}-${out.slice(15, 20)}`;
}

function generateLicense(email: string, tier: ADTier, saleId: string, subscriptionId = ""): AdautoLicense {
  const now     = new Date();
  const expires = new Date(now.getTime() + LICENSE_DAYS * 86400000);

  const payload: Omit<AdautoLicense, "signature"> = {
    version:         "1.0",
    email,
    tier,
    key:             generateKey(email, saleId),
    issued_at:       now.toISOString(),
    expires_at:      expires.toISOString(),
    sale_id:         saleId,
    subscription_id: subscriptionId,
  };

  const canonical = JSON.stringify(
    Object.fromEntries(Object.entries(payload).sort()),
  ).replace(/\s/g, "");

  const sig = crypto.createHmac("sha256", AD_SECRET).update(canonical).digest("hex");
  return { ...payload, signature: sig };
}

async function persistLicense(email: string, lic: AdautoLicense, sessionId?: string): Promise<void> {
  await setAdautoLicense(email, lic);
  if (sessionId) await setAdautoActivation(sessionId, lic, 7200);
}

async function notifyAdmin(subject: string, text: string): Promise<void> {
  if (!RESEND_KEY || !NOTIFY_EMAIL) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [NOTIFY_EMAIL], subject, html: `<pre>${text}</pre>` }),
    });
  } catch { /* non-critical */ }
}

async function sendLicenseEmail(toEmail: string, toName: string, lic: AdautoLicense, isRenewal: boolean): Promise<boolean> {
  if (!RESEND_KEY) return false;

  const expires = lic.expires_at.slice(0, 10);
  const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
  <h2 style="color:#f59e0b">${isRenewal ? "🔄 adauto license renewed" : "🎉 Your adauto Pro license is ready"}</h2>
  <p>Hi ${toName || ""},</p>
  <p>Your license key:</p>
  <p style="font-family:monospace;font-size:18px;background:#f1f5f9;padding:12px;border-radius:6px;text-align:center;letter-spacing:1px">${lic.key}</p>
  ${!isRenewal ? `
  <h3>Activate in 2 steps</h3>
  <ol>
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">pip install adauto</code></li>
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">adauto license activate ${lic.key}</code></li>
  </ol>` : `<p>Run <code>adauto license activate ${lic.key}</code> to refresh your local license.</p>`}
  <p style="color:#64748b;font-size:13px">Valid until: ${expires} · tier: ${lic.tier}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="color:#94a3b8;font-size:12px">
    Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> ·
    <a href="${productUrl("adauto")}">${productUrl("adauto").replace(/^https?:\/\//, "")}</a>
  </p>
</body></html>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: isRenewal ? "adauto license renewed ✓" : "adauto Pro license — ready to activate",
        html,
      }),
    });
    return r.ok;
  } catch { return false; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ status: "ok", service: "adauto-webhook" });
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
      const sent = ev.email ? await sendLicenseEmail(ev.email, ev.name, lic, !isNew) : false;
      await notifyAdmin(
        `[ADAUTO] ${isNew ? "New purchase" : "Renewal"} — ${tier}`,
        `email: ${ev.email}\nname: ${ev.name}\ntier: ${tier}\nkey: ${lic.key}\nsub_id: ${ev.subscriptionId}`,
      );
      return res.status(200).json({ ok: true, email_sent: sent, tier });
    }

    // ── Tier change ───────────────────────────────────────────────────────────
    if (ev.eventName === "subscription_updated") {
      if (ev.status === "expired") return res.status(200).json({ ok: true, action: "ignored_status", status: ev.status });

      const tier     = resolveTier(ev.variantId, ev.variantName, ev.productName);
      const existing = ev.email ? await getAdautoLicense(ev.email) : null;
      if (existing && existing.tier === tier) {
        return res.status(200).json({ ok: true, action: "no_change", tier });
      }
      const lic = generateLicense(ev.email, tier, ev.subscriptionId, ev.subscriptionId);
      if (ev.email) await persistLicense(ev.email, lic);
      const sent = ev.email ? await sendLicenseEmail(ev.email, ev.name, lic, true) : false;
      await notifyAdmin(`[ADAUTO] Tier change → ${tier}`, `email: ${ev.email}\nnew tier: ${tier}`);
      return res.status(200).json({ ok: true, email_sent: sent, tier, action: "tier_change" });
    }

    // ── Subscription truly ended → expire the license now ─────────────────────
    if (isExpireEvent(ev.eventName)) {
      if (ev.email) {
        const existing = await getAdautoLicense(ev.email);
        if (existing) {
          const dead: AdautoLicense = { ...existing, expires_at: new Date().toISOString() };
          const canonical = JSON.stringify(
            Object.fromEntries(Object.entries(dead).filter(([k]) => k !== "signature").sort()),
          ).replace(/\s/g, "");
          dead.signature = crypto.createHmac("sha256", AD_SECRET).update(canonical).digest("hex");
          await setAdautoLicense(ev.email, dead);
        }
      }
      await notifyAdmin(`[ADAUTO] Expired`, `email: ${ev.email}`);
      return res.status(200).json({ ok: true, action: "expired", email: ev.email });
    }

    // ── Cancelled but still paid until period end → keep, just log ────────────
    if (ev.eventName === "subscription_cancelled") {
      await notifyAdmin(`[ADAUTO] Cancelled (active until ${ev.endsAt || "period end"})`, `email: ${ev.email}`);
      return res.status(200).json({ ok: true, action: "cancelled_grace", ends_at: ev.endsAt });
    }

    console.log(`[adauto-webhook] ignored: ${ev.eventName}`);
    return res.status(200).json({ ok: true, action: "ignored", event: ev.eventName });
  } catch (err) {
    console.error("[adauto-webhook] error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}
