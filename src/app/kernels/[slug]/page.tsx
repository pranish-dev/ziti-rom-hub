import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ReleaseArchive } from "@/components/release-archive";
import { MetaList, MetaRow, SectionHead } from "@/components/section-head";
import { WarningBox } from "@/components/warning-box";
import { getAllKernels, getKernel } from "@/lib/content";
import {
  downloadHostLabel,
  formatReleaseDate,
  kernelReleaseHref,
} from "@/lib/format";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  const kernels = getAllKernels();
  if (kernels.length === 0) {
    // `output: "export"` cannot build a dynamic route with zero params —
    // export a placeholder that renders 404 via notFound() until real
    // kernel content exists.
    return [{ slug: "ziti-no-kernels-yet" }];
  }
  return kernels.map((kernel) => ({ slug: kernel.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kernel = getKernel(slug);
  if (!kernel) return {};
  const title = `${kernel.name} kernel for the ${site.device} (${site.codename})`;
  const description = [
    `${kernel.name} kernel releases and downloads for the ${site.device} (${site.codename}).`,
    kernel.latest ? `Latest: ${kernel.latest.version}.` : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    title,
    description,
    alternates: { canonical: `/kernels/${kernel.slug}` },
    openGraph: buildOpenGraph({
      title,
      description,
      path: `/kernels/${kernel.slug}`,
    }),
    twitter: buildTwitter({ title, description }),
  };
}

export default async function KernelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kernel = getKernel(slug);
  if (!kernel) notFound();

  // The loader sorts releases newest first, so index 0 is latest.
  const latest = kernel.latest;
  const downloadUrl = latest?.downloads.primary ?? latest?.downloads.mirror;

  const facts: Array<{
    label: string;
    value: string;
    href?: string;
    external?: boolean;
    accent?: boolean;
  }> = [
    { label: "Android", value: latest?.android ?? kernel.android ?? "—" },
    { label: "Linux", value: latest?.linux ?? kernel.linux ?? "—" },
    {
      label: "Maintainer",
      value: kernel.maintainer,
      href: kernel.maintainerTelegram,
      external: true,
    },
  ];

  return (
    <div className="container-page pb-16 pt-10 sm:pt-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Kernels", href: "/kernels" },
          { label: kernel.name },
        ]}
      />

      <header>
        <p className="eyebrow-accent">Kernel</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {kernel.name}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[14px] text-muted">
          For the {site.device}
          <span className="chip">{site.codename}</span>
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
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

      {/* Kernel banner — kernel-root banner, or the latest release's. */}
      {kernel.banner && (
        <div className="mt-8 border border-line bg-surface">
          <Image
            src={kernel.banner}
            alt={`${kernel.name} kernel banner`}
            width={kernel.bannerWidth ?? 1600}
            height={kernel.bannerHeight ?? 900}
            priority
            sizes="(max-width: 1152px) 100vw, 1104px"
            className="h-auto w-full"
          />
        </div>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-16">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="about-heading">
            <SectionHead label="About" />
            <div className="max-w-3xl space-y-4">
              {kernel.description.split("\\n\\n").map((paragraph) => (
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
                      {[
                        latest.android,
                        latest.linux ? `Linux ${latest.linux}` : null,
                        latest.kernelSu,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
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
                        href={kernelReleaseHref(
                          latest.kernelSlug,
                          latest.versionDir
                        )}
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
                    See the release page for downloads and flashing notes.
                  </p>
                )}
              </div>
            </section>
          )}

          {kernel.features.length > 0 && (
            <section aria-labelledby="features-heading">
              <SectionHead label="Features" />
              <ul
                id="features-heading"
                className="grid gap-x-8 gap-y-2 sm:grid-cols-2"
              >
                {kernel.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2.5 text-[14px] leading-relaxed text-muted"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[3px] shrink-0 font-mono text-accent"
                    >
                      –
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="releases-heading">
            <SectionHead
              label={`Release history (${kernel.releaseCount})`}
              href="/kernels"
              linkLabel="All kernels"
            />
            <ReleaseArchive
              items={kernel.releases.map((release, index) => ({
                // The loader sorts releases newest first, so index 0 is latest.
                version: release.version,
                href: kernelReleaseHref(release.kernelSlug, release.versionDir),
                dateISO: release.releaseDate,
                meta: [
                  release.android,
                  release.linux ? `Linux ${release.linux}` : null,
                  release.kernelSu,
                ]
                  .filter(Boolean)
                  .join(" • "),
                isLatest: index === 0,
              }))}
            />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-10 lg:border-l lg:border-line lg:pl-10">
          <section aria-label="Kernel information">
            <MetaList>
              <MetaRow label="Maintainer">
                {kernel.maintainerTelegram ? (
                  <a
                    href={kernel.maintainerTelegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-line underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
                  >
                    {kernel.maintainer}
                  </a>
                ) : (
                  kernel.maintainer
                )}
              </MetaRow>
              <MetaRow label="Device">{site.device}</MetaRow>
              <MetaRow label="Codename">
                <span className="font-mono text-[12px]">{site.codename}</span>
              </MetaRow>
              <MetaRow label="Android">
                {latest?.android ?? kernel.android ?? "—"}
              </MetaRow>
              <MetaRow label="Linux">
                {latest?.linux ?? kernel.linux ?? "—"}
              </MetaRow>
              <MetaRow label="Releases">{String(kernel.releaseCount)}</MetaRow>
            </MetaList>
          </section>

          {kernel.source && (
            <section aria-labelledby="kernel-links">
              <SectionHead label="Links" />
              <ul id="kernel-links" className="-mt-2">
                <li>
                  <a
                    href={kernel.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 border-b border-line-soft py-2.5 text-[13.5px] text-muted transition-colors last:border-b-0 hover:text-accent"
                  >
                    <span className="truncate">Source code</span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-faint group-hover:text-accent"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              </ul>
            </section>
          )}

          <WarningBox
            title="Before you flash"
            items={[
              "Check that the kernel supports your ROM and firmware before flashing.",
            ]}
            safetyLink
          />
        </aside>
      </div>
    </div>
  );
}
