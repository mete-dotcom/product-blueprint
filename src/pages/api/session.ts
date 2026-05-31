import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const kv = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });

type ActivationData = {
  key: string;
  payload: Record<string, unknown>;
  signature: string;
};

type SessionResponse =
  | { status: "ready"; key: string; payload: Record<string, unknown>; signature: string }
  | { status: "pending" }
  | { error: string };

/**
 * GET /api/session?id=SESSION_ID
 *
 * Terminal polls this every 3 s after deepstrain configure opens the browser.
 * Returns license data when Paddle payment confirms (webhook stored it in KV).
 * One-time read: key is deleted on first successful retrieval.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = ((req.query.id as string) || "").trim();
  if (!id || id.length > 64 || !/^[a-f0-9-]+$/.test(id)) {
    return res.status(400).json({ error: "Missing or invalid id" });
  }

  const kvKey = `activation:${id}`;
  const data = await kv.get<ActivationData>(kvKey);

  if (data) {
    await kv.del(kvKey); // one-time retrieval
    return res.status(200).json({ status: "ready", ...data });
  }

  return res.status(200).json({ status: "pending" });
}
