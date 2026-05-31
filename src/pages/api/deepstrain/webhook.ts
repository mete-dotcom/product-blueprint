/**
 * POST /api/deepstrain/webhook
 *
 * Paddle webhook → deepstrain HMAC-signed license → KV + Resend email.
 * Handles solo / team / enterprise tiers independently from Atlas.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { setDeepstrainLicense, setDeepstrainActivation } from "../../../lib/store";
import type { DeepstrainLicense } from "../../../lib/store";

// Disable Next.js body parsing — raw bytes needed for Paddle HMAC verification
export const config = { api: { bodyParser: false } };

async function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

const DS_SECRET     = process.env.DEEPSTRAIN_LICENSE_SECRET  || "ds-dev-secret-do-not-use-in-production";
const RESEND_KEY    = process.env.RESEND_API_KEY              || "";
const FROM_EMAIL    = process.env.DEEPSTRAIN_FROM_EMAIL       || "deepstrain <noreply@massiron.com>";
const PADDLE_SECRET = process.env.PADDLE_WEBHOOK_SECRET       || "";
const NOTIFY_EMAIL  = process.env.FOUNDER_NOTIFY_EMAIL        || "";
const LICENSE_DAYS  = 35;

async function notifyAdmin(subject: string, text: string): Promise<void> {
  if (!RESEND_KEY || !NOTIFY_EMAIL) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFY_EMAIL],
        subject,
        html: `<pre style="font-family:monospace;font-size:14px">${text}</pre>`,
      }),
    });
  } catch { /* non-critical */ }
}

// ── Paddle price ID → tier mapping ───────────────────────────────────────────
type DSTier = "solo" | "team" | "enterprise";

const PRICE_TIERS: Record<string, DSTier> = {
  [process.env.NEXT_PUBLIC_DS_SOLO_MONTHLY    || "pri_ds_solo_m"]:  "solo",
  [process.env.NEXT_PUBLIC_DS_SOLO_QUARTERLY  || "pri_ds_solo_q"]:  "solo",
  [process.env.NEXT_PUBLIC_DS_SOLO_BIANNUAL   || "pri_ds_solo_b"]:  "solo",
  [process.env.NEXT_PUBLIC_DS_SOLO_YEARLY     || "pri_ds_solo_y"]:  "solo",
  [process.env.NEXT_PUBLIC_DS_TEAM_MONTHLY    || "pri_ds_team_m"]:  "team",
  [process.env.NEXT_PUBLIC_DS_TEAM_QUARTERLY  || "pri_ds_team_q"]:  "team",
  [process.env.NEXT_PUBLIC_DS_TEAM_BIANNUAL   || "pri_ds_team_b"]:  "team",
  [process.env.NEXT_PUBLIC_DS_TEAM_YEARLY     || "pri_ds_team_y"]:  "team",
  [process.env.NEXT_PUBLIC_DS_ENT_MONTHLY     || "pri_ds_ent_m"]:   "enterprise",
  [process.env.NEXT_PUBLIC_DS_ENT_YEARLY      || "pri_ds_ent_y"]:   "enterprise",
};

function resolveTier(priceId: string, productName = ""): DSTier {
  if (priceId && PRICE_TIERS[priceId]) return PRICE_TIERS[priceId];
  const n = productName.toLowerCase();
  if (n.includes("enterprise")) return "enterprise";
  if (n.includes("team"))       return "team";
  return "solo";
}

