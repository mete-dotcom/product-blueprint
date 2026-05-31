/**
 * GET /api/atlas/admin
 *
 * Returns all Atlas license records from KV.
 * Requires X-Admin-Key header (same key as /api/admin).
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";
import type { AtlasLicense } from "../../../lib/store";

const ADMIN_KEY = process.env.DEEPSTRAIN_ADMIN_KEY || "admin-dev-key-change-in-production";

type AtlasAdminEntry = {
  email:     string;
  tier:      string;
  modules:   string[];
  issued_at: string;
  expires_at: string;
  active:    boolean;
  sale_id:   string;
};

type Response =
  | {
      success: true;
      data: {
        licenses: AtlasAdminEntry[];
        stats: {
          total: number;
          active: number;
          by_tier: Record<string, number>;
          mrr_estimate: number;
        };
      };
    }
  | { success: false; error: string };

const TIER_PRICES: Record<string, number> = {
  free:       0,
  solo:       Number(process.env.NEXT_PUBLIC_ATLAS_PRICE ?? "19"),
  pro:        Number(process.env.NEXT_PUBLIC_ATLAS_PRICE ?? "19") * 2,
  enterprise: Number(process.env.NEXT_PUBLIC_ATLAS_PRICE ?? "19") * 4,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) {
    return res.status(401).json({ success: false, error: "invalid admin key" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "method not allowed" });
  }

  try {
    const keys = await kv.keys("atlas:lic:*");
    let licenses: AtlasAdminEntry[] = [];

    if (keys.length > 0) {
      const raw = await kv.mget<AtlasLicense[]>(...keys);
      const now = new Date();
      licenses = raw
        .filter((l): l is AtlasLicense => l !== null)
        .map((l) => ({
          email:      l.email,
          tier:       l.tier,
          modules:    l.modules,
          issued_at:  l.issued_at,
          expires_at: l.expires_at,
          active:     new Date(l.expires_at) > now,
          sale_id:    l.sale_id,
        }))
        .sort((a, b) => b.issued_at.localeCompare(a.issued_at));
    }

    const active = licenses.filter((l) => l.active).length;
    const by_tier: Record<string, number> = {};
    let mrr = 0;
    for (const l of licenses) {
      if (l.active) {
        by_tier[l.tier] = (by_tier[l.tier] ?? 0) + 1;
        mrr += TIER_PRICES[l.tier] ?? 0;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        licenses,
        stats: { total: licenses.length, active, by_tier, mrr_estimate: mrr },
      },
    });
  } catch (err) {
    console.error("[atlas/admin] error:", err);
    return res.status(500).json({ success: false, error: "internal error" });
  }
}
