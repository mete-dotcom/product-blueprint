/**
 * massiron brand tokens — single source of truth for JS/TSX.
 * massiron = forged intelligence. iron. owned. not rented.
 *
 * Product colors:
 *   deepstrain — green  (#22c55e)  executing, alive, relentless
 *   atlas      — cyan   (#22d3ee)  precise, cold, deterministic
 *   adauto     — amber  (#f59e0b)  deliberate, considered, ethical
 *
 * Background: pure black / charcoal — no navy, no blue tints
 */

// ── Product colors ────────────────────────────────────────────────────────────
export const BRAND_GREEN  = "#22c55e";   // deepstrain
export const BRAND_CYAN   = "#22d3ee";   // atlas
export const BRAND_AMBER  = "#f59e0b";   // adauto primary
export const BRAND_ORANGE = "#fb923c";   // adauto secondary

/** adauto dual-tone gradient — warm, deliberate, human */
export const ADAUTO_GRADIENT = `linear-gradient(135deg, ${BRAND_AMBER}, ${BRAND_ORANGE})`;

// Legacy alias (wordmark gradient)
export const BRAND_INDIGO = "#6366f1";

/** The massiron wordmark gradient — the intelligence is forged. */
export const WORDMARK_GRADIENT =
  `linear-gradient(90deg, ${BRAND_GREEN}, ${BRAND_CYAN}, ${BRAND_AMBER})`;

/** Inline style object for the gradient wordmark text. */
export const WORDMARK_STYLE: React.CSSProperties = {
  background:           WORDMARK_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip:       "text",
  color:                "transparent",
};

/** Hero headline gradient. */
export const HERO_GRADIENT =
  `linear-gradient(90deg, ${BRAND_CYAN}, ${BRAND_INDIGO}, ${BRAND_AMBER})`;

export const HERO_GRADIENT_STYLE: React.CSSProperties = {
  background:           HERO_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip:       "text",
  color:                "transparent",
};

// ── Backgrounds — pure black / iron, zero navy ────────────────────────────────
export const BG_BASE    = "#0a0a0a";   // primary background
export const BG_SURFACE = "#111111";   // cards, panels
export const BG_VOID    = "#0a0a0a";   // alias for legacy code
export const BG_DEEP    = "#0a0a0a";   // alias for legacy code

// ── Product accents ───────────────────────────────────────────────────────────
export const ACCENTS = {
  deepstrain: BRAND_GREEN,
  atlas:      BRAND_CYAN,
  adauto:     BRAND_AMBER,
} as const;

export type Product = keyof typeof ACCENTS;

export function accentFor(product: Product): string {
  return ACCENTS[product];
}

// ── Nav / Footer ──────────────────────────────────────────────────────────────
export const NAV_BG   = "rgba(8,8,8,0.96)";
export const NAV_BLUR = "12px";
export const FOOTER_COPYRIGHT = `massiron · forged on your machine`;
