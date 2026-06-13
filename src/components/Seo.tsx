/**
 * Seo — single source of truth for per-page meta + Open Graph + Twitter cards.
 *
 * Why this exists: link unfurlers (ChatGPT, Slack, Discord, Twitter/X, iMessage,
 * WhatsApp) read OG/Twitter tags from the server-rendered HTML. Without absolute
 * og:image / og:url and a twitter:card, the preview either fails to render or
 * shows a blank card. Every public page should render this in its <Head>.
 *
 * Defaults are applied site-wide from _app.tsx; any page can override by
 * rendering its own <Seo .../> (later <Head> entries win in next/head).
 */
import Head from "next/head";
import { SITE_URL } from "../lib/site";

export interface SeoProps {
  /** Page title. Rendered as <title> and og/twitter title. */
  title?: string;
  /** Meta description (~150 chars). */
  description?: string;
  /** Path (e.g. "/pricing") or absolute URL for og:url / canonical. */
  path?: string;
  /** Absolute or root-relative image path. Resolved to an absolute URL. */
  image?: string;
  /** og:type — "website" for marketing pages, "article" for docs/blog. */
  type?: "website" | "article";
  /** Suppress search indexing for utility pages (login, dashboard, admin). */
  noindex?: boolean;
}

const DEFAULTS = {
  title:       "massiron — the intelligence is forged",
  description:
    "massiron builds the intelligence into the tools: deterministic code understanding (atlas), autonomous execution (deepstrain), persistent project memory (nodestone), ethical marketing (adauto). Owned outright. Any model, or none.",
  image: "/og-image.png",
  type:  "website" as const,
};

/** Resolve a path or relative asset to an absolute https URL for unfurlers. */
function absolute(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  return `${SITE_URL}${input.startsWith("/") ? "" : "/"}${input}`;
}

export function Seo(props: SeoProps) {
  const title       = props.title ?? DEFAULTS.title;
  const description = props.description ?? DEFAULTS.description;
  const type        = props.type ?? DEFAULTS.type;
  const url         = absolute(props.path ?? "/");
  const image       = absolute(props.image ?? DEFAULTS.image);

  return (
    <Head>
      {/*
        Every tag carries a stable `key` so next/head dedupes the site-wide
        defaults (rendered in _app.tsx) against a page's own <Seo> override.
        Without keys, the og: and twitter: tags (which use `property`/`name`)
        would emit twice and some crawlers read the wrong one.
      */}
      {/* ── primary ─────────────────────────────────────────────── */}
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <link key="canonical" rel="canonical" href={url} />
      {props.noindex
        ? <meta key="robots" name="robots" content="noindex, nofollow" />
        : <meta key="robots" name="robots" content="index, follow" />}

      {/* ── Open Graph (Facebook, LinkedIn, Slack, Discord, iMessage) ─ */}
      <meta key="og:site_name" property="og:site_name" content="massiron" />
      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:image" property="og:image" content={image} />
      <meta key="og:image:secure_url" property="og:image:secure_url" content={image} />
      <meta key="og:image:type" property="og:image:type" content="image/png" />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta key="og:image:alt" property="og:image:alt" content="massiron — the intelligence is forged" />

      {/* ── Twitter / X ─────────────────────────────────────────── */}
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={image} />
      <meta key="twitter:image:alt" name="twitter:image:alt" content="massiron — the intelligence is forged" />

      {/* ── theme / icons ───────────────────────────────────────── */}
      <meta key="theme-color" name="theme-color" content="#0a0a0a" />
    </Head>
  );
}

export default Seo;
