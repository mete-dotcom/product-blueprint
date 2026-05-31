import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { getUser, setUser, getAllLicenses } from "../../lib/store";

const kv = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });
import type { User } from "../../lib/store";

/**
 * POST /api/activate-session
 *
 * DeepStrain web activation: email + password → session KV entry.
 * Called from /activate after the user submits their credentials.
 *
 * Outcomes:
 *   { status: "activated" }    — active license found; payload written to
 *                                KV so the CLI polling loop can pick it up.
 *   { status: "needs_payment" } — account exists (or just created), no license.
 *   HTTP 401                   — wrong password for an existing account.
 */

const SECRET_KEY = process.env.DEEPSTRAIN_LICENSE_SECRET ||
                   process.env.DEEPSTRAIN_SECRET_KEY ||
                   "deepstrain-offline-fallback-key-change-in-production";

type ActivateSessionResponse =
  | { status: "activated"; tier: string; expires: string }
  | { status: "needs_payment" }
  | { error: string };

function signPayload(payload: Record<string, string>): string {
  const sorted: Record<string, string> = {};
  Object.keys(payload).sort().forEach((k) => { sorted[k] = payload[k]; });
  return crypto.createHmac("sha256", SECRET_KEY).update(JSON.stringify(sorted)).digest("hex");
}

function safeCompare(a: string, b: string): boolean {
  const pa = a.padEnd(64, "0").slice(0, 64);
  const pb = b.padEnd(64, "0").slice(0, 64);
  return crypto.timingSafeEqual(Buffer.from(pa, "hex"), Buffer.from(pb, "hex"));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ActivateSessionResponse>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, session } = req.body ?? {};
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const salt            = process.env.DEEPSTRAIN_SECRET_KEY || "salt";
  const inputHash       = crypto.createHash("sha256").update(String(password) + salt).digest("hex");
  const dummyHash       = "0".repeat(64);

  let user: User | null;
  try {
    user = await getUser(normalizedEmail);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }

  if (!user) {
    // New user: create account, redirect to payment
    const newUser: User = {
      id:           crypto.randomUUID(),
      email:        normalizedEmail,
      name:         normalizedEmail.split("@")[0],
      passwordHash: inputHash,
      tier:         "free",
      created:      new Date().toISOString(),
      verified:     false,
    };
    try { await setUser(normalizedEmail, newUser); } catch { /* non-fatal */ }
    return res.status(200).json({ status: "needs_payment" });
  }

  // Existing user: verify password
  const storedHash  = user.passwordHash ?? dummyHash;
  const passwordOk  = safeCompare(inputHash, storedHash);
  if (!passwordOk) return res.status(401).json({ error: "Incorrect password" });

  // Find active license
  const allLicenses   = await getAllLicenses().catch(() => []);
  const now           = new Date();
  const activeLicense = allLicenses
    .filter((l) => l.email === normalizedEmail && l.valid && new Date(l.expires) > now)
    .sort((a, b) => b.issued.localeCompare(a.issued))[0] ?? null;

  if (!activeLicense) {
    return res.status(200).json({ status: "needs_payment" });
  }

  // Push signed payload to KV so CLI polling loop can pick it up
  const payload: Record<string, string> = {
    activated_at:   new Date().toISOString(),
    customer_email: normalizedEmail,
    expires:        activeLicense.expires,
    tier:           activeLicense.tier,
    version:        "1.0",
  };
  const signature = signPayload(payload);

  if (session && typeof session === "string" && /^[a-f0-9-]{8,64}$/.test(session)) {
    await kv.set(`activation:${session}`, { payload, signature }, { ex: 7200 }).catch(() => {});
  }

  return res.status(200).json({
    status:  "activated",
    tier:    activeLicense.tier,
    expires: activeLicense.expires,
  });
}
