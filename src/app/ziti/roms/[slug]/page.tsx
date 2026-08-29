import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MetaList, MetaRow, SectionHead } from "@/components/section-head";
import { WarningBox } from "@/components/warning-box";
import { getAllRoms, getRom } from "@/lib/content";
import {
  downloadHostLabel,
  formatReleaseDate,
  isNewRelease,
  releaseHref,
} from "@/lib/format";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import type { Release } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllRoms().map((rom) => ({ slug: rom.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rom = getRom(slug);
  if (!rom) return {};
  const title = `${rom.name} for the ${rom.device} (${rom.codename})`;
  const description = [
    `${rom.name} releases and downloads for the ${rom.device} (${rom.codename}).`,
    rom.latest
      ? `Latest: ${rom.latest.version} · ${rom.androidBase}.`
      : `Based on ${rom.androidBase}.`,
  ].join(" ");
  // Prefer the latest release banner as the share image; fall back to og.png.
  const image = rom.latest?.banner
    ? {
        url: rom.latest.banner,
        width: rom.latest.bannerWidth,
        height: rom.latest.bannerHeight,
        alt: `${rom.name} ${rom.latest.version} banner`,
      }
    : null;
  return {
    title,
    description,
    alternates: { canonical: `/ziti/roms/${rom.slug}` },
    openGraph: buildOpenGraph({
      title,
      description,
      path: `/ziti/roms/${rom.slug}`,
      image,
    }),
    twitter: buildTwitter({ title, description, image }),
  };
}

function ExternalLinkRow({
  label,
  url,
}: {
  label: string;
  url: string;
}) {
  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-3 border-b border-line-soft py-2.5 text-[13.5px] text-muted transition-colors last:border-b-0 hover:text-accent"
      >
        <span className="truncate">{label}</span>
        <span aria-hidden="true" className="shrink-0 text-faint group-hover:text-accent">
          ↗
        </span>
      </a>
    </li>
  );
}

/** Compact "Android · QPR · Variants" line for a release. */
function releaseMeta(release: Release): string {
  return [
    release.android,
    release.qpr,
    release.buildType.length > 0 ? release.buildType.join(" / ") : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

export default async function RomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rom = getRom(slug);
  if (!rom) notFound();

  // `rom.latest` and `rom.releases` come pre-sorted (newest first) from the
  // content loader — this page never re-derives ordering or counts.
  const latest = rom.latest;
  const downloadUrl = latest?.downloads.primary ?? latest?.downloads.mirror;

  const facts: Array<{
    label: string;
    value: string;
    href?: string;
    external?: boolean;
    accent?: boolean;
  }> = [
    { label: "Android", value: rom.androidBase },
    {
      label: "Status",
      value: rom.support === "official" ? "Official" : "Unofficial",
      accent: rom.support === "official",
    },
    {
      label: "Maintainer",
      value: rom.maintainer,
      href: rom.maintainerTelegram,
      external: true,
    },
    {
      label: "Latest",
      value: latest ? latest.version : "—",
      href: latest ? releaseHref(latest.romSlug, latest.versionDir) : undefined,
    },
  ];
  const factCols =
    facts.length >= 6
      ? "lg:grid-cols-6"
      : facts.length === 5
        ? "lg:grid-cols-5"
        : "lg:grid-cols-4";

  return (
    <div className="container-page pb-16 pt-10 sm:pt-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "ROMs", href: "/ziti/roms" },
          { label: rom.name },
        ]}
      />

      <header>
        <p className="eyebrow-accent">Custom ROM</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {rom.name}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[14px] text-muted">
          For the {rom.device}
          <span className="chip">{rom.codename}</span>
        </p>

        {/* Compact facts strip — Android version, status, maintainer, latest. */}
        <dl
          className={`mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 ${factCols}`}
        >
          {facts.map((fact) => (
            <div key={fact.label} className="bg-background px-3.5 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                {fact.label}
              </dt>
              <dd
                className={`mt-1 text-[13.5px] leading-snug ${
                  fact.accent ? "font-semibold text-accent" : "text-fg"
                } ${fact.href ? "" : "font-mono"}`}
              >
                {fact.href ? (
                  <a
                    href={fact.href}
                    {...(fact.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="underline decoration-line underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
                  >
                    {fact.value}
                  </a>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-16">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="about-heading">
            <SectionHead label="About" />
            <div className="max-w-3xl space-y-4">
              {rom.description.split("\n\n").map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="text-[15px] leading-relaxed text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          {latest && (
            <section aria-label="Latest release">
              <SectionHead label="Latest release" />
              <div className="panel">
                <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-mono text-xl font-semibold text-fg">
                        {latest.version}
                      </span>
                      <span className="badge-new">Latest</span>
                    </p>
                    <p className="mt-1.5 truncate text-[13px] text-muted">
                      {releaseMeta(latest)}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <time
                      dateTime={latest.releaseDate}
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint"
                    >
                      {formatReleaseDate(latest.releaseDate)}
                    </time>
                    <div className="mt-2.5">
                      <Link
                        href={releaseHref(latest.romSlug, latest.versionDir)}
                        className="btn-outline-accent"
                      >
                        View release <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
                {downloadUrl && (
                  <p className="border-t border-line px-5 py-3 text-[12.5px] leading-relaxed text-faint">
                    The newest build is hosted on {downloadHostLabel(downloadUrl)}.
                    See the release page for downloads, requirements and
                    warnings.
                  </p>
                )}
              </div>
            </section>
          )}

          <section aria-labelledby="releases-heading">
            <SectionHead
              label={`Releases (${rom.releaseCount})`}
              href="/releases"
              linkLabel="All releases"
            />
            {rom.releases.length === 0 ? (
              <p className="border-b border-line py-10 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                No releases available yet.
              </p>
            ) : (
              <ul>
                {rom.releases.map((release, index) => {
                  // The loader sorts releases newest first, so index 0 is latest.
                  const isLatest = index === 0;
                  const isNew = !isLatest && isNewRelease(release.releaseDate);
                  return (
                    <li key={release.versionDir}>
                      <Link
                        href={releaseHref(release.romSlug, release.versionDir)}
                        className="group -mx-2 flex items-center gap-4 border-b border-line px-2 py-4 transition-colors last:border-b-0 hover:bg-surface sm:-mx-3 sm:px-3"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-mono text-[16px] font-semibold text-fg transition-colors group-hover:text-accent">
                              {release.version}
                            </span>
                            {isLatest && <span className="badge-new">Latest</span>}
                            {isNew && (
                              <span className="inline-flex items-center border border-line bg-raised px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                                New
                              </span>
                            )}
                          </span>
                          <p className="mt-1 truncate text-[13px] text-muted">
                            {releaseMeta(release)}
                          </p>
                          <time
                            dateTime={release.releaseDate}
                            className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-faint"
                          >
                            {formatReleaseDate(release.releaseDate)}
                          </time>
                        </div>
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-faint transition-colors group-hover:text-accent"
                        >
                          View →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-10 lg:border-l lg:border-line lg:pl-10">
          <section aria-label="ROM information">
            <MetaList>
              <MetaRow label="Maintainer">
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
              </MetaRow>
              <MetaRow label="Android base">{rom.androidBase}</MetaRow>
              <MetaRow label="Support">
                <span
                  className={
                    rom.support === "official"
                      ? "font-medium text-fg"
                      : "text-muted"
                  }
                >
                  {rom.support === "official" ? "Official" : "Unofficial"}
                </span>
              </MetaRow>
              <MetaRow label="Codename">
                <span className="font-mono text-[12px]">{rom.codename}</span>
              </MetaRow>
              <MetaRow label="Releases">{String(rom.releaseCount)}</MetaRow>
            </MetaList>
          </section>

          {(rom.officialSite || rom.github || rom.links.length > 0) && (
            <section aria-labelledby="rom-links">
              <SectionHead label="Links" />
              <ul id="rom-links" className="-mt-2">
                {rom.officialSite && (
                  <ExternalLinkRow
                    label="Official site"
                    url={rom.officialSite}
                  />
                )}
                {rom.github && (
                  <ExternalLinkRow
                    label="Source / GitHub"
                    url={rom.github}
                  />
                )}
                {rom.links.map((link) => (
                  <ExternalLinkRow key={link.url} label={link.label} url={link.url} />
                ))}
              </ul>
              <p className="mt-3 text-[12px] leading-relaxed text-faint">
                Links point to external sites — verify you trust the source
                before downloading.
              </p>
            </section>
          )}

          <WarningBox
            title="Before you flash"
            items={[
              "Check firmware requirements and the warnings on every release page.",
            ]}
            safetyLink
          />
        </aside>
      </div>
    </div>
  );
}
