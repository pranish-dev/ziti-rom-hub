import type { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import type { Twitter as TwitterTypes } from "next/dist/lib/metadata/types/twitter-types";
import { site } from "./site";

/**
 * Shared Open Graph / Twitter card metadata helpers.
 *
 * Every page builds its share-card metadata through these helpers so the
 * tags stay consistent (site name, locale, fallback image) across the site.
 */

/** The default share image: public/og.png (1200×630). */
export const DEFAULT_OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
} as const;

type OgImage = { url: string; width?: number; height?: number; alt?: string };

interface BuildOpenGraphOptions {
  /** Page title without the site-name template suffix. */
  title: string;
  description: string;
  /** Canonical path beginning with "/", e.g. "/ziti/roms/lunaris-aosp". */
  path: string;
  /** Defaults to "website"; use "article" for guides and releases. */
  type?: "website" | "article";
  /** Optional custom share image (e.g. a release banner). */
  image?: OgImage | null;
  /** ISO date for article pages — rendered as modified/published time. */
  publishedTime?: string;
}

/** Build a complete openGraph object for a page. */
export function buildOpenGraph({
  title,
  description,
  path,
  type = "website",
  image,
  publishedTime,
}: BuildOpenGraphOptions): OpenGraph {
  const resolvedImage = image ?? DEFAULT_OG_IMAGE;
  return {
    type,
    url: path,
    siteName: site.name,
    title,
    description,
    locale: "en_US",
    images: [resolvedImage],
    ...(type === "article" && publishedTime
      ? { publishedTime }
      : {}),
  };
}

interface BuildTwitterOptions {
  title: string;
  description: string;
  image?: OgImage | null;
}

/** Build a complete twitter card object for a page. */
export function buildTwitter({
  title,
  description,
  image,
}: BuildTwitterOptions): TwitterTypes {
  const resolvedImage = image ?? DEFAULT_OG_IMAGE;
  return {
    card: "summary_large_image",
    title,
    description,
    images: [resolvedImage.url],
  };
}