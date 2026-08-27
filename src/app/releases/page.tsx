import type { Metadata } from "next";
import { ReleasesExplorer } from "@/components/releases-explorer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllReleases } from "@/lib/content";
import { toReleaseListItem } from "@/lib/format";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "All Releases",
  description:
    "Every release across every ROM for the OnePlus Nord CE 3 5G (ziti), newest first. Filter by ROM, Android version or build type.",
  alternates: { canonical: "/releases" },
  openGraph: buildOpenGraph({
    title: "All Releases",
    description:
      "Every release across every ROM for the OnePlus Nord CE 3 5G (ziti), newest first. Filter by ROM, Android version or build type.",
    path: "/releases",
  }),
  twitter: buildTwitter({
    title: "All Releases",
    description:
      "Every release across every ROM for the OnePlus Nord CE 3 5G (ziti), newest first.",
  }),
};

export default function ReleasesPage() {
  const releases = getAllReleases().map((release) =>
    toReleaseListItem(release, release.rom)
  );

  return (
    <div className="container-page pb-16 pt-10 sm:pt-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Releases" }]}
      />

      <header>
        <p className="eyebrow-accent">Release archive</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          All releases
        </h1>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
          Every published build across all ROMs, newest first. Always read the
          release page — not just this list — before flashing.
        </p>
      </header>

      <div className="mt-9">
        <ReleasesExplorer releases={releases} />
      </div>
    </div>
  );
}
