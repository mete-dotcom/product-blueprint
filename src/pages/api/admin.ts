import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getAllUsers, getAllLicenses } from "../../lib/store";

type AdminResponse = {
  success: boolean;
  error?: string;
  data?: {
    users: Array<{
      id: string;
      email: string;
      name: string;
      tier: string;
      created: string;
      licenseCount: number;
    }>;
    licenses: Array<{
      key: string;
      email: string;
      tier: string;
      issued: string;
      expires: string;
      valid: boolean;
      cancelled: boolean;
    }>;
    stats: {
      totalUsers: number;
      totalLicenses: number;
      activeLicenses: number;
      revenue: {
        starter: number;
        pro: number;
        enterprise: number;
      };
    };
  };
};

const ADMIN_KEY = process.env.DEEPSTRAIN_ADMIN_KEY || "admin-dev-key-change-in-production";

const TIER_PRICES: Record<string, number> = {
  starter: 29,
  pro: 79,
  enterprise: 299,
};

/**
 * GET /api/admin
 *
 * Admin panel API — returns all users, licenses, and stats from Vercel KV.
 * Requires X-Admin-Key header for authentication.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<AdminResponse>) {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ success: false, error: "Invalid admin key" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Fetch all data from Vercel KV
    const allUsers = await getAllUsers();
    const allLicenses = await getAllLicenses();

    // Build users list
    const users = allUsers.map((u) => {
      const licenseCount = allLicenses.filter((l) => l.email === u.email).length;
      const hashedId = crypto.createHash("sha256").update(u.email).digest("hex").substring(0, 16);
      return {
        id: hashedId,
        email: u.email,
        name: u.name,
        tier: licenseCount > 0 ? "pro" : "free",
        created: u.created ?? new Date().toISOString(),   // field is `created`, not `createdAt`
        licenseCount,
      };
    });

    // Build licenses list
    const licenses = allLicenses.map((lic) => ({
      key:       lic.key,
      email:     lic.email,
      tier:      lic.tier,    // DeepStrain License interface uses `tier`, not `plan`
      issued:    lic.issued,  // field is `issued`, not `createdAt`
      expires:   lic.expires, // field is `expires`, not `expiresAt`
      valid:     lic.valid && new Date(lic.expires) > new Date(),
      cancelled: !lic.valid,
    }));

    // Calculate stats
    const activeLicenses = licenses.filter((l) => l.valid).length;
    const revenue: { starter: number; pro: number; enterprise: number } = {
      starter: 0,
      pro: 0,
      enterprise: 0,
    };
    licenses.forEach((l) => {
      if (l.valid && TIER_PRICES[l.tier]) {
        revenue[l.tier as keyof typeof revenue] += TIER_PRICES[l.tier];
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        users,
        licenses,
        stats: {
          totalUsers: users.length,
          totalLicenses: licenses.length,
          activeLicenses,
          revenue,
        },
      },
    });
  } catch (error) {
    console.error("Admin error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
