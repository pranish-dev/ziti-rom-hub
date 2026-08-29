import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MarkdownBody } from "@/components/markdown-body";
import { MetaList, MetaRow, SectionHead } from "@/components/section-head";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { WarningBox } from "@/components/warning-box";
import { getAllReleases, getRelease } from "@/lib/content";
import {
  downloadHostLabel,
  formatReleaseDate,
  releaseHref,
  romHref,
} from "@/lib/format";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllReleases().map((release) => ({
    slug: release.romSlug,
    version: release.versionDir,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}): Promise<Metadata> {
  const { slug, version } = await params;
  const release = getRelease(slug, version);
  if (!release) return {};
  const title = `${release.rom.name} ${release.version} for the ${release.rom.device} (${release.rom.codename})`;
  const description =
    release.bodyExcerpt.slice(0, 155) ||
    `${release.version} of ${release.rom.name} for the ${release.rom.device}, based on ${release.android}.`;
  const image = release.banner
    ? {
        url: release.banner,
        width: release.bannerWidth,
        height: release.bannerHeight,
        alt: `${release.rom.name} ${release.version} banner`,
      }
    : null;
  return {
    title,
    description,
    alternates: { canonical: releaseHref(slug, version) },
    openGraph: buildOpenGraph({
      title,
      description,
      path: releaseHref(slug, version),
      type: "article",
      image,
      publishedTime: release.releaseDate,
    }),
    twitter: buildTwitter({ title, description, image }),
  };
}

function autoWarningItems(props: {
  warnings: string[];
  cleanFlash: boolean;
  backupRequired: boolean;
}): string[] {
  const items = [...props.warnings];
  const mentions = (needle: string) =>
    items.some((item) => item.toLowerCase().includes(needle));
  if (props.cleanFlash && !mentions("clean flash")) {
    items.push("A clean flash is required for this build.");
  }
  if (props.backupRequired && !mentions("backup")) {
    items.push("Take a full backup before flashing.");
  }
  return items;
}

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}) {
  const { slug, version } = await params;
  const release = getRelease(slug, version);
  if (!release) notFound();

  const rom = release.rom;
  const otherReleases = rom.releases
    .filter((candidate) => candidate.versionDir !== release.versionDir)
    .slice(0, 5);
  const warnings = autoWarningItems(release);
  const primaryHost = release.downloads.primary
    ? downloadHostLabel(release.downloads.primary)
    : null;

  const facts: Array<{
    label: string;
    value: string;
    wide?: boolean;
    accent?: boolean;
  }> = [
    {
      label: "Type",
      value: release.build === "hotfix" ? "Hotfix build" : "Normal build",
      accent: release.build === "hotfix",
    },
    { label: "Released", value: formatReleaseDate(release.releaseDate), wide: true },
    { label: "Android", value: release.android },
    ...(release.qpr ? [{ label: "QPR", value: release.qpr }] : []),
    ...(release.buildType.length > 0
      ? [{ label: "Variant", value: release.buildType.join(" / ") }]
      : []),
    {
      label: "Maintainer",
      value: release.maintainer ?? rom.maintainer,
      wide: true,
    },
  ];
  const factCols =
    facts.length >= 6
      ? "lg:grid-cols-6"
      : facts.length === 5
        ? "lg:grid-cols-5"
        : facts.length === 4
          ? "lg:grid-cols-4"
          : "lg:grid-cols-3";

  return (
    <div className="container-page pb-16 pt-10 sm:pt-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "ROMs", href: "/ziti/roms" },
          { label: rom.name, href: romHref(rom) },
          { label: release.version },
        ]}
      />

      <header>
        <p className="eyebrow-accent">Release · {rom.name}</p>
        <h1 className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {rom.name}{" "}
          <span className="font-mono tracking-tight text-accent">
            {release.version}
          </span>
          {release.build === "hotfix" && (
            <span className="badge-new align-middle">Hotfix</span>
          )}
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          For the {rom.device}{" "}
          <span className="font-mono text-[13px] text-faint">
            ({rom.codename})
          </span>
        </p>
      </header>

      {release.banner && (
        <div className="mt-8 border border-line bg-surface">
          <Image
            src={release.banner}
            alt={`${rom.name} ${release.version} release banner`}
            width={release.bannerWidth ?? 1600}
            height={release.bannerHeight ?? 900}
            priority
            sizes="(max-width: 1152px) 100vw, 1104px"
            className="h-auto w-full"
          />
        </div>
      )}

      {/* Key facts strip */}
      <dl className={`mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 ${factCols}`}>
        {facts.map((fact) => (
          <div key={fact.label} className="bg-background px-3.5 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              {fact.label}
            </dt>
            <dd
              className={`mt-1 text-[13.5px] leading-snug ${
                fact.accent ? "font-semibold text-accent" : "text-fg"
              } ${fact.wide ? "" : "font-mono"}`}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Prominent warning — always above everything else */}
      <div className="mt-8">
        <WarningBox items={warnings} />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-16">
        <div className="min-w-0 space-y-14">
          {/* Downloads */}
          {(release.downloads.primary ||
            release.downloads.mirror ||
            release.downloads.recovery ||
            release.downloads.changelog) && (
            <section aria-labelledby="downloads-heading">
              <SectionHead label="Downloads" />
              <div id="downloads-heading" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3">
                {release.downloads.primary && primaryHost && (
                  <a
                    href={release.downloads.primary}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary min-w-[220px]"
                  >
                    Download from {primaryHost} ↗
                  </a>
                )}
                {release.downloads.mirror && (
                  <a
                    href={release.downloads.mirror}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Mirror ({downloadHostLabel(release.downloads.mirror)}) ↗
                  </a>
                )}
                {release.downloads.recovery && (
                  <a
                    href={release.downloads.recovery}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Recovery ↗
                  </a>
                )}
                {release.downloads.changelog && (
                  <a
                    href={release.downloads.changelog}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Changelog ↗
                  </a>
                )}
              </div>
              <p className="mt-3.5 text-[12.5px] leading-relaxed text-faint">
                Builds are not hosted in this repository — links lead to the
                maintainer&apos;s original hosting{primaryHost ? ` (${primaryHost})` : ""}
                . Verify file names and checksums before flashing.
              </p>
            </section>
          )}

          {/* Requirements */}
          {(release.requirements.firmware || release.requirements.arb) && (
            <section aria-labelledby="requirements-heading">
              <SectionHead label="Requirements" />
              <dl id="requirements-heading" className="panel divide-y divide-line-soft px-4 py-1">
                {release.requirements.firmware && (
                  <div className="py-3.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                      Required firmware
                    </dt>
                    <dd className="mt-1.5 text-[14px] leading-relaxed text-fg">
                      {release.requirements.firmware}
                    </dd>
                  </div>
                )}
                {release.requirements.arb && (
                  <div className="py-3.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                      Anti-rollback (ARB)
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] leading-relaxed">
                      <span className="border border-accent/50 bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                        ARB notice
                      </span>
                      <span className="text-fg">
                        {release.requirements.arb}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Features */}
          {release.features.length > 0 && (
            <section aria-labelledby="features-heading">
              <SectionHead label="Features" />
              <ul id="features-heading" className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {release.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2.5 text-[14px] leading-relaxed text-muted"
                  >
                    <span aria-hidden="true" className="mt-[3px] shrink-0 font-mono text-accent">
                      –
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Screenshots */}
          {release.screenshots.length > 0 && (
            <section aria-labelledby="screenshots-heading">
              <SectionHead
                label={`Screenshots (${release.screenshots.length})`}
              />
              <ScreenshotGallery
                images={release.screenshots}
                altBase={`${rom.name} ${release.version}`}
              />
            </section>
          )}

          {/* Release notes / installation */}
          <section aria-label="Release notes and installation">
            <SectionHead label="Release notes & installation" />
            <MarkdownBody
              html={release.bodyHtml}
              className="md max-w-3xl [&_h2:first-child]:!mt-0"
            />
          </section>

          {/* Credits */}
          {release.credits.length > 0 && (
            <section aria-labelledby="credits-heading">
              <SectionHead label="Credits" />
              <ul id="credits-heading" className="space-y-1.5">
                {release.credits.map((credit) => (
                  <li
                    key={credit}
                    className="flex gap-2.5 font-mono text-[13px] text-muted"
                  >
                    <span aria-hidden="true" className="text-faint">
                      ·
                    </span>
                    {credit}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-10 lg:border-l lg:border-line lg:pl-10">
          <section aria-label="Release details">
            <MetaList>
              <MetaRow label="Version">
                <span className="font-mono">{release.version}</span>
              </MetaRow>
              <MetaRow label="Released">
                {formatReleaseDate(release.releaseDate)}
              </MetaRow>
              <MetaRow label="Android">{release.android}</MetaRow>
              {release.qpr && <MetaRow label="QPR">{release.qpr}</MetaRow>}
              <MetaRow label="Build type">
                <span className={release.build === "hotfix" ? "font-semibold text-accent" : ""}>
                  {release.build === "hotfix" ? "Hotfix build" : "Normal build"}
                </span>
              </MetaRow>
              {release.buildType.length > 0 && (
                <MetaRow label="Variant">
                  {release.buildType.join(" / ")}
                </MetaRow>
              )}
              <MetaRow label="Maintainer">
                {release.maintainer ?? rom.maintainer}
              </MetaRow>
              <MetaRow label="Clean flash">
                <span className={release.cleanFlash ? "text-accent" : ""}>
                  {release.cleanFlash ? "Required" : "Not required"}
                </span>
              </MetaRow>
              <MetaRow label="Backup">
                {release.backupRequired ? "Required" : "Recommended"}
              </MetaRow>
            </MetaList>
          </section>

          {otherReleases.length > 0 && (
            <section aria-labelledby="other-releases">
              <SectionHead label="Other releases" />
              <ul id="other-releases" className="-mt-2">
                {otherReleases.map((other) => (
                  <li key={other.versionDir}>
                    <Link
                      href={releaseHref(other.romSlug, other.versionDir)}
                      className="group -mx-1 flex items-baseline justify-between gap-3 border-b border-line-soft px-1 py-2.5 transition-colors last:border-b-0 hover:bg-surface"
                    >
                      <span className="font-mono text-[13.5px] font-medium text-fg transition-colors group-hover:text-accent">
                        {other.version}
                      </span>
                      <time
                        dateTime={other.releaseDate}
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-faint"
                      >
                        {formatReleaseDate(other.releaseDate)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={romHref(rom)}
                className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
              >
                All {rom.name} releases →
              </Link>
            </section>
          )}

          <section aria-labelledby="side-safety" className="panel border-l-2 border-l-accent px-4 py-4">
            <h2 id="side-safety" className="eyebrow !text-muted">
              Warnings
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              Firmware mistakes can permanently lock a device. Read the
              warnings before you flash.
            </p>
            <Link
              href="/warnings"
              className="mt-3 inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              Warnings →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
