/**
 * Site-wide configuration. Edit these values when deploying.
 */

export const site = {
  name: "Ziti ROM Hub",
  shortName: "Ziti",
  device: "OnePlus Nord CE 3 5G",
  codename: "ziti",
  tagline:
    "Custom ROMs, releases and flashing guides for the OnePlus Nord CE 3 5G.",
  /** Set NEXT_PUBLIC_SITE_URL in Vercel to the production domain. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ziti-rom-hub.vercel.app",
  githubRepo: "https://github.com/ziti-rom-hub/ziti-rom-hub",
  author: "ziti community",
} as const;
