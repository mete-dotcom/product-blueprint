/**
 * POST /api/adauto/webhook
 *
 * Paddle webhook → adauto HMAC-signed license → KV + Resend email.
 * adauto has a single paid tier ("pro"); everything else is "free".
 * If custom_data.session is present, also stores in adauto:act:{session}
 * so the CLI polling loop can pick it up immediately.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { setAdautoLicense, setAdautoActivation } from "../../../lib/store";
import type { AdautoLicense } from "../../../lib/store";
import { fromEmail, productUrl, SUPPORT_EMAIL } from "../../../lib/site";

// Disable Next.js body parsing — raw bytes needed for Paddle HMAC verification
export const config = { api: { bodyParser: false } };

const AD_SECRET     = process.env.ADAUTO_LICENSE_SECRET || "adauto-dev-secret-do-not-use-in-production";
const RESEND_KEY    = process.env.RESEND_API_KEY        || "";
const FROM_EMAIL    = fromEmail("adauto");
const PADDLE_SECRET = process.env.PADDLE_WEBHOOK_SECRET || "";
const NOTIFY_EMAIL  = process.env.FOUNDER_NOTIFY_EMAIL  || "";
const LICENSE_DAYS  = 35;

type ADTier = "free" | "pro";

const PRICE_TIERS: Record<string, ADTier> = {
  [process.env.NEXT_PUBLIC_ADAUTO_PRO_MONTHLY || "pri_adauto_pro_m"]: "pro",
  [process.env.NEXT_PUBLIC_ADAUTO_PRO_YEARLY  || "pri_adauto_pro_y"]: "pro",
};

function resolveTier(priceId: string, productName = ""): ADTier {
  if (priceId && PRICE_TIERS[priceId]) return PRICE_TIERS[priceId];
  return productName.toLowerCase().includes("pro") ? "pro" : "free";
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

async function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function verifyPaddleSignature(rawBody: string, header: string): boolean {
  if (!PADDLE_SECRET || !header) return !PADDLE_SECRET;
  try {
    const parts = Object.fromEntries(
      header.split(";").map((p) => { const [k, v] = p.split("="); return [k, v]; }),
    );
    const signed   = `${parts.ts}:${rawBody}`;
    const expected = crypto.createHmac("sha256", PADDLE_SECRET).update(signed).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.h1 || ""));
  } catch { return false; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ status: "ok", service: "adauto-webhook" });
  if (req.method !== "POST") return res.status(405).end();

  const rawBody   = await readRawBody(req);
  const paddleSig = (req.headers["paddle-signature"] as string) || "";
  if (PADDLE_SECRET && !verifyPaddleSignature(rawBody, paddleSig)) {
    return res.status(401).json({ error: "invalid signature" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any  = JSON.parse(rawBody);
  const eventType  = (body?.event_type as string) || "";

  try {
    if (eventType === "subscription.created") {
      const sub     = body?.data ?? {};
      const cust    = sub.customer ?? {};
      const email   = cust.email ?? "";
      const name    = cust.name ?? "";
      const items   = sub.items ?? [{}];
      const priceId = items[0]?.price?.id ?? "";
      const prod    = items[0]?.price?.product?.name ?? "";
      const subId   = sub.id ?? "";
      const session = sub.custom_data?.session as string | undefined;

      const tier = resolveTier(priceId, prod);
      const lic  = generateLicense(email, tier, subId, subId);
      if (email) await persistLicense(email, lic, session);
      const sent = email ? await sendLicenseEmail(email, name, lic, false) : false;
      await notifyAdmin(`[ADAUTO] New purchase — ${tier}`, `email: ${email}\nname: ${name}\ntier: ${tier}\nkey: ${lic.key}\nsub_id: ${subId}`);
      return res.status(200).json({ ok: true, email_sent: sent, tier });
    }

    if (["transaction.completed", "subscription.renewed"].includes(eventType)) {
      const tx      = body?.data ?? {};
      const cust    = tx.customer ?? {};
      const email   = cust.email ?? "";
      const name    = cust.name ?? "";
      const items   = tx.items ?? [{}];
      const priceId = items[0]?.price?.id ?? "";
      const prod    = items[0]?.price?.product?.name ?? "";
      const txId    = tx.id ?? "";
      const subId   = tx.subscription_id ?? "";
      const session = tx.custom_data?.session as string | undefined;

      const tier = resolveTier(priceId, prod);
      const lic  = generateLicense(email, tier, txId, subId);
      if (email) await persistLicense(email, lic, session);
      const sent = email ? await sendLicenseEmail(email, name, lic, true) : false;
      await notifyAdmin(`[ADAUTO] Renewal — ${tier}`, `email: ${email}\ntier: ${tier}\ntx_id: ${txId}`);
      return res.status(200).json({ ok: true, email_sent: sent, tier });
    }

    console.log(`[adauto-webhook] ignored: ${eventType}`);
    return res.status(200).json({ ok: true, action: "ignored", event: eventType });
  } catch (err) {
    console.error("[adauto-webhook] error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}
