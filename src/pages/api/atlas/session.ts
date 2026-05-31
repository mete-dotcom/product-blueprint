/**
 * GET /api/atlas/session?id=SESSION_ID
 *
 * CLI polls this endpoint after `atlas activate` opens the browser.
 * Returns license once and deletes it (one-time pickup).
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getAtlasActivation, deleteAtlasActivation } from "../../../lib/store";

type Response =
  | { status: "ready"; license: object }
  | { status: "pending" }
  | { status: "error"; message: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== "GET") return res.status(405).end();

  const id = String(req.query.id ?? "").trim();
  if (!id) return res.status(400).json({ status: "error", message: "id required" });

  const lic = await getAtlasActivation(id);
  if (!lic) return res.status(200).json({ status: "pending" });

  // one-time delivery
  await deleteAtlasActivation(id);
  return res.status(200).json({ status: "ready", license: lic });
}
