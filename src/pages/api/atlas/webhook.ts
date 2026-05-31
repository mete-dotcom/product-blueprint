/**
 * POST /api/atlas/webhook
 *
 * Paddle webhook → Atlas HMAC-signed license → KV + Resend email.
 * If custom_data.session is present, also stores in atlas:act:{session}
 * so the CLI polling loop can pick it up immediately.
 *
 * Raw body is buffered so the Paddle HMAC-SHA256 signature is verified
 * against the exact bytes Paddle sent (not re-serialized JSON).
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { setAtlasLicense, setAtlasActivation, getAtlasLicense } from "../../../lib/store";
import type { AtlasLicense } from "../../../lib/store";

// Disable Next.js body parsing — we need the raw bytes for Paddle sig verification
export const config = { api: { bodyParser: false } };

const ATLAS_SECRET  = process.env.ATLAS_LICENSE_SECRET  || "atlas-dev-secret-do-not-use-in-production";
const RESEND_KEY    = process.env.RESEND_API_KEY         || "";
const FROM_EMAIL    = process.env.ATLAS_FROM_EMAIL       || "ATLAS <noreply@atlas.tools>";
const PADDLE_SECRET = process.env.PADDLE_WEBHOOK_SECRET  || "";
const LICENSE_DAYS  = 35;

// Module lists aligned with /atlas/pricing.tsx tier definitions
const MODULES_SOLO       = ["core", "system_map"];
const MODULES_PRO        = ["core", "system_map", "risk_radar", "security_shield", "code_health", "signal_map", "atlas_mcp"];
const MODULES_ENTERPRISE = [...MODULES_PRO, "decision_center", "ownership_map", "rewind", "what_if", "commit_guard"];

const PRICE_MODULES: Record<string, string[]> = {
  [process.env.NEXT_PUBLIC_ATLAS_SOLO_MONTHLY  || "pri_atlas_solo_m"]: MODULES_SOLO,
  [process.env.NEXT_PUBLIC_ATLAS_SOLO_YEARLY   || "pri_atlas_solo_y"]: MODULES_SOLO,
  [process.env.NEXT_PUBLIC_ATLAS_PRO_MONTHLY   || "pri_atlas_pro_m"]:  MODULES_PRO,
  [process.env.NEXT_PUBLIC_ATLAS_PRO_YEARLY    || "pri_atlas_pro_y"]:  MODULES_PRO,
  [process.env.NEXT_PUBLIC_ATLAS_ENT_MONTHLY   || "pri_atlas_ent_m"]:  MODULES_ENTERPRISE,
  [process.env.NEXT_PUBLIC_ATLAS_ENT_YEARLY    || "pri_atlas_ent_y"]:  MODULES_ENTERPRISE,
};

function resolveModules(priceId: string, productName = ""): string[] {
  if (priceId && PRICE_MODULES[priceId]) return PRICE_MODULES[priceId];
  const n = productName.toLowerCase();
  if (n.includes("enterprise")) return MODULES_ENTERPRISE;
  if (n.includes("pro"))        return MODULES_PRO;
  return MODULES_SOLO;
}

function tierForModules(modules: string[]): string {
  if (modules.includes("mesh_discovery") || modules.includes("commit_guard")) return "enterprise";
  if (modules.includes("mcp_server")     || modules.length >= 6)              return "pro";
  if (modules.length > 1)                                                      return "solo";
  return "free";
}

function generateLicense(
  email: string, modules: string[], tier: string,
  saleId: string, subscriptionId = ""
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
    Object.fromEntries(Object.entries(payload).sort())
  ).replace(/\s/g, "");

  const sig = crypto.createHmac("sha256", ATLAS_SECRET).update(canonical).digest("hex");
  return { ...payload, signature: sig };
}

async function persistLicense(email: string, lic: AtlasLicense, sessionId?: string): Promise<void> {
  await setAtlasLicense(email, lic);
  if (sessionId) await setAtlasActivation(sessionId, lic, 7200);
}

async function sendLicenseEmail(
  toEmail: string, toName: string, modules: string[],
  lic: AtlasLicense, isRenewal: boolean
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
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">pip install code-atlas</code></li>
    <li><code style="background:#f1f5f9;padding:3px 7px;border-radius:4px">atlas activate --email ${toEmail}</code></li>
  </ol>
  <p>Or place the attached <code>atlas_license.json</code> in <code>~/.atlas/</code>.</p>
  ` : `<p>Run <code>atlas activate --email ${toEmail}</code> to refresh your local license.</p>`}
  <p style="color:#64748b;font-size:13px">Valid until: ${expires}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="color:#94a3b8;font-size:12px">
    Support: <a href="mailto:support@atlas.tools">support@atlas.tools</a> ·
    <a href="https://atlas.tools">atlas.tools</a>
  </p>
</body></html>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: isRenewal ? "ATLAS license renewed ✓" : "ATLAS license — ready to install",
        html,
        attachments: [{ filename: "atlas_license.json", content: b64 }],
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
      header.split(";").map((p) => { const [k, v] = p.split("="); return [k, v]; })
    );
    const signed   = `${parts.ts}:${rawBody}`;
    const expected = crypto.createHmac("sha256", PADDLE_SECRET).update(signed).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.h1 || ""));
  } catch { return false; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ status: "ok", service: "atlas-webhook" });
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
    // ── New subscription (first payment) ────────────────────────────────────
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

      const modules = resolveModules(priceId, prod);
      const tier    = tierForModules(modules);
      const lic     = generateLicense(email, modules, tier, subId, subId);
      if (email) await persistLicense(email, lic, session);
      const sent = email ? await sendLicenseEmail(email, name, modules, lic, false) : false;
      return res.status(200).json({ ok: true, email_sent: sent, tier, modules });
    }

    // ── Recurring renewal or one-time payment ────────────────────────────────
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

      const modules = resolveModules(priceId, prod);
      const tier    = tierForModules(modules);
      const lic     = generateLicense(email, modules, tier, txId, subId);
      if (email) await persistLicense(email, lic, session);
      const sent = email ? await sendLicenseEmail(email, name, modules, lic, true) : false;
      return res.status(200).json({ ok: true, email_sent: sent, tier, modules });
    }

    // ── Tier change (upgrade/downgrade) ──────────────────────────────────────
    // subscription.updated fires when Paddle changes the plan mid-cycle
    if (eventType === "subscription.updated") {
      const sub     = body?.data ?? {};
      const cust    = sub.customer ?? {};
      const email   = cust.email ?? "";
      const name    = cust.name ?? "";
      const items   = sub.items ?? [{}];
      const priceId = items[0]?.price?.id ?? "";
      const prod    = items[0]?.price?.product?.name ?? "";
      const subId   = sub.id ?? "";

      const modules = resolveModules(priceId, prod);
      const tier    = tierForModules(modules);

      // Only re-issue if the tier actually changed
      const existing = email ? await getAtlasLicense(email) : null;
      if (existing && existing.tier === tier && existing.modules.join(",") === [...modules].sort().join(",")) {
        return res.status(200).json({ ok: true, action: "no_change", tier });
      }

      const lic  = generateLicense(email, modules, tier, subId, subId);
      if (email) await persistLicense(email, lic, undefined);
      const sent = email ? await sendLicenseEmail(email, name, modules, lic, true) : false;
      return res.status(200).json({ ok: true, email_sent: sent, tier, modules, action: "tier_change" });
    }

    // ── Cancellation — mark license as expired immediately ──────────────────
    if (eventType === "subscription.canceled") {
      const sub   = body?.data ?? {};
      const cust  = sub.customer ?? {};
      const email = cust.email ?? "";
      if (email) {
        const existing = await getAtlasLicense(email);
        if (existing) {
          const cancelled: AtlasLicense = {
            ...existing,
            expires_at: new Date().toISOString(),
          };
          // Re-sign with updated expiry
          const canonical = JSON.stringify(
            Object.fromEntries(Object.entries({ ...cancelled, signature: undefined } as object).filter(([k]) => k !== "signature").sort())
          ).replace(/\s/g, "");
          cancelled.signature = crypto.createHmac("sha256", ATLAS_SECRET).update(canonical).digest("hex");
          await setAtlasLicense(email, cancelled);
        }
      }
      return res.status(200).json({ ok: true, action: "cancelled", email });
    }

    console.log(`[atlas-webhook] ignored: ${eventType}`);
    return res.status(200).json({ ok: true, action: "ignored", event: eventType });
  } catch (err) {
    console.error("[atlas-webhook] error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}
