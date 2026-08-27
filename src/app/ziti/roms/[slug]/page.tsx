import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MetaList, MetaRow, SectionHead } from "@/components/section-head";
import { WarningBox } from "@/components/warning-box";
import { getAllRoms, getRom } from "@/lib/content";
import {
  downloadHostLabel,
  formatReleaseDate,
  releaseHref,
} from "@/lib/format";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

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
  const description = rom.description.slice(0, 155);
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

export default async function RomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rom = getRom(slug);
  if (!rom) notFound();

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
          <span className="chip">ziti</span>
        </p>
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

          <section aria-labelledby="releases-heading">
            <SectionHead
              label={`Releases (${rom.releaseCount})`}
              href="/releases"
              linkLabel="All releases"
            />
            {rom.releases.length === 0 ? (
              <p className="py-8 text-[14px] text-faint">
                No releases have been published for this ROM yet.
              </p>
            ) : (
              <ul>
                {rom.releases.map((release) => (
                  <li key={release.versionDir}>
                    <a
                      href={releaseHref(release.romSlug, release.versionDir)}
                      className="group -mx-2 grid gap-1 border-b border-line px-2 py-4 transition-colors last:border-b-0 hover:bg-surface sm:-mx-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-3"
                    >
                      <span className="font-mono text-[17px] font-semibold text-fg transition-colors group-hover:text-accent">
                        {release.version}
                      </span>
                      <span className="min-w-0">
                        <time
                          dateTime={release.releaseDate}
                          className="block font-mono text-[11px] uppercase tracking-[0.14em] text-faint"
                        >
                          {formatReleaseDate(release.releaseDate)}
                        </time>
                        <span className="mt-0.5 block truncate text-[13px] text-muted">
                          {[release.android, release.qpr].filter(Boolean).join(" • ")}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center font-mono text-[11px] uppercase tracking-[0.16em] text-faint transition-colors group-hover:text-accent sm:flex">
                        View release →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-10 lg:border-l lg:border-line lg:pl-10">
          <section aria-label="ROM information">
            <MetaList>
              <MetaRow label="Maintainer">{rom.maintainer}</MetaRow>
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
              <MetaRow label="Latest">
                {rom.latest ? (
                  <a
                    href={releaseHref(
                      rom.latest.romSlug,
                      rom.latest.versionDir
                    )}
                    className="font-mono text-[13px] transition-colors hover:text-accent"
                  >
                    {rom.latest.version}
                  </a>
                ) : (
                  "—"
                )}
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

      {/* Latest release quick-download hint */}
      {rom.latest && (rom.latest.downloads.primary || rom.latest.downloads.mirror) && (
        <p className="mt-12 border-t border-line pt-5 text-[13px] text-faint">
          The newest build is {rom.name} {rom.latest.version} — downloads are
          hosted on{" "}
          {rom.latest.downloads.primary
            ? downloadHostLabel(rom.latest.downloads.primary)
            : downloadHostLabel(rom.latest.downloads.mirror!)}
          . See the{" "}
          <a
            href={releaseHref(rom.latest.romSlug, rom.latest.versionDir)}
            className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
          >
            release page
          </a>{" "}
          for requirements and warnings.
        </p>
      )}
    </div>
  );
}
