import Link from "next/link";
import type { Metadata } from "next";
import { ReleaseRow, RomRow } from "@/components/release-row";
import { SectionHead } from "@/components/section-head";
import { getAllGuides, getAllRoms, getHubStats, getRecentReleases } from "@/lib/content";
import { toReleaseListItem } from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const recentReleases = getRecentReleases(6);
  const roms = [...getAllRoms()].sort((a, b) => {
    if (!a.latest) return 1;
    if (!b.latest) return -1;
    return b.latest.releaseDate.localeCompare(a.latest.releaseDate);
  });
  const guides = getAllGuides();
  const stats = getHubStats();

  return (
    <>
      {/* Masthead */}
      <section className="border-b border-line">
        <div className="container-page pb-8 pt-10 sm:pb-10 sm:pt-14">
          <p className="eyebrow-accent">
            OnePlus Nord CE 3 5G · Codename ziti
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Ziti ROM Hub
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            Custom ROM releases, flashing guides and device information for the
            OnePlus Nord CE 3 5G. Read the warnings before flashing anything.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            {[
              { label: "ROMs", value: String(stats.romCount) },
              { label: "Releases", value: String(stats.releaseCount) },
              {
                label: "Official ROMs",
                value: String(
                  roms.filter((rom) => rom.support === "official").length
                ),
              },
              { label: "Codename", value: "ziti" },
            ].map((stat) => (
              <div key={stat.label} className="bg-background px-4 py-3.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-mono text-xl font-semibold text-fg">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Warnings strip */}
      <section aria-labelledby="safety-strip" className="container-page pt-10">
        <div className="flex flex-col gap-4 border border-line border-l-2 border-l-accent bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3.5">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-accent"
            >
              <path
                d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3.2v.3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <h2
                id="safety-strip"
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent"
              >
                Warnings
              </h2>
              <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-fg/85">
                Read this if you update you device to 1301+ and wanna flash
                custom rom.
              </p>
            </div>
          </div>
          <Link href="/warnings" className="btn-outline-accent shrink-0">
            Read warnings
          </Link>
        </div>
      </section>

      {/* Body */}
      <div className="container-page grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16 lg:py-16">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="custom-roms">
            <SectionHead
              label="Custom ROMs"
              href="/ziti/roms"
              linkLabel="All ROMs"
            />
            <div>
              {roms.map((rom) => (
                <RomRow
                  key={rom.slug}
                  name={rom.name}
                  href={`/ziti/roms/${rom.slug}`}
                  description={rom.description}
                  androidBase={rom.androidBase}
                  latestVersion={rom.latest?.version}
                  releaseCount={rom.releaseCount}
                />
              ))}
            </div>
          </section>

          <section aria-labelledby="recent-releases">
            <SectionHead
              label="Recent releases"
              href="/releases"
              linkLabel="All releases"
            />
            <div>
              {recentReleases.map((release) => (
                <ReleaseRow
                  key={`${release.romSlug}-${release.versionDir}`}
                  item={toReleaseListItem(release, release.rom)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-12 lg:border-l lg:border-line lg:pl-10">
          <section aria-labelledby="home-guides">
            <SectionHead label="Guides" />
            <ul className="space-y-3">
              {guides.map((guide, index) => (
                <li key={guide.slug}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="group flex gap-3.5"
                  >
                    <span className="pt-0.5 font-mono text-[11px] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-[14px] font-medium text-fg transition-colors group-hover:text-accent">
                        {guide.title}
                      </span>
                      {guide.description && (
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-faint">
                          {guide.description}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="home-device" className="panel px-4 py-4">
            <h2 id="home-device" className="eyebrow !text-muted">
              Device
            </h2>
            <dl className="mt-3.5 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-faint">Device</dt>
                <dd className="text-right text-muted">Nord CE 3 5G</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-faint">Codename</dt>
                <dd className="font-mono text-[12px] text-muted">ziti</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-faint">Chipset</dt>
                <dd className="text-right text-muted">Snapdragon 782G</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-faint">Shipped Android</dt>
                <dd className="text-right text-muted">13 (OxygenOS 13)</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}

export const dynamic = "force-static";
