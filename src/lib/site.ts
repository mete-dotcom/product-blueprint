/**
 * site.ts — Single source of truth for every outward-facing URL and address.
 *
 * All three products funnel through one domain (massiron.com by default).
 * Change NEXT_PUBLIC_SITE_URL once and every pricing link, support address,
 * email footer, and upgrade redirect follows. No domain string is hardcoded
 * anywhere else in the codebase.
 */

export type Product = "deepstrain" | "atlas" | "adauto" | "nodestone";

/** Base site URL, no trailing slash. */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://massiron.com").replace(/\/+$/, "");

/** Bare host (massiron.com) derived from SITE_URL. */
export const SITE_HOST = hostOf(SITE_URL);

/** Public support inbox. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || `support@${SITE_HOST}`;

/** Marketing / home page for a product. deepstrain lives at the root. */
export function productUrl(product: Product): string {
  return product === "deepstrain" ? SITE_URL : `${SITE_URL}/${product}`;
}

/** Pricing page for a product. deepstrain pricing lives at the root. */
export function pricingUrl(product: Product): string {
  return product === "deepstrain" ? `${SITE_URL}/pricing` : `${SITE_URL}/${product}/pricing`;
}

/**
 * Transactional from-address for a product, e.g. "atlas <noreply@massiron.com>".
 * Honors a per-product override env var ({PRODUCT}_FROM_EMAIL) when present.
 */
export function fromEmail(product: Product): string {
  const override = process.env[`${product.toUpperCase()}_FROM_EMAIL`];
  return override || `${product} <noreply@${SITE_HOST}>`;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "massiron.com";
  }
}
