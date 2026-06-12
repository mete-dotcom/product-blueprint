/**
 * Tier visibility config — admin-controlled show/hide for pricing tiers.
 *
 * Stored in KV under `config:tier_visibility` as a flat map:
 *   { "deepstrain:enterprise": false, "atlas:solo": true, ... }
 * A MISSING key means VISIBLE (default-on). Admin toggles via /api/admin/tiers.
 * Pricing pages read /api/tiers (public) and hide any tier marked false.
 */

import { Redis } from "@upstash/redis";

const kv = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const KEY = "config:tier_visibility";

/** Canonical catalog of every product's tiers (drives the admin UI). */
export const TIER_CATALOG: Record<string, string[]> = {
  deepstrain: ["solo", "team", "enterprise"],
  atlas:      ["solo", "pro", "enterprise"],
  adauto:     ["free", "pro"],
  nodestone:  ["free", "pro", "team"],
};

export type VisibilityMap = Record<string, boolean>;

export function tierKey(product: string, tier: string): string {
  return `${product}:${tier}`;
}

/** Full visibility map as stored (missing keys = visible). */
export async function getVisibilityMap(): Promise<VisibilityMap> {
  const map = await kv.get<VisibilityMap>(KEY);
  return map ?? {};
}

/** A tier is visible unless explicitly set to false. */
export async function isTierVisible(product: string, tier: string): Promise<boolean> {
  const map = await getVisibilityMap();
  return map[tierKey(product, tier)] !== false;
}

/** List of "{product}:{tier}" keys that are currently HIDDEN. */
export async function getHiddenTiers(product?: string): Promise<string[]> {
  const map = await getVisibilityMap();
  return Object.entries(map)
    .filter(([k, v]) => v === false && (!product || k.startsWith(`${product}:`)))
    .map(([k]) => k);
}

/** Set one tier visible/hidden. */
export async function setTierVisibility(product: string, tier: string, visible: boolean): Promise<VisibilityMap> {
  const map = await getVisibilityMap();
  map[tierKey(product, tier)] = visible;
  await kv.set(KEY, map);
  return map;
}
