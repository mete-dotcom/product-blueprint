/**
 * /api/admin/tiers  — admin-only tier visibility control.
 *
 *   GET  → { catalog, visibility }   (requires x-admin-key)
 *   POST { product, tier, visible }  → toggle one tier (requires x-admin-key)
 *
 * Auth: header `x-admin-key` must equal DEEPSTRAIN_ADMIN_KEY (timing-safe).
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { TIER_CATALOG, getVisibilityMap, setTierVisibility } from "../../../lib/tier-config";

const ADMIN_KEY = process.env.DEEPSTRAIN_ADMIN_KEY || "admin-dev-key-change-in-production";

function authOk(req: NextApiRequest): boolean {
  const given = (req.headers["x-admin-key"] as string) || "";
  const a = Buffer.from(given, "utf-8");
  const b = Buffer.from(ADMIN_KEY, "utf-8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!authOk(req)) return res.status(401).json({ error: "unauthorized" });

  if (req.method === "GET") {
    const visibility = await getVisibilityMap();
    return res.status(200).json({ catalog: TIER_CATALOG, visibility });
  }

  if (req.method === "POST") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body ?? {});
    const product = String(body.product || "");
    const tier    = String(body.tier || "");
    const visible = Boolean(body.visible);

    if (!TIER_CATALOG[product] || !TIER_CATALOG[product].includes(tier)) {
      return res.status(400).json({ error: "unknown product/tier", catalog: TIER_CATALOG });
    }
    const visibility = await setTierVisibility(product, tier, visible);
    return res.status(200).json({ ok: true, product, tier, visible, visibility });
  }

  return res.status(405).end();
}