function generateLicense(
  email: string, tier: DSTier,
  saleId: string, subscriptionId = "",
): DeepstrainLicense {
  const now     = new Date();
  const expires = new Date(now.getTime() + LICENSE_DAYS * 86400000);

  const payload: Omit<DeepstrainLicense, "signature"> = {
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

  const sig = crypto.createHmac("sha256", DS_SECRET).update(canonical).digest("hex");
  return { ...payload, signature: sig };
}

async function persistLicense(
  email: string, lic: DeepstrainLicense, sessionId?: string,
): Promise<void> {
  await setDeepstrainLicense(email, lic);
  if (sessionId) await setDeepstrainActivation(sessionId, lic, 7200);
}

async function sendLicenseEmail(
  toEmail: string, toName: string, tier: DSTier,
  lic: DeepstrainLicense, isRenewal: boolean,
): Promise<boolean> {
  if (!RESEND_KEY) return false;

  const licJson = JSON.stringify(lic, null, 2);
  const b64     = Buffer.from(licJson, "utf-8").toString("base64");
  const expires = lic.expires_at.slice(0, 10);

  const tierFeatures: Record<DSTier, string[]> = {
    solo:       ["52 engineering tools (read, grep, git, test…)", "MCP server — stdio (Claude Code, Gemini, Cursor)", "Local LLM support (Ollama, LM Studio)", "deepstrain_eval — autonomous agent loop", "HMAC-signed offline token"],
    team:       ["Everything in Solo", "HTTP MCP transport — LAN & VPN", "Multiple concurrent clients", "Per-device permission controls", "LAN mesh — up to 20 nodes"],
    enterprise: ["Everything in Team", "Priority support", "Custom onboarding"],
  };

  const items = tierFeatures[tier]
    .map((f) => `<li>✅ ${f}</li>`)
    .join("");

  const activateCmd = tier === "solo"
    ? "deepstrain configure"
    : "deepstrain configure  # then: deepstrain mcp --http";

  const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
  <h2 style="color:#06b6d4">${isRenewal ? "🔄 deepstrain license renewed" : "🎉 Your deepstrain license is ready"}</h2>
  <p>Hi ${toName || ""},</p>
  <p>Your <strong>${tier}</strong> license includes:</p>
  <ul>${items}</ul>
  ${!isRenewal ? `
  <h3>Activate in 2 steps</h3>
  <ol>
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">pip install deepstrain</code></li>
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">${activateCmd}</code></li>
  </ol>
  <p>Or place the attached <code>deepstrain_license.json</code> in <code>~/.deepstrain/</code>.</p>
  ` : `<p>Run <code>deepstrain configure</code> to refresh your local license.</p>`}
  <p style="color:#64748b;font-size:13px">Valid until: ${expires} · tier: ${tier}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="color:#94a3b8;font-size:12px">
    Support: <a href="mailto:support@deepstrain.dev">support@deepstrain.dev</a> ·
    <a href="https://deepstrain.dev">deepstrain.dev</a>
  </p>
</body></html>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body:    JSON.stringify({
        from:        FROM_EMAIL,
        to:          [toEmail],
        subject:     isRenewal ? "deepstrain license renewed ✓" : "deepstrain license — ready to activate",
        html,
        attachments: [{ filename: "deepstrain_license.json", content: b64 }],
      }),
    });
    return r.ok;
  } catch { return false; }
}

function verifyPaddleSignature(rawBody: string, header: string): boolean {
  if (!PADDLE_SECRET || !header) return !PADDLE_SECRET;
  try {
    const parts   = Object.fromEntries(
      header.split(";").map((p) => { const [k, v] = p.split("="); return [k, v]; }),
    );
    const signed   = `${parts.ts}:${rawBody}`;
    const expected = crypto.createHmac("sha256", PADDLE_SECRET).update(signed).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.h1 || ""));
  } catch { return false; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ status: "ok", service: "deepstrain-webhook" });
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
      const sent = email ? await sendLicenseEmail(email, name, tier, lic, false) : false;
      await notifyAdmin(`[DEEPSTRAIN] New purchase — ${tier}`, `email: ${email}\nname: ${name}\ntier: ${tier}\nsub_id: ${subId}`);
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
      const sent = email ? await sendLicenseEmail(email, name, tier, lic, true) : false;
      await notifyAdmin(`[DEEPSTRAIN] Renewal — ${tier}`, `email: ${email}\ntier: ${tier}\ntx_id: ${txId}`);
      return res.status(200).json({ ok: true, email_sent: sent, tier });
    }

    if (eventType === "subscription.updated") {
      const sub     = body?.data ?? {};
      const cust    = sub.customer ?? {};
      const email   = cust.email ?? "";
      const name    = cust.name ?? "";
      const items   = sub.items ?? [{}];
      const priceId = items[0]?.price?.id ?? "";
      const prod    = items[0]?.price?.product?.name ?? "";
      const subId   = sub.id ?? "";

      const tier = resolveTier(priceId, prod);
      const lic  = generateLicense(email, tier, subId, subId);
      if (email) await persistLicense(email, lic, undefined);
      const sent = email ? await sendLicenseEmail(email, name, tier, lic, true) : false;
      await notifyAdmin(`[DEEPSTRAIN] Tier change → ${tier}`, `email: ${email}\nnew tier: ${tier}`);
      return res.status(200).json({ ok: true, email_sent: sent, tier, action: "tier_change" });
    }

    console.log(`[deepstrain-webhook] ignored: ${eventType}`);
    return res.status(200).json({ ok: true, action: "ignored", event: eventType });
  } catch (err) {
    console.error("[deepstrain-webhook] error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}
