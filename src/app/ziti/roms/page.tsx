import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllRoms } from "@/lib/content";
import { formatReleaseDate } from "@/lib/format";
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

  return (
    <div className="container-page pb-16 pt-10 sm:pt-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "ROMs" }]} />

      <header>
        <p className="eyebrow-accent">OnePlus Nord CE 3 5G · ziti</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Custom ROMs
        </h1>
      </header>

      <ul className="mt-10 border-t border-line">
        {roms.map((rom) => (
          <li key={rom.slug} className="border-b border-line">
            <Link
              href={`/ziti/roms/${rom.slug}`}
              className="group grid gap-1.5 px-2 py-5 transition-colors hover:bg-surface sm:-mx-2 sm:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_auto] sm:gap-6 sm:px-3"
            >
              <span>
                <span className="block text-[16px] font-semibold text-fg transition-colors group-hover:text-accent">
                  {rom.name}
                </span>
                <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                  {rom.support === "official" ? (
                    <span className="text-accent">Official</span>
                  ) : (
                    <span>Unofficial</span>
                  )}{" "}
                  · {rom.androidBase} · Maintainer{" "}
                  {rom.maintainerTelegram ? (
                    <a
                      href={rom.maintainerTelegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-line underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
                    >
                      {rom.maintainer}
                    </a>
                  ) : (
                    rom.maintainer
                  )}
                </span>
              </span>
              <span className="max-w-xl self-center text-[13px] leading-relaxed text-muted line-clamp-2">
                {rom.description}
              </span>
              <span className="self-center font-mono text-[11px] uppercase tracking-[0.14em] text-faint sm:text-right">
                Latest{" "}
                <span className="text-muted">{rom.latest?.version ?? "—"}</span>
                {rom.latest && (
                  <span className="mt-1 block">
                    {formatReleaseDate(rom.latest.releaseDate)}
                  </span>
                )}
                <span className="mt-1 block">
                  {rom.releaseCount}{" "}
                  {rom.releaseCount === 1 ? "release" : "releases"}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {roms.length === 0 && (
          <li className="border-b border-line py-10 text-center text-[14px] text-faint">
            No ROMs published yet.
          </li>
        )}
      </ul>
    </div>
  );
}
