import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RomsBrowser, type RomsListItem } from "@/components/roms-browser";
import { getAllRoms } from "@/lib/content";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Custom ROMs",
  description:
    "Every custom ROM maintained for the OnePlus Nord CE 3 5G (ziti) — Android bases, maintainers and latest builds.",
  alternates: { canonical: "/ziti/roms" },
  openGraph: buildOpenGraph({
    title: "Custom ROMs",
    description:
      "Every custom ROM maintained for the OnePlus Nord CE 3 5G (ziti) — Android bases, maintainers and latest builds.",
    path: "/ziti/roms",
  }),
  twitter: buildTwitter({
    title: "Custom ROMs",
    description:
      "Every custom ROM maintained for the OnePlus Nord CE 3 5G (ziti) — Android bases, maintainers and latest builds.",
  }),
};

export default function RomsIndexPage() {
  const roms = [...getAllRoms()].sort((a, b) => {
    if (!a.latest) return 1;
    if (!b.latest) return -1;
    return b.latest.releaseDate.localeCompare(a.latest.releaseDate);
  });

  // Lean serializable items — the client-side status filter must not receive
  // release bodies/screenshots in the RSC payload.
  const items: RomsListItem[] = roms.map((rom) => ({
    name: rom.name,
    slug: rom.slug,
    support: rom.support,
    androidBase: rom.androidBase,
    maintainer: rom.maintainer,
    maintainerTelegram: rom.maintainerTelegram,
    description: rom.description,
    latestVersion: rom.latest?.version,
    latestDate: rom.latest?.releaseDate,
    releaseCount: rom.releaseCount,
  }));

  return (
    <div className="container-page pb-16 pt-10 sm:pt-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "ROMs" }]} />

      <header>
        <p className="eyebrow-accent">OnePlus Nord CE 3 5G · ziti</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Custom ROMs
        </h1>
      </header>

      <RomsBrowser roms={items} />
    </div>
  );
}
