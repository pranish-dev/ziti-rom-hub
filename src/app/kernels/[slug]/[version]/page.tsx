import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MarkdownBody } from "@/components/markdown-body";
import { MetaList, MetaRow, SectionHead } from "@/components/section-head";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { getAllKernelReleases, getAllRoms, getKernelRelease } from "@/lib/content";
import {
  downloadHostLabel,
  formatReleaseDate,
  kernelHref,
  kernelReleaseHref,
  romHref,
} from "@/lib/format";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  const releases = getAllKernelReleases();
  if (releases.length === 0) {
    // `output: "export"` cannot build a dynamic route with zero params —
    // export a placeholder that renders 404 via notFound() until real
    // kernel release content exists.
    return [{ slug: "ziti-no-kernels-yet", version: "ziti-no-releases-yet" }];
  }
  return releases.map((release) => ({
    slug: release.kernelSlug,
    version: release.versionDir,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}): Promise<Metadata> {
  const { slug, version } = await params;
  const release = getKernelRelease(slug, version);
  if (!release) return {};
  const title = `${release.kernel.name} ${release.version} kernel — Ziti ROM Hub`;
  const description =
    release.bodyExcerpt.slice(0, 155) ||
    `${release.kernel.name} ${release.version} kernel for the ${release.android}.`;
  return {
    title,
    description,
    alternates: { canonical: `/kernels/${slug}/${version}` },
    openGraph: buildOpenGraph({ title, description, path: `/kernels/${slug}/${version}` }),
    twitter: buildTwitter({ title, description }),
  };
}

export default async function KernelReleasePage({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}) {
  const { slug, version } = await params;
  const release = getKernelRelease(slug, version);
  if (!release) notFound();

  const kernel = release.kernel;
  const otherReleases = kernel.releases
    .filter((candidate) => candidate.versionDir !== release.versionDir)
    .slice(0, 5);
  const primaryHost = release.downloads.primary
    ? downloadHostLabel(release.downloads.primary)
    : null;

  // Link supported ROM names to their archive pages where they match a ROM.
  const roms = getAllRoms();
  const supportedROMs = release.supportedROMs.map((name) => {
    const match = roms.find(
      (rom) => rom.name.toLowerCase() === name.toLowerCase()
    );
    return { name, href: match ? romHref(match) : undefined };
  });

  const facts: Array<{ label: string; value: string; wide?: boolean }> = [
    { label: "Released", value: formatReleaseDate(release.releaseDate), wide: true },
    { label: "Android", value: release.android },
    ...(release.linux ? [{ label: "Linux", value: release.linux }] : []),
    ...(release.kernelSu
      ? [{ label: "KernelSU", value: release.kernelSu, wide: true }]
      : []),
    ...(release.susfs
      ? [{ label: "SUSFS", value: release.susfs, wide: true }]
      : []),
    { label: "Maintainer", value: kernel.maintainer, wide: true },
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
          { label: "Kernels", href: "/kernels" },
          { label: kernel.name, href: kernelHref(kernel) },
          { label: release.version },
        ]}
      />

      <header>
        <p className="eyebrow-accent">Kernel Release · {kernel.name}</p>
        <h1 className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {kernel.name}{" "}
          <span className="font-mono tracking-tight text-accent">
            {release.version}
          </span>
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          For the {site.device}{" "}
          <span className="font-mono text-[13px] text-faint">({site.codename})</span>
        </p>
      </header>

      {release.banner && (
        <div className="mt-8 border border-line bg-surface">
          <Image
            src={release.banner}
            alt={`${kernel.name} ${release.version} kernel banner`}
            width={release.bannerWidth ?? 1600}
            height={release.bannerHeight ?? 900}
            priority
            sizes="(max-width: 1152px) 100vw, 1104px"
            className="h-auto w-full"
          />
        </div>
      )}

      {/* Key facts strip */}
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
                fact.wide ? "" : "font-mono"
              } text-fg`}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-16">
        <div className="min-w-0 space-y-14">
          {/* Downloads */}
          {(release.downloads.primary || release.downloads.mirror) && (
            <section aria-labelledby="downloads-heading">
              <SectionHead label="Downloads" />
              <div
                id="downloads-heading"
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3"
              >
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
              </div>
              <p className="mt-3.5 text-[12.5px] leading-relaxed text-faint">
                Kernel builds are not hosted in this repository — links lead to
                the maintainer&apos;s original hosting
                {primaryHost ? ` (${primaryHost})` : ""}. Verify checksums before
                flashing.
              </p>
            </section>
          )}

          {/* Source / changelog */}
          {(release.source || release.changelog) && (
            <section aria-labelledby="source-heading">
              <SectionHead label="Source & changelog" />
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3">
                {release.source && (
                  <a
                    href={release.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Source code ↗
                  </a>
                )}
                {release.changelog && (
                  <a
                    href={release.changelog}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Changelog ↗
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Compatibility */}
          {(supportedROMs.length > 0 || release.supportedOOS.length > 0) && (
            <section aria-labelledby="compat-heading">
              <SectionHead label="Compatibility" />
              {supportedROMs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {supportedROMs.map((rom) =>
                    rom.href ? (
                      <Link
                        key={rom.name}
                        href={rom.href}
                        className="chip transition-colors hover:border-accent/50 hover:text-accent"
                      >
                        {rom.name}
                      </Link>
                    ) : (
                      <span key={rom.name} className="chip">
                        {rom.name}
                      </span>
                    )
                  )}
                </div>
              )}
              {release.supportedOOS.length > 0 && (
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                    OxygenOS builds:
                  </span>{" "}
                  {release.supportedOOS.join(" · ")}
                </p>
              )}
            </section>
          )}

          {/* Changelog / flashing notes */}
          <section aria-label="Changelog and flashing notes">
            <SectionHead label="Changelog & flashing notes" />
            <MarkdownBody
              html={release.bodyHtml}
              className="md max-w-3xl [&_h2:first-child]:!mt-0"
            />
          </section>

          {/* Screenshots */}
          {release.screenshots.length > 0 && (
            <section aria-labelledby="screenshots-heading">
              <SectionHead
                label={`Screenshots (${release.screenshots.length})`}
              />
              <ScreenshotGallery
                images={release.screenshots}
                altBase={`${kernel.name} ${release.version}`}
              />
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
              {release.linux && <MetaRow label="Linux">{release.linux}</MetaRow>}
              {release.kernelSu && (
                <MetaRow label="KernelSU">{release.kernelSu}</MetaRow>
              )}
              {release.susfs && <MetaRow label="SUSFS">{release.susfs}</MetaRow>}
              <MetaRow label="KSU">
                <span className={release.ksu ? "text-fg" : "text-muted"}>
                  {release.ksu ? "Yes" : "No"}
                </span>
              </MetaRow>
              <MetaRow label="Maintainer">{kernel.maintainer}</MetaRow>
            </MetaList>
          </section>

          {otherReleases.length > 0 && (
            <section aria-labelledby="other-releases">
              <SectionHead label="Other releases" />
              <ul id="other-releases" className="-mt-2">
                {otherReleases.map((other) => (
                  <li key={other.versionDir}>
                    <Link
                      href={kernelReleaseHref(other.kernelSlug, other.versionDir)}
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
                href={kernelHref(kernel)}
                className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
              >
                All {kernel.name} releases →
              </Link>
            </section>
          )}

          <section aria-label="Kernel source" className="panel px-4 py-4">
            <h2 className="eyebrow !text-muted">Source</h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              Kernel source and build trees are maintained by the kernel
              maintainer.
            </p>
            {(release.source || kernel.source) && (
              <a
                href={release.source ?? kernel.source}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                Source code →
              </a>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
