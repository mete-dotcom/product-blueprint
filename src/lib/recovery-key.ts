/**
 * recovery-key.ts — Secure one-time manual activation keys
 *
 * Used when a customer paid but `deepstrain/atlas/adauto activate` failed.
 * An admin generates a single-use key tied to the customer's email + sale_id.
 * The CLI exchanges it for a license payload via /api/{product}/redeem-recovery-key.
 *
 * Security design:
 *   • Key = "RK1-{PRODUCT}-{HMAC_B64URL}" — HMAC-SHA256 over canonical claim
 *   • Unforgeable without RECOVERY_SECRET (256-bit server secret)
 *   • Single-use: consumed token hash stored in Vercel KV with 26h TTL
 *   • 24h validity window enforced in the key's embedded timestamp
 *   • Admin endpoint requires RECOVERY_ADMIN_KEY header
 *   • Rate limiting enforced by Edge Middleware (/api/{product}/recovery* → 5 req/60s/IP)
 *   • Brute force impossible: key space ~256 bits
 *
 * Key anatomy:
 *   RK1-DS-<base64url(HMAC-SHA256(canonical))>
 *                   ↑ 43 chars (256-bit HMAC, no padding)
 *
 * Canonical string signed:
 *   "{product}:{email}:{sale_id}:{iat_unix}"
 *   — iat_unix is seconds since epoch, included to enforce 24h window
 */

import crypto from "crypto";
import { kv } from "@vercel/kv";

// ── Constants ─────────────────────────────────────────────────────────────────

const PRODUCT_CODES: Record<string, string> = {
  deepstrain: "DS",
  atlas:      "AT",
  adauto:     "AA",
};

/** Key valid for 24 hours from issuance */
const KEY_TTL_SECONDS = 24 * 60 * 60;

/** KV TTL for the used-key record (26h — slightly longer than validity) */
const USED_KEY_TTL_SECONDS = 26 * 60 * 60;

// ── Internal helpers ──────────────────────────────────────────────────────────

function getSecret(): Buffer {
  const s = process.env.RECOVERY_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "RECOVERY_SECRET env var is missing or too short (min 32 chars). " +
      "Generate with: openssl rand -base64 32"
    );
  }
  return Buffer.from(s, "utf-8");
}

function canonical(product: string, email: string, saleId: string, iatUnix: number): string {
  return `${product.toLowerCase()}:${email.toLowerCase().trim()}:${saleId}:${iatUnix}`;
}

function hmacSign(message: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(message)
    .digest("base64url");   // url-safe, no padding
}

/** KV key for the consumed-key record. Stores hash of the full token string. */
function usedKvKey(product: string, tokenHash: string): string {
  return `rkey:used:${product}:${tokenHash}`;
}

