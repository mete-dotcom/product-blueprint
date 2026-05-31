/**
 * POST /api/atlas/redeem-recovery-key
 *
 * CLI endpoint: exchange a one-time Atlas recovery key for a license.
 * Called by `atlas activate --recovery-key RK1-AT-... --email user@x.com`.
 *
 * Body: { token: string, email: string, sale_id: string }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { redeemRecoveryKey } from "../../../lib/recovery-key";
import { getAtlasLicense } from "../../../lib/store";

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
    return res.status(400).json({ success: false, error: "token, email, and sale_id are required" });
  }

  const result = await redeemRecoveryKey({
    token:   String(token).trim(),
    product: "atlas",
    email:   String(email).trim(),
    sale_id: String(sale_id).trim(),
  });

  if (!result.ok) {
    const status = result.code === "expired" ? 410 : result.code === "used" ? 409 : 400;
    return res.status(status).json({ success: false, error: result.error });
  }

  const lic = await getAtlasLicense(result.payload.email.toLowerCase());
  if (!lic) {
    return res.status(500).json({
      success: false,
      error: "License record missing — contact support. Your key was valid.",
    });
  }

  return res.status(200).json({
    success: true,
    license: lic,
    tier:    lic.tier,
    expires: lic.expires_at,
  });
}
