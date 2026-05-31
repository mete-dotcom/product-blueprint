/**
 * GET /api/tiers  — PUBLIC. Returns which pricing tiers are hidden.
 *
 *   GET /api/tiers              → { hidden: ["deepstrain:enterprise", ...] }
 *   GET /api/tiers?product=atlas → { hidden: ["atlas:solo", ...] }
 *
 * Pricing pages fetch this and hide any tier whose "{product}:{tier}" is listed.
 * Cached at the edge for 60s to keep pricing pages fast.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getHiddenTiers } from "../../lib/tier-config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const product = req.query.product ? String(req.query.product) : undefined;
  try {
    const hidden = await getHiddenTiers(product);
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ hidden });
  } catch {
    // Fail open — never break pricing pages if KV hiccups
    return res.status(200).json({ hidden: [] });
  }
}
