import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getUser, setUser } from "../../lib/store";
import type { User } from "../../lib/store";

type RegisterResponse = {
  success: boolean;
  error?: string;
  user_id?: string;
  message?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/register
 *
 * Registers a new user (shared account for DeepStrain + Atlas).
 * Stores user in Vercel KV under key `user:{email}`.
 *
 * Password is hashed with SHA-256 + DEEPSTRAIN_SECRET_KEY salt.
 * (The atlas activate-cli routes use the same hash so one account
 *  works for both products.)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { email, name, password } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: "Invalid email format" });
    }
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Name is required (min 2 characters)" });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ success: false, error: "Password is required (min 8 characters)" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await getUser(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }

    const userId = crypto.randomUUID();
    // Hash with salt so it matches what atlas/activate-cli.ts verifies
    const salt         = process.env.DEEPSTRAIN_SECRET_KEY || "salt";
    const passwordHash = crypto.createHash("sha256").update(password + salt).digest("hex");

    const user: User = {
      id:           userId,
      email:        normalizedEmail,
      name:         name.trim(),
      passwordHash,
      tier:         "free",
      created:      new Date().toISOString(),
      verified:     false,
    };

    await setUser(normalizedEmail, user);

    console.log(`[Register] New user: ${normalizedEmail} (${userId})`);

    return res.status(201).json({
      success: true,
      user_id: userId,
      message:  "Registration successful.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
