# massiron — Brand Guidelines

> **"The model is rented. The intelligence is forged."**

This document is the single source of truth for massiron's visual identity,
tone, and naming conventions. Every page, email, and doc follows this standard.

---

## 1. Name & Casing

| Usage | Form |
|---|---|
| Brand name | `massiron` — always lowercase |
| Products | `deepstrain` · `atlas` · `adauto` — always lowercase |
| Page titles | `massiron — <page title>` |
| Nav wordmark | `massiron` in spectrum gradient |
| Domain | `massiron.com` |

Never: `Massiron`, `MassIron`, `MASSIRON`.

---

## 2. The Mark

Three horizontal bars, top-to-bottom: cyan → indigo → amber.
Represents three tools fused into one intelligence layer.

```tsx
// src/components/MassironMark.tsx — canonical SVG mark
<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
  <rect x="2" y="3"    width="12" height="2.5" rx="1.25" fill="#22d3ee" />
  <rect x="2" y="6.75" width="12" height="2.5" rx="1.25" fill="#6366f1" />
  <rect x="2" y="10.5" width="12" height="2.5" rx="1.25" fill="#f59e0b" />
</svg>
```

Mark sizes: `16px` (nav, favicon), `24px` (hero), `32px` (standalone).

---

## 3. Color System

### Brand spectrum (always this order: cyan → indigo → amber)
| Token | Hex | Usage |
|---|---|---|
| `brand-cyan` | `#22d3ee` | deepstrain accent, spectrum start |
| `brand-indigo` | `#6366f1` | atlas accent, spectrum middle |
| `brand-amber` | `#f59e0b` | adauto accent, spectrum end |

### Wordmark gradient (CSS)
```css
background: linear-gradient(90deg, #22d3ee, #6366f1, #f59e0b);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```
Class: `.massiron-gradient-text` (defined in globals.css)

### Background palette
| Token | Value | Usage |
|---|---|---|
| `bg-void` | `#000810` | deepest bg (deepstrain sections) |
| `bg-deep` | `#010d1a` | primary bg (atlas sections, hero) |
| `bg-surface` | `rgba(255,255,255,0.025)` | card / glass surface |
| `bg-surface-hover` | `rgba(255,255,255,0.04)` | glass hover |

### Text palette
| | Value | Usage |
|---|---|---|
| Primary | `#ffffff` | headings |
| Secondary | `#94a3b8` (slate-400) | body text |
| Muted | `#475569` (slate-600) | notes, captions |
| Dim | `#1e293b` (slate-800) | metadata, timestamps |

---

## 4. Typography

| Role | Font | Weight | Class |
|---|---|---|---|
| All headings + code | JetBrains Mono | 700 / 800 | `font-mono font-bold` |
| Body text | Inter | 400 / 500 | `font-sans` |
| UI labels, badges | JetBrains Mono | 400 | `font-mono` |

**Heading scale** (via `clamp`):
- Hero h1: `clamp(2.8rem, 6.5vw, 5.5rem)`
- Section h2: `clamp(1.8rem, 4.5vw, 3rem)`
- Product h2: `clamp(2rem, 4vw, 3.5rem)`

---

## 5. The Thesis (copy standard)

### Hero line
> "the model is rented.
> **the intelligence is forged.**"

`the intelligence is forged.` always in `massiron-gradient-text`.

### Sub-line
> massiron builds the intelligence into the tools — not the model.
> Deterministic understanding, autonomous execution, owned outright.
> Swap in any brain, even a free local one. The frontier-grade result doesn't change —
> you just stopped paying rent on it.

### Compact (nav tooltip, OG description)
> "The model is rented. The intelligence is forged.
> Three tools, one intelligence layer — runs on your machine, with any brain or none."

### The three angles (every one of the three is a face of the same tez)
1. **Intelligence-in-tools** — deterministic understanding (atlas) + autonomous execution (deepstrain) baked in, model is swappable
2. **Token freedom** — no ceiling, no wait, local LLM fallback seamless
3. **Local ownership** — code never leaves, key is yours, offline-capable

