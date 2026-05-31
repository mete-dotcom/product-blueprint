/**
 * POST /api/deepstrain/activate-session
 * { email, password, session }
 *
 * Called by the web UI after login: stores the license in KV so the
 * CLI polling loop at /api/deepstrain/session can pick it up immediately.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getUser, getDeepstrainLicense, setDeepstrainActivation } from "../../../lib/store";
import { pricingUrl } from "../../../lib/site";

function timingSafeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a.padEnd(64, "\0").slice(0, 64));
  const bb = Buffer.from(b.padEnd(64, "\0").slice(0, 64));
  return crypto.timingSafeEqual(ba, bb) && a.length === b.length;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + (process.env.DEEPSTRAIN_SECRET_KEY || "salt")).digest("hex");
}

type Response =
  | { status: "activated" }
  | { status: "needs_payment"; upgrade_url: string }
  | { status: "expired";       upgrade_url: string }
  | { status: "error";         message: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, session } = req.body ?? {};
  if (!email || !password || !session) {
    return res.status(400).json({ status: "error", message: "email, password, session required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user   = await getUser(normalizedEmail);
  const stored = user?.passwordHash ?? "0".repeat(64);
  const valid  = user !== null && timingSafeCompare(stored, hashPassword(String(password)));

  if (!valid) return res.status(401).json({ status: "error", message: "invalid credentials" });

  const lic = await getDeepstrainLicense(normalizedEmail);
  if (!lic) {
    return res.status(200).json({
      status:      "needs_payment",
      upgrade_url: pricingUrl("deepstrain"),
    });
  }

  if (new Date(lic.expires_at) < new Date()) {
    return res.status(200).json({
      status:      "expired",
      upgrade_url: pricingUrl("deepstrain"),
    });
  }

  // Push to KV — CLI will pick up within 2 seconds
  await setDeepstrainActivation(String(session), lic, 7200);
  return res.status(200).json({ status: "activated" });
}
