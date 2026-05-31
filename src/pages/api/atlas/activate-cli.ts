/**
 * POST /api/atlas/activate-cli
 *
 * Direct CLI activation: email + password → Atlas license payload.
 * Used by `atlas activate --email you@example.com`.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getUser, getAtlasLicense } from "../../../lib/store";

const SECRET = process.env.ATLAS_LICENSE_SECRET || "atlas-dev-secret-do-not-use-in-production";

function timingSafeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a.padEnd(64, "\0").slice(0, 64));
  const bb = Buffer.from(b.padEnd(64, "\0").slice(0, 64));
  return crypto.timingSafeEqual(ba, bb) && a.length === b.length;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + (process.env.DEEPSTRAIN_SECRET_KEY || "salt")).digest("hex");
}

type Response =
  | { success: true; license: object; tier: string; expires: string }
  | { success: false; error: string; upgrade_url?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "email and password required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // constant-time auth
  const user = await getUser(normalizedEmail);
  const stored = user?.passwordHash ?? "0".repeat(64);
  const incoming = hashPassword(String(password));
  const valid = user !== null && timingSafeCompare(stored, incoming);

  if (!valid) {
    return res.status(401).json({ success: false, error: "invalid credentials" });
  }

  const lic = await getAtlasLicense(normalizedEmail);
  if (!lic) {
    return res.status(402).json({
      success: false,
      error: "no active atlas subscription",
      upgrade_url: "https://atlas.tools/pricing",
    });
  }

  if (new Date(lic.expires_at) < new Date()) {
    return res.status(402).json({
      success: false,
      error: "atlas subscription expired",
      upgrade_url: "https://atlas.tools/pricing",
    });
  }

  return res.status(200).json({
    success: true,
    license: lic,
    tier: lic.tier,
    expires: lic.expires_at,
  });
}
