/**
 * POST /api/deepstrain/issue-recovery-key
 *
 * Admin-only endpoint: generate a single-use recovery key for a DeepStrain
 * customer whose activation command failed despite a valid purchase.
 *
 * Security:
 *   • Requires "Authorization: Bearer <RECOVERY_ADMIN_KEY>" header
 *   • Verifies the customer has an active DeepStrain license in KV
 *   • Rate-limited by Edge Middleware: /api/*/recovery* → 5 req/60s/IP
 *   • The key itself is HMAC-SHA256 signed — cannot be forged
 *
 * Request body (JSON):
 *   { email: string, sale_id: string }
 *   (sale_id = Paddle order/subscription ID from the customer's receipt)
 *
 * Response 200:
 *   {
 *     token:      "RK1-DS-<sig>",
 *     email:      "user@example.com",
 *     sale_id:    "sub_xxx",
 *     issued_at:  1234567890,
 *     expires_at: 1234654290,   ← issued_at + 86400 (24h)
 *     instructions: "..."
 *   }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { issueRecoveryKey, verifyAdminKey } from "../../../lib/recovery-key";
import { getDeepstrainLicense } from "../../../lib/store";

type OkResponse = {
  token:        string;
  email:        string;
  sale_id:      string;
  issued_at:    number;
  expires_at:   number;
  instructions: string;
};
type ErrResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OkResponse | ErrResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  // ── Admin authentication ──────────────────────────────────────────────────
  if (!verifyAdminKey(req.headers.authorization)) {
    return res.status(401).json({ error: "unauthorized — invalid or missing admin key" });
  }

  const { email, sale_id } = req.body ?? {};
  if (!email || !sale_id) {
    return res.status(400).json({ error: "email and sale_id are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // ── Verify the purchase exists in KV ─────────────────────────────────────
  // The customer must have an active license record (set by the webhook).
  // This prevents issuing recovery keys for unverified/unpaid accounts.
  const lic = await getDeepstrainLicense(normalizedEmail);
  if (!lic) {
    return res.status(404).json({
      error: `No DeepStrain license found for ${normalizedEmail}. ` +
             "Check that the Paddle webhook fired and the license was created.",
    });
  }

  // ── Issue the key ─────────────────────────────────────────────────────────
  const payload = issueRecoveryKey({
    product: "deepstrain",
    email:   normalizedEmail,
    sale_id: String(sale_id).trim(),
  });

  return res.status(200).json({
    token:      payload.token,
    email:      payload.email,
    sale_id:    payload.sale_id,
    issued_at:  payload.issued_at,
    expires_at: payload.expires_at,
    instructions:
      `Send this token to the customer. They run:\n` +
      `  deepstrain activate --recovery-key "${payload.token}" --email "${normalizedEmail}"\n` +
      `Key expires in 24 hours and can only be used once.`,
  });
}
