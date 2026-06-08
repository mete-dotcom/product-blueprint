/**
 * Lemon Squeezy webhook helpers — shared by all product webhooks.
 *
 * Replaces the Paddle integration. Lemon Squeezy is our Merchant of Record:
 * it handles global sales tax/VAT and pays out to a Turkish bank (no company
 * required to onboard as an individual seller).
 *
 * Webhook contract (https://docs.lemonsqueezy.com/help/webhooks):
 *   - POST, JSON body
 *   - Header `X-Signature` = HMAC-SHA256 hex of the RAW body, keyed by the
 *     per-webhook signing secret (LEMON_WEBHOOK_SECRET).
 *   - Body: { meta: { event_name, custom_data }, data: { type, id, attributes } }
 *
 * Events we care about (subscriptions):
 *   subscription_created          → new license
 *   subscription_payment_success  → renewal / refresh
 *   subscription_updated          → tier change (variant changed) / status change
 *   subscription_expired          → license dead (set expires_at = now)
 *   subscription_cancelled        → still paid until period end → do NOT kill
 */

import crypto from "crypto";
import type { NextApiRequest } from "next";

export const LEMON_WEBHOOK_SECRET = process.env.LEMON_WEBHOOK_SECRET || "";

/** Read the raw request body (bodyParser must be disabled on the route). */
export async function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

/**
 * Verify the Lemon Squeezy `X-Signature` header.
 * If no secret is configured, allow through only if NOT production
 * (block forged webhooks in prod).
 */
export function verifyLemonSignature(rawBody: string, signature: string): boolean {
  if (!LEMON_WEBHOOK_SECRET) return process.env.NODE_ENV !== "production";
  try {
    const expected = crypto.createHmac("sha256", LEMON_WEBHOOK_SECRET).update(rawBody).digest("hex");
    const a = Buffer.from(expected, "utf-8");
    const b = Buffer.from(signature, "utf-8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export interface LemonEvent {
  eventName:      string;  // subscription_created, subscription_payment_success, ...
  email:          string;
  name:           string;
  variantId:      string;  // numeric variant id → tier mapping key
  variantName:    string;
  productName:    string;
  orderId:        string;
  subscriptionId: string;
  status:         string;  // active | cancelled | expired | past_due | ...
  endsAt:         string;  // when a cancelled sub actually ends
  session?:       string;  // CLI bridge session, passed via checkout custom_data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom:         Record<string, any>;
}

/** Normalize a Lemon Squeezy webhook body into a flat, product-agnostic shape. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseLemonEvent(body: any): LemonEvent {
  const meta   = body?.meta ?? {};
  const data   = body?.data ?? {};
  const attr   = data?.attributes ?? {};
  const custom = meta?.custom_data ?? {};
  const foi    = attr?.first_order_item ?? {}; // present on order payloads

  return {
    eventName:      meta?.event_name ?? "",
    email:          attr?.user_email ?? "",
    name:           attr?.user_name ?? "",
    variantId:      String(attr?.variant_id ?? foi?.variant_id ?? ""),
    variantName:    attr?.variant_name ?? foi?.variant_name ?? "",
    productName:    attr?.product_name ?? foi?.product_name ?? "",
    orderId:        data?.type === "orders" ? String(data?.id ?? "") : String(attr?.order_id ?? ""),
    subscriptionId: data?.type === "subscriptions" ? String(data?.id ?? "") : String(attr?.subscription_id ?? ""),
    status:         attr?.status ?? "",
    endsAt:         attr?.ends_at ?? "",
    session:        typeof custom?.session === "string" ? custom.session : undefined,
    custom,
  };
}

/** True when this event should ISSUE/REFRESH a license. */
export function isIssueEvent(eventName: string): boolean {
  return eventName === "subscription_created" || eventName === "subscription_payment_success";
}

/** True when this event should KILL a license immediately. */
export function isExpireEvent(eventName: string): boolean {
  return eventName === "subscription_expired";
}
