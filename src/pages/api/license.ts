import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getLicense, setLicense, getAllLicenses, getUser } from "../../lib/store";
import type { License } from "../../lib/store";

type LicenseResponse = {
  success: boolean;
  error?: string;
  license?: {
    key: string;
    email: string;
    tier: string;
    issued: string;
    expires: string;
    valid: boolean;
    machine_id?: string;
  };
  licenses?: Array<{
    key: string;
    email: string;
    tier: string;
    issued: string;
    expires: string;
    valid: boolean;
  }>;
};

const SECRET_KEY = process.env.DEEPSTRAIN_SECRET_KEY || "deepstrain-offline-fallback-key-change-in-production";

const TIER_SEGMENTS: Record<string, string> = {
  starter:    "S0001",
  solo:       "S0001",
  pro:        "P0002",
  team:       "P0002",
  enterprise: "E0003",
};

const TIER_DURATIONS: Record<string, number> = {
  starter:    365,
  solo:       35,   // subscription model — 35 days, auto-renewed by Paddle
  pro:        35,
  team:       35,
  enterprise: 35,
};

function generateLicenseKey(email: string, tier: string = "pro"): string {
  const tierId          = TIER_SEGMENTS[tier] || "P0002";
  const issueTimestamp  = Math.floor(Date.now() / 1000);
  const issueBase36     = issueTimestamp.toString(36).toUpperCase();
  const randomPart      = crypto.randomBytes(3).toString("hex").toUpperCase();
  const payload         = `DSTR-${tierId}-${issueBase36}-${randomPart}`;
  const hmac            = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex").substring(0, 5).toUpperCase();
  return `${payload}-${hmac}`;
}

/**
 * POST /api/license — Create a new license
 * GET  /api/license — List licenses (requires ?email= query)
 * DELETE /api/license — Cancel/revoke a license
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<LicenseResponse>) {
  switch (req.method) {
    case "POST":   return handleCreate(req, res);
    case "GET":    return handleList(req, res);
    case "DELETE": return handleCancel(req, res);
    default:       return res.status(405).json({ success: false, error: "Method not allowed" });
  }
}

async function handleCreate(req: NextApiRequest, res: NextApiResponse<LicenseResponse>) {
  const { email, tier = "pro" } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  const normalizedEmail = email.toLowerCase().trim();

  const user = await getUser(normalizedEmail);
  if (!user) return res.status(404).json({ success: false, error: "User not found. Please register first." });

  const key      = generateLicenseKey(normalizedEmail, tier);
  const duration = TIER_DURATIONS[tier] ?? 35;
  const issued   = new Date().toISOString();
  const expires  = new Date(Date.now() + duration * 86400000).toISOString();

  const license: License = {
    key,
    userId: user.id,
    email:  normalizedEmail,
    tier:   tier as string,
    issued,
    expires,
    valid:  true,
  };

  await setLicense(key, license);

  console.log(`[License] Created ${tier} license for ${normalizedEmail}: ${key}`);

  return res.status(201).json({
    success: true,
    license: { key, email: normalizedEmail, tier, issued, expires, valid: true },
  });
}

async function handleList(req: NextApiRequest, res: NextApiResponse<LicenseResponse>) {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ success: false, error: "Email query parameter is required" });

  const normalizedEmail = email.toLowerCase().trim();
  const allLicenses     = await getAllLicenses();
  const now             = new Date();

  const userLicenses = allLicenses
    .filter((lic) => lic.email === normalizedEmail)
    .map((lic) => ({
      key:    lic.key,
      email:  lic.email,
      tier:   lic.tier,
      issued: lic.issued,
      expires: lic.expires,
      valid:  lic.valid && new Date(lic.expires) > now,
    }));

  return res.status(200).json({ success: true, licenses: userLicenses });
}

async function handleCancel(req: NextApiRequest, res: NextApiResponse<LicenseResponse>) {
  const { key } = req.body;
  if (!key) return res.status(400).json({ success: false, error: "License key is required" });

  const license = await getLicense(key);
  if (!license) return res.status(404).json({ success: false, error: "License not found" });

  license.valid = false; // revoke
  await setLicense(key, license);

  console.log(`[License] Revoked license ${key} for ${license.email}`);

  return res.status(200).json({
    success: true,
    license: {
      key,
      email:   license.email,
      tier:    license.tier,
      issued:  license.issued,
      expires: license.expires,
      valid:   false,
    },
  });
}
