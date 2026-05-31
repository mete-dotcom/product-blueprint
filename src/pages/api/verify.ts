import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getLicense } from "../../lib/store";

type VerifyResponse = {
  valid: boolean;
  error?: string;
  expires?: string;
  tier?: string;
  issued?: string;
  machine_id?: string;
};

const SECRET_KEY = process.env.DEEPSTRAIN_SECRET_KEY || "deepstrain-offline-fallback-key-change-in-production";

/**
 * POST /api/verify
 *
 * Verifies a DeepStrain DSTR-format license key using HMAC-SHA256.
 * Also checks revocation status in Vercel KV.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false, error: "Method not allowed" });
  }

  try {
    const { key, machine_id } = req.body;

    if (!key || typeof key !== "string") {
      return res.status(400).json({ valid: false, error: "Missing key" });
    }

    const parts = key.trim().split("-");
    if (parts.length !== 5 || parts[0] !== "DSTR") {
      return res.status(400).json({ valid: false, error: "Invalid key format" });
    }

    // Verify embedded HMAC
    const hmacPart     = parts[4];
    const payload      = parts.slice(0, 4).join("-");
    const expectedHmac = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex").substring(0, 5).toUpperCase();

    if (hmacPart !== expectedHmac) {
      return res.status(401).json({ valid: false, error: "Invalid license key signature" });
    }

    const tierMap: Record<string, string> = {
      S0001: "starter",
      P0002: "pro",
      E0003: "enterprise",
    };
    const tier = tierMap[parts[1]] || "unknown";

    // Check KV for revocation / expiry
    const storedLicense = await getLicense(key.trim());
    if (storedLicense) {
      if (!storedLicense.valid) {
        return res.status(401).json({ valid: false, error: "License has been revoked" });
      }
      if (new Date(storedLicense.expires) < new Date()) {
        return res.status(401).json({ valid: false, error: "License has expired" });
      }

      return res.status(200).json({
        valid:      true,
        tier:       storedLicense.tier,
        expires:    storedLicense.expires,
        issued:     storedLicense.issued,
        machine_id: machine_id || undefined,
      });
    }

    // Not in KV — offline fallback: derive expiry from timestamp in key
    let expires: string;
    try {
      const issuedTimestamp = parseInt(parts[2], 36);
      const issuedDate      = new Date(issuedTimestamp * 1000);
      const durations: Record<string, number> = { starter: 365, pro: 365, enterprise: 730 };
      const expiryDate      = new Date(issuedDate);
      expiryDate.setDate(expiryDate.getDate() + (durations[tier] ?? 365));
      expires = expiryDate.toISOString();
    } catch {
      expires = new Date(Date.now() + 365 * 86400000).toISOString();
    }

    return res.status(200).json({
      valid:      true,
      tier,
      expires,
      issued:     new Date().toISOString(),
      machine_id: machine_id || undefined,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return res.status(500).json({ valid: false, error: "Internal server error" });
  }
}
