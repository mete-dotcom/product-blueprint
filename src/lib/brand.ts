/**
 * massiron brand tokens — single source of truth for JS/TSX.
 * For CSS, use globals.css + Tailwind classes.
 * For docs, see BRAND.md.
 */

// ── Spectrum ──────────────────────────────────────────────────────────────────
export const BRAND_CYAN   = "#22d3ee";   // deepstrain · spectrum start
export const BRAND_INDIGO = "#6366f1";   // atlas       · spectrum middle
export const BRAND_AMBER  = "#f59e0b";   // adauto      · spectrum end

/** The massiron wordmark gradient (left → right). */
export const WORDMARK_GRADIENT =
  `linear-gradient(90deg, ${BRAND_CYAN}, ${BRAND_INDIGO}, ${BRAND_AMBER})`;

/** Inline style object for the gradient wordmark text. */
export const WORDMARK_STYLE: React.CSSProperties = {
  background:              WORDMARK_GRADIENT,
  WebkitBackgroundClip:    "text",
  backgroundClip:          "text",
  color:                   "transparent",
};

/** The "intelligence is forged" headline gradient (same spectrum, diagonal). */
export const HERO_GRADIENT =
  `linear-gradient(90deg, ${BRAND_CYAN}, ${BRAND_INDIGO}, ${BRAND_AMBER})`;

export const HERO_GRADIENT_STYLE: React.CSSProperties = {
  background:              HERO_GRADIENT,
  WebkitBackgroundClip:    "text",
  backgroundClip:          "text",
  color:                   "transparent",
};

// ── Backgrounds ───────────────────────────────────────────────────────────────
export const BG_VOID    = "#000810";  // deepstrain sections
export const BG_DEEP    = "#010d1a";  // primary (atlas, hero)
export const BG_SURFACE = "rgba(255,255,255,0.025)";

// ── Product accents ───────────────────────────────────────────────────────────
export const ACCENTS = {
  deepstrain: BRAND_CYAN,
  atlas:      BRAND_INDIGO,
  adauto:     BRAND_AMBER,
} as const;

export type Product = keyof typeof ACCENTS;

export function accentFor(product: Product): string {
  return ACCENTS[product];
}

// ── Nav / Footer ──────────────────────────────────────────────────────────────
export const NAV_BG     = "rgba(1,13,26,0.92)";
export const NAV_BLUR   = "18px";
export const FOOTER_COPYRIGHT = `massiron · forged on your machine`;
