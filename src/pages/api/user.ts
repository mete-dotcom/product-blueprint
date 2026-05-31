import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getUser, getAllLicenses, getSession, getAllUsers } from "../../lib/store";

type UserResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    tier: string;
    created: string;
    licenses: Array<{
      key: string;
      tier: string;
      issued: string;
      expires: string;
      valid: boolean;
    }>;
  };
};

/**
 * GET /api/user
 *
 * Returns the authenticated user's profile and licenses from Vercel KV.
 * Requires `Authorization: Bearer <token>` header.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<UserResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Missing or invalid authorization header" });
    }

    const token = authHeader.substring(7);
    const now   = new Date();

    function licenseRow(lic: Awaited<ReturnType<typeof getAllLicenses>>[number]) {
      return {
        key:     lic.key,
        tier:    lic.tier,
        issued:  lic.issued,
        expires: lic.expires,
        valid:   lic.valid && new Date(lic.expires) > now,
      };
    }

    // ── Session-based auth (from login.ts) ──────────────────────────────────
    const session = await getSession(token);
    if (session) {
      const user = await getUser(session.email);
      if (!user) return res.status(404).json({ success: false, error: "User not found" });

      const allLicenses  = await getAllLicenses();
      const userLicenses = allLicenses.filter((l) => l.email === user.email).map(licenseRow);

      return res.status(200).json({
        success: true,
        user: {
          id:       user.id,
          email:    user.email,
          name:     user.name,
          tier:     user.tier ?? "free",
          created:  user.created,
          licenses: userLicenses,
        },
      });
    }

    // ── JWT fallback (legacy tokens issued before session store) ────────────
    const secret = process.env.DEEPSTRAIN_SECRET_KEY || "deepstrain-offline-fallback-key-change-in-production";
    const parts  = token.split(".");
    if (parts.length !== 3) {
      return res.status(401).json({ success: false, error: "Invalid token format" });
    }

    const expectedSig = crypto.createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest("base64url");
    if (parts[2] !== expectedSig) {
      return res.status(401).json({ success: false, error: "Invalid token signature" });
    }

    let payload: { sub: string; exp: number };
    try {
      payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    } catch {
      return res.status(401).json({ success: false, error: "Invalid token payload" });
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ success: false, error: "Token expired" });
    }

    const allUsers  = await getAllUsers();
    const foundUser = allUsers.find((u) => {
      const hashed = crypto.createHash("sha256").update(u.email).digest("hex").substring(0, 16);
      return hashed === payload.sub;
    });

    if (!foundUser) return res.status(404).json({ success: false, error: "User not found" });

    const allLicenses  = await getAllLicenses();
    const userLicenses = allLicenses.filter((l) => l.email === foundUser.email).map(licenseRow);

    return res.status(200).json({
      success: true,
      user: {
        id:       payload.sub,
        email:    foundUser.email,
        name:     foundUser.name,
        tier:     foundUser.tier ?? "free",
        created:  foundUser.created,
        licenses: userLicenses,
      },
    });
  } catch (error) {
    console.error("User error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
