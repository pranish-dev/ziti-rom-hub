import type { MetadataRoute } from "next";
import { getAllGuides, getAllRoms, getAllReleases } from "@/lib/content";
import { releaseHref, romHref } from "@/lib/format";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/releases",
    "/guides",
    "/warnings",
    "/about",
    "/search",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const roms: MetadataRoute.Sitemap = getAllRoms().map((rom) => ({
    url: `${site.url}${romHref(rom)}`,
    lastModified: rom.latest ? new Date(`${rom.latest.releaseDate}T00:00:00Z`) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const releases: MetadataRoute.Sitemap = getAllReleases().map((release) => ({
    url: `${site.url}${releaseHref(release.romSlug, release.versionDir)}`,
    lastModified: new Date(`${release.releaseDate}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const guides: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
    url: `${site.url}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...roms, ...releases, ...guides];
}
