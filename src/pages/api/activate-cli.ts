import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getUser, getAllLicenses } from "../../lib/store";

/**
 * POST /api/activate-cli
 *
 * DeepStrain CLI activation: email + password → signed license payload.
 * Called by `deepstrain configure --email you@example.com`.
 *
 * Returns a payload that the CLI writes to ~/.deepstrain/.license.
 * Raw DSTR key is never returned — only the HMAC-signed payload.
 */

const SECRET_KEY = process.env.DEEPSTRAIN_SECRET_KEY || "deepstrain-offline-fallback-key-change-in-production";

type ActivateResponse =
  | { success: true;  payload: Record<string, string>; signature: string; tier: string; expires: string }
  | { success: false; error: string; upgrade_url?: string };

function signPayload(payload: Record<string, string>): string {
  const sorted: Record<string, string> = {};
  Object.keys(payload).sort().forEach((k) => { sorted[k] = payload[k]; });
  return crypto.createHmac("sha256", SECRET_KEY).update(JSON.stringify(sorted)).digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ActivateResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { email, password } = req.body ?? {};
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // ── Constant-time credential check ─────────────────────────────────────────
  const salt        = SECRET_KEY;
  const hashedInput = crypto.createHash("sha256").update(String(password) + salt).digest("hex");
  const dummyHash   = "0".repeat(64);

  let user;
  try {
    user = await getUser(normalizedEmail);
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }

  const storedHash    = user?.passwordHash ?? dummyHash;
  const passwordMatch =
    user !== null && user !== undefined &&
    crypto.timingSafeEqual(
      Buffer.from(hashedInput.padEnd(64, "0").slice(0, 64), "hex"),
      Buffer.from(storedHash.padEnd(64, "0").slice(0, 64), "hex"),
    );

  if (!passwordMatch) {
    return res.status(401).json({ success: false, error: "Invalid email or password" });
  }

  // ── Find active license ─────────────────────────────────────────────────────
  let allLicenses;
  try {
    allLicenses = await getAllLicenses();
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }

  const now            = new Date();
  const activeLicense  = allLicenses
    .filter((l) => l.email === normalizedEmail && l.valid && new Date(l.expires) > now)
    .sort((a, b) => b.issued.localeCompare(a.issued))[0] ?? null;

  if (!activeLicense) {
    return res.status(403).json({
      success:     false,
      error:       "No active subscription found for this account.",
      upgrade_url: "https://vercel-commerce-sage.vercel.app/pricing",
    });
  }

  // ── Build signed payload ────────────────────────────────────────────────────
  const payload: Record<string, string> = {
    activated_at:   new Date().toISOString(),
    customer_email: normalizedEmail,
    expires:        activeLicense.expires,
    tier:           activeLicense.tier,
    version:        "1.0",
  };

  const signature = signPayload(payload);

  return res.status(200).json({
    success: true,
    payload,
    signature,
    tier:    activeLicense.tier,
    expires: activeLicense.expires,
  });
}