---

## 6. Product Accent Colors

Each product has its own accent but they are all *part of the massiron spectrum*:

| Product | Accent | Hex | Tailwind |
|---|---|---|---|
| deepstrain | Cyan / Strain | `#22d3ee` | `text-strain-400`, `text-cyan-400` |
| atlas | Indigo | `#6366f1` | `text-indigo-400`, `hsl(220,91%,65%)` |
| adauto | Amber | `#f59e0b` | `text-amber-400`, `hsl(30,91%,55%)` |

---

## 7. Nav Standard

All pages use `<MassironNav>` from `src/components/MassironNav.tsx`.
- Left: massiron mark + wordmark (gradient)
- Right: product links (deepstrain · atlas · adauto), docs, bundle CTA
- Background: `rgba(1,13,26,0.92)` + `backdrop-blur-xl`
- Border bottom: `border-white/5`

Product-specific pages may pass `activeProduct` prop to highlight the active product link.

---

## 8. Footer Standard

All pages use `<MassironFooter>` from `src/components/MassironFooter.tsx`.
- Left: mark + "massiron" wordmark
- Center: nav links (deepstrain · atlas · adauto · bundle · docs · privacy · terms)
- Right: `© {year} massiron · forged on your machine`

---

## 9. Tone of Voice

| | Yes | No |
|---|---|---|
| **Register** | Technical, precise, dry | Marketing fluff, hype |
| **Verbs** | forge, build, understand, execute, own | leverage, innovate, unlock |
| **Sentences** | Short. Declarative. No hedging. | "We believe that...", "Our mission is..." |
| **Numbers** | Always specific ($0.27/M tokens, 52 tools, 28s) | "fast", "affordable", "many" |
| **The reader** | "you", "your machine", "your key" | "users", "customers", "our users" |

---

## 10. File & Component Map

| File | Purpose |
|---|---|
| `src/lib/brand.ts` | Color/gradient constants — single source for JS |
| `src/components/MassironMark.tsx` | The 3-bar SVG mark |
| `src/components/MassironNav.tsx` | Shared top nav (all pages) |
| `src/components/MassironFooter.tsx` | Shared footer (all pages) |
| `src/styles/globals.css` | `.massiron-gradient-text` + design tokens |
| `src/pages/manifesto.tsx` | Philosophy page (the full thesis, long form) |
| `BRAND.md` | This document |

---

## 11. Page Rollout Status

| Page | Brand applied | Notes |
|---|---|---|
| `index.tsx` | ✅ | Hero, nav, footer, OG meta |
| `manifesto.tsx` | ✅ | Philosophy page |
| `bundle.tsx` | ✅ | |
| `login.tsx` | ✅ | |
| `register.tsx` | ✅ | |
| `activate.tsx` | ✅ | |
| `pricing.tsx` (deepstrain) | ✅ | |
| `deepstrain/index.tsx` | ✅ | |
| `deepstrain/pricing.tsx` | ✅ | |
| `deepstrain/docs.tsx` | ✅ | |
| `deepstrain/dashboard.tsx` | ✅ | |
| `atlas/index.tsx` | ✅ | |
| `atlas/pricing.tsx` | ✅ | |
| `atlas/docs.tsx` | ✅ | |
| `atlas/dashboard.tsx` | ✅ | |
| `atlas/activate.tsx` | ✅ | |
| `adauto/index.tsx` | ✅ | |
| `adauto/pricing.tsx` | ✅ | |
| `adauto/activate.tsx` | ✅ | |
| `dashboard.tsx` | ✅ | |
| `docs.tsx` | ✅ | |
| `terms.tsx` | ✅ | |
| `privacy.tsx` | ✅ | |
| `refund.tsx` | ✅ | |
| `admin.tsx` | ✅ | |
| `admin/tiers.tsx` | ✅ | |

*Status updated as rollout progresses.*

---

*Living document. Update whenever brand evolves.*
*Created: 2026-05-31*
