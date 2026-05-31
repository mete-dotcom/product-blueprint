import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getUser, setSession } from "../../lib/store";
import type { Session } from "../../lib/store";

type LoginResponse = {
  success: boolean;
  error?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    tier: string;
  };
};

function generateToken(userId: string): string {
  const header  = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    })
  ).toString("base64url");
  const secret    = process.env.DEEPSTRAIN_SECRET_KEY || "deepstrain-offline-fallback-key-change-in-production";
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

/**
 * POST /api/login
 *
 * Authenticates a user against Vercel KV and returns a session token.
 * Password is hashed with SHA-256 + DEEPSTRAIN_SECRET_KEY salt.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await getUser(normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // Hash matches register.ts (SHA-256 + salt)
    const salt       = process.env.DEEPSTRAIN_SECRET_KEY || "salt";
    const hashedInput = crypto.createHash("sha256").update(String(password) + salt).digest("hex");
    if (hashedInput !== user.passwordHash) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token     = generateToken(user.id);
    const expiresAt = new Date(Date.now() + 86400 * 7 * 1000).toISOString();

    const session: Session = {
      token,
      userId:  user.id,
      email:   user.email,
      created: new Date().toISOString(),
      expires: expiresAt,
    };
    await setSession(token, session); // TTL derived from session.expires inside setSession

    return res.status(200).json({
      success: true,
      token,
      user: {
        id:    user.id,
        email: user.email,
        name:  user.name,
        tier:  user.tier ?? "free",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
