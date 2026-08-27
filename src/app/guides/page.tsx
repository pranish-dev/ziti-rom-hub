import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAllGuides } from "@/lib/content";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Flashing and modding guides for the OnePlus Nord CE 3 5G (ziti): bootloader, custom ROM flashing, reverting to stock and common fixes.",
  alternates: { canonical: "/guides" },
  openGraph: buildOpenGraph({
    title: "Guides",
    description:
      "Flashing and modding guides for the OnePlus Nord CE 3 5G (ziti): bootloader, custom ROM flashing, reverting to stock and common fixes.",
    path: "/guides",
  }),
  twitter: buildTwitter({
    title: "Guides",
    description:
      "Flashing and modding guides for the OnePlus Nord CE 3 5G (ziti).",
  }),
};

export default function GuidesIndexPage() {
  const guides = getAllGuides();

  return (
    <div className="container-page pb-16 pt-10 sm:pt-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Guides" }]}
      />

      <header>
        <p className="eyebrow-accent">Documentation</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Guides
        </h1>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
          Device documentation maintained alongside the ROM archive. Start
          with the{" "}
          <Link href="/warnings" className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent">
            warnings
          </Link>{" "}
          if you are new to this device.
        </p>
      </header>

      {/* Warnings are promoted as the primary entry point */}
      <Link
        href="/warnings"
        className="group mt-10 flex items-start gap-4 border border-line border-l-2 border-l-accent bg-surface px-5 py-5 transition-colors hover:bg-raised"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent font-mono text-[13px] font-bold text-white">
          !
        </span>
        <span>
          <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Warnings
          </span>
          <span className="mt-1.5 block text-[15px] font-medium text-fg">
            The 1301 firmware notice, bootloader warnings and precautions — read before flashing anything.
          </span>
        </span>
        <span
          aria-hidden="true"
          className="ml-auto self-center text-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent"
        >
          →
        </span>
      </Link>

      <ul className="mt-6 border-t border-line">
        {guides.map((guide) => (
          <li key={guide.slug} className="border-b border-line">
            <Link
              href={`/guides/${guide.slug}`}
              className="group -mx-2 flex items-baseline gap-5 px-2 py-4 transition-colors hover:bg-surface sm:-mx-3 sm:px-3"
            >
              <span>
                <span className="block text-[15px] font-medium text-fg transition-colors group-hover:text-accent">
                  {guide.title}
                </span>
                {guide.description && (
                  <span className="mt-1 block max-w-2xl text-[13px] leading-relaxed text-muted">
                    {guide.description}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                className="ml-auto shrink-0 self-center text-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
