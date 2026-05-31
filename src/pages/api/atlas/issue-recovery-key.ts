/**
 * POST /api/atlas/issue-recovery-key
 *
 * Admin-only: issue a single-use recovery key for an Atlas customer whose
 * activation failed despite a valid purchase.
 *
 * Requires: Authorization: Bearer <RECOVERY_ADMIN_KEY>
 * Body: { email: string, sale_id: string }
 *
 * Customer runs:
 *   atlas activate --recovery-key "RK1-AT-..." --email user@x.com
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { issueRecoveryKey, verifyAdminKey } from "../../../lib/recovery-key";
import { getAtlasLicense } from "../../../lib/store";

type OkResponse  = { token: string; email: string; sale_id: string; issued_at: number; expires_at: number; instructions: string };
type ErrResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OkResponse | ErrResponse>
) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  if (!verifyAdminKey(req.headers.authorization)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { email, sale_id } = req.body ?? {};
  if (!email || !sale_id) {
    return res.status(400).json({ error: "email and sale_id are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const lic = await getAtlasLicense(normalizedEmail);
  if (!lic) {
    return res.status(404).json({
      error: `No Atlas license found for ${normalizedEmail}.`,
    });
  }

  const payload = issueRecoveryKey({
    product: "atlas",
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
      `atlas activate --recovery-key "${payload.token}" --email "${normalizedEmail}"\n` +
      `Expires in 24h, single-use only.`,
  });
}
