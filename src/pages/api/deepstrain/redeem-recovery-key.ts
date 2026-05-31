/**
 * POST /api/deepstrain/redeem-recovery-key
 *
 * CLI endpoint: exchange a one-time recovery key for a DeepStrain license.
 * Called by `deepstrain activate --recovery-key RK1-DS-... --email user@x.com`.
 *
 * Security:
 *   • HMAC-SHA256 verified — unforgeable without RECOVERY_SECRET
 *   • Single-use: KV record prevents replay attacks
 *   • 24h expiry window enforced
 *   • Email + sale_id must match what was signed — prevents key transfer
 *   • Rate-limited by Edge Middleware: /api/:p/recovery* → 5 req/60s/IP
 *   • No admin key needed — the HMAC provides the security guarantee
 *
 * Request body (JSON):
 *   {
 *     token:   "RK1-DS-<sig>",
 *     email:   "user@example.com",
 *     sale_id: "sub_xxx"           ← from customer's receipt / dashboard
 *   }
 *
 * Response 200:
 *   { success: true, license: DeepstrainLicense, tier: string, expires: string }
 *
 * Response 4xx:
 *   { success: false, error: string }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { redeemRecoveryKey } from "../../../lib/recovery-key";
import { getDeepstrainLicense } from "../../../lib/store";

type OkResponse  = { success: true;  license: object; tier: string; expires: string };
type ErrResponse = { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OkResponse | ErrResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "method not allowed" });
  }

  const { token, email, sale_id } = req.body ?? {};
  if (!token || !email || !sale_id) {
    return res.status(400).json({
      success: false,
      error:   "token, email, and sale_id are required",
    });
  }

  // ── Validate and consume the recovery key ─────────────────────────────────
  const result = await redeemRecoveryKey({
    token:    String(token).trim(),
    product:  "deepstrain",
    email:    String(email).trim(),
    sale_id:  String(sale_id).trim(),
  });

  if (!result.ok) {
    const status = result.code === "expired" ? 410
                 : result.code === "used"    ? 409
                 : 400;
    return res.status(status).json({ success: false, error: result.error });
  }

  // ── Fetch the license from KV ─────────────────────────────────────────────
  const normalizedEmail = result.payload.email.toLowerCase();
  const lic = await getDeepstrainLicense(normalizedEmail);

  if (!lic) {
    // Key was valid but license record is somehow gone — admin needs to fix KV
    return res.status(500).json({
      success: false,
      error:
        "License record not found in database. " +
        "Please contact support — your activation key was valid.",
    });
  }

  return res.status(200).json({
    success: true,
    license: lic,
    tier:    lic.tier,
    expires: lic.expires_at,
  });
}
