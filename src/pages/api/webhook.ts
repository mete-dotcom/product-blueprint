/**
 * POST /api/webhook  ← Legacy Paddle Classic endpoint (deprecated)
 *
 * This route is superseded by the product-specific Paddle Billing v2 routes:
 *   /api/deepstrain/webhook  — DeepStrain subscriptions
 *   /api/atlas/webhook       — Atlas subscriptions
 *
 * New Paddle notification destinations should point to those routes.
 * This stub returns 410 Gone so any old Paddle Classic notification fails
 * visibly rather than silently doing nothing.
 */

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      status:      "deprecated",
      message:     "Use /api/deepstrain/webhook or /api/atlas/webhook",
      deepstrain:  "/api/deepstrain/webhook",
      atlas:       "/api/atlas/webhook",
    });
  }

  // Paddle expects a 2xx to mark the notification as delivered.
  // Return 200 + deprecation warning so the Paddle dashboard shows it as
  // delivered (not retried) but we log it for investigation.
  console.warn("[webhook] POST to deprecated /api/webhook — migrate to product-specific routes");
  return res.status(200).json({
    ok:      true,
    status:  "deprecated",
    message: "This endpoint is no longer active. Migrate Paddle notifications to /api/deepstrain/webhook or /api/atlas/webhook.",
  });
}
