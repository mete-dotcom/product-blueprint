/**
 * POST /api/admin/issue-dev-license
 *
 * Issue a real, KV-backed license WITHOUT a LemonSqueezy purchase — for testing
 * the full activation / login / pricing funnel with a working account.
 *
 * Writes to the SAME keys and uses the SAME HMAC scheme as the production
 * webhook, so the issued license activates exactly like a paid one:
 *   deepstrain:lic:{email}   +   deepstrain:act:{session}   (if session given)
 *
 * Auth: X-Admin-Key header must equal DEEPSTRAIN_ADMIN_KEY.
 * This endpoint is intentionally admin-gated — never expose the key publicly.
 *
 * Example:
 *   curl -X POST https://massiron.com/api/admin/issue-dev-license \
 *     -H "X-Admin-Key: $DEEPSTRAIN_ADMIN_KEY" \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"dev@massiron.com","tier":"enterprise","days":365}'
 */

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import {
  setDeepstrainLicense,
  setDeepstrainActivation,
  type DeepstrainLicense,
} from "../../../lib/store";

const ADMIN_KEY  = process.env.DEEPSTRAIN_ADMIN_KEY    || "admin-dev-key-change-in-production";
const DS_SECRET  = process.env.DEEPSTRAIN_LICENSE_SECRET || "ds-dev-secret-do-not-use-in-production";

type DSTier = "solo" | "team" | "enterprise";
const TIERS: DSTier[] = ["solo", "team", "enterprise"];

/** Identical canonical+HMAC scheme to the production webhook. */
function signDeepstrainLicense(
  email: string, tier: DSTier, days: number, saleId: string,
): DeepstrainLicense {
  const now     = new Date();
  const expires = new Date(now.getTime() + days * 86400000);

  const payload: Omit<DeepstrainLicense, "signature"> = {
    version:         "1.0",
    email,
    tier,
    sale_id:         saleId,
    subscription_id: saleId,
    issued_at:       now.toISOString(),
    expires_at:      expires.toISOString(),
  };

  const canonical = JSON.stringify(
    Object.fromEntries(Object.entries(payload).sort()),
  ).replace(/\s/g, "");

  const signature = crypto.createHmac("sha256", DS_SECRET).update(canonical).digest("hex");
  return { ...payload, signature };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "invalid admin key" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }

  const { email, tier = "enterprise", days = 365, session = "", product = "deepstrain" } =
    (req.body ?? {}) as { email?: string; tier?: string; days?: number; session?: string; product?: string };

  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "valid email required" });
  }
  if (product !== "deepstrain") {
    // Atlas/adauto use different license shapes (modules[] / key) — add when needed.
    return res.status(400).json({ ok: false, error: `product '${product}' not supported yet (deepstrain only)` });
  }
  const dsTier: DSTier = TIERS.includes(tier as DSTier) ? (tier as DSTier) : "enterprise";

  try {
    const lic = signDeepstrainLicense(email.toLowerCase(), dsTier, Number(days) || 365, `dev-${Date.now()}`);
    await setDeepstrainLicense(email.toLowerCase(), lic);
    if (session) await setDeepstrainActivation(session, lic, 7200);

    return res.status(200).json({
      ok: true,
      product: "deepstrain",
      email: email.toLowerCase(),
      tier: dsTier,
      expires_at: lic.expires_at,
      session: session || null,
      license: lic,
      note: "Real KV-backed license. Activates like a paid one. CLI polls session if provided.",
    });
  } catch (err) {
    console.error("[issue-dev-license] error:", err);
    return res.status(500).json({ ok: false, error: "internal error (check UPSTASH_REDIS_REST_* env)" });
  }
}