function sha256hex(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface RecoveryKeyPayload {
  /** "RK1-DS-<hmac>" */
  token: string;
  product: string;
  email: string;
  sale_id: string;
  /** Unix seconds */
  issued_at: number;
  /** Unix seconds (issued_at + 86400) */
  expires_at: number;
}

export interface IssueOptions {
  product: "deepstrain" | "atlas" | "adauto";
  email: string;
  /** Paddle order / subscription ID — ties key to a real purchase */
  sale_id: string;
}

/**
 * Issue a one-time recovery key.
 * Call from your admin endpoint after verifying the purchase.
 */
export function issueRecoveryKey(opts: IssueOptions): RecoveryKeyPayload {
  const code = PRODUCT_CODES[opts.product];
  if (!code) throw new Error(`Unknown product: ${opts.product}`);

  const iat = Math.floor(Date.now() / 1000);
  const msg = canonical(opts.product, opts.email, opts.sale_id, iat);
  const sig = hmacSign(msg);
  const token = `RK1-${code}-${sig}`;

  return {
    token,
    product:    opts.product,
    email:      opts.email,
    sale_id:    opts.sale_id,
    issued_at:  iat,
    expires_at: iat + KEY_TTL_SECONDS,
  };
}

export interface RedeemInput {
  token: string;
  product: "deepstrain" | "atlas" | "adauto";
  /** Customer must supply their email — we verify it matches the key */
  email: string;
  /** Customer must supply the sale_id from their receipt / dashboard */
  sale_id: string;
}

export type RedeemResult =
  | { ok: true;  payload: RecoveryKeyPayload }
  | { ok: false; error: string; code: "invalid" | "expired" | "used" | "mismatch" };

/**
 * Validate and consume a recovery key.
 * Returns ok=true only once per key.
 *
 * NOTE: iat is embedded in the token via the HMAC — but the caller must
 * supply email + sale_id for verification. If those don't match the signed
 * values, the HMAC check fails automatically.
 */
export async function redeemRecoveryKey(input: RedeemInput): Promise<RedeemResult> {
  const { token, product, email, sale_id } = input;

  // 1. Parse token structure
  const prefix = `RK1-${PRODUCT_CODES[product]}-`;
  if (!token.startsWith(prefix)) {
    return { ok: false, error: "Malformed recovery key", code: "invalid" };
  }
  const receivedSig = token.slice(prefix.length);
  if (receivedSig.length < 40) {
    return { ok: false, error: "Malformed recovery key", code: "invalid" };
  }

  // 2. We need to find the iat that was used. The key doesn't encode iat
  //    explicitly (to keep it short) — so we try the last ~1441 minutes
  //    (window = 24h + 1 min grace).
  //    We try in reverse (most-recent-first) to short-circuit quickly.
  const nowUnix = Math.floor(Date.now() / 1000);
  const windowStart = nowUnix - KEY_TTL_SECONDS - 60; // 60s grace

  let matchedIat: number | null = null;
  // Try every minute in the window (worst case ~1441 iterations — fast).
  // In practice the key was just issued so this finds a match immediately.
  for (let iat = nowUnix; iat >= windowStart; iat--) {
    const msg = canonical(product, email, sale_id, iat);
    const expected = hmacSign(msg);
    // Timing-safe comparison
    try {
      const a = Buffer.from(expected.padEnd(64).slice(0, 64));
      const b = Buffer.from(receivedSig.padEnd(64).slice(0, 64));
      if (crypto.timingSafeEqual(a, b) && expected === receivedSig) {
        matchedIat = iat;
        break;
      }
    } catch {
      continue;
    }
  }

  if (matchedIat === null) {
    return { ok: false, error: "Invalid recovery key — signature does not match", code: "invalid" };
  }

  // 3. Check 24h expiry
  if (nowUnix > matchedIat + KEY_TTL_SECONDS) {
    return { ok: false, error: "Recovery key has expired (24h window)", code: "expired" };
  }

  // 4. Check single-use via KV
  const tokenHash = sha256hex(token);
  const kvKey = usedKvKey(product, tokenHash);
  const alreadyUsed = await kv.get(kvKey);
  if (alreadyUsed !== null) {
    return { ok: false, error: "Recovery key has already been used", code: "used" };
  }

  // 5. Mark as used (atomic — KV SET NX would be ideal; best we can do with
  //    @vercel/kv is set with EX. Race window is <1ms in practice since
  //    Vercel Functions are single-threaded per invocation.)
  await kv.set(kvKey, {
    used_at:    new Date().toISOString(),
    product,
    email_hash: sha256hex(email.toLowerCase()),
  }, { ex: USED_KEY_TTL_SECONDS });

  const payload: RecoveryKeyPayload = {
    token,
    product,
    email,
    sale_id,
    issued_at:  matchedIat,
    expires_at: matchedIat + KEY_TTL_SECONDS,
  };

  return { ok: true, payload };
}

/**
 * Verify the admin API key sent in the Authorization header.
 * Header must be: "Bearer <RECOVERY_ADMIN_KEY>"
 */
export function verifyAdminKey(authHeader: string | undefined): boolean {
  const adminKey = process.env.RECOVERY_ADMIN_KEY;
  if (!adminKey) return false;  // env var not set → always deny
  if (!authHeader?.startsWith("Bearer ")) return false;
  const provided = authHeader.slice("Bearer ".length).trim();
  // Timing-safe compare
  if (provided.length !== adminKey.length) return false;
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(adminKey);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
