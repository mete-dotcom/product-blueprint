/**
 * POST /api/deepstrain/activate-cli
 *
 * Direct CLI activation: email + password → deepstrain license payload.
 * Used by `deepstrain configure --email you@example.com`.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getUser, getDeepstrainLicense } from "../../../lib/store";

const RESEND_KEY   = process.env.RESEND_API_KEY           || "";
const NOTIFY_EMAIL = process.env.FOUNDER_NOTIFY_EMAIL     || "";
const FROM_EMAIL   = process.env.DEEPSTRAIN_FROM_EMAIL    || "deepstrain <noreply@massiron.com>";

async function notifyAdmin(email: string, tier: string): Promise<void> {
  if (!RESEND_KEY || !NOTIFY_EMAIL) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL, to: [NOTIFY_EMAIL],
        subject: `[DEEPSTRAIN] Activation — ${tier}`,
        html: `<pre>email: ${email}\ntier: ${tier}\ntime: ${new Date().toISOString()}</pre>`,
      }),
    });
  } catch { /* non-critical */ }
}

function timingSafeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a.padEnd(64, "\0").slice(0, 64));
  const bb = Buffer.from(b.padEnd(64, "\0").slice(0, 64));
  return crypto.timingSafeEqual(ba, bb) && a.length === b.length;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + (process.env.DEEPSTRAIN_SECRET_KEY || "salt")).digest("hex");
}

type Response =
  | { success: true;  license: object; tier: string; expires: string }
  | { success: false; error: string; upgrade_url?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "email and password required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user   = await getUser(normalizedEmail);
  const stored = user?.passwordHash ?? "0".repeat(64);
  const valid  = user !== null && timingSafeCompare(stored, hashPassword(String(password)));

  if (!valid) {
    return res.status(401).json({ success: false, error: "invalid credentials" });
  }

  const lic = await getDeepstrainLicense(normalizedEmail);
  if (!lic) {
    return res.status(402).json({
      success:     false,
      error:       "no active deepstrain subscription",
      upgrade_url: "https://deepstrain.dev/pricing",
    });
  }

  if (new Date(lic.expires_at) < new Date()) {
    return res.status(402).json({
      success:     false,
      error:       "deepstrain subscription expired",
      upgrade_url: "https://deepstrain.dev/pricing",
    });
  }

  await notifyAdmin(normalizedEmail, lic.tier);
  return res.status(200).json({
    success: true,
    license: lic,
    tier:    lic.tier,
    expires: lic.expires_at,
  });
}
