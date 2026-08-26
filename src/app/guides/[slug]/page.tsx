import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MarkdownBody } from "@/components/markdown-body";
import { getAllGuides, getGuide } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description:
      guide.description ??
      `Guide: ${guide.title} — OnePlus Nord CE 3 5G (ziti).`,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title: guide.title },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = getAllGuides().filter(
    (candidate) => candidate.slug !== guide.slug
  );

  return (
    <div className="container-page pb-16 pt-10 sm:pt-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: guide.title },
        ]}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <article className="min-w-0">
          <header className="border-b border-line pb-6">
            <p className="eyebrow-accent">Guide</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {guide.title}
            </h1>
            {guide.description && (
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
                {guide.description}
              </p>
            )}
          </header>

          <MarkdownBody
            className="md mt-8"
            html={guide.bodyHtml}
          />
        </article>

        <aside className="space-y-10 lg:border-l lg:border-line lg:pl-10">
          <section aria-labelledby="related-guides">
            <p id="related-guides" className="eyebrow !text-muted">
              More guides
            </p>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/guides/${item.slug}`}
                    className="group block text-[13.5px] leading-snug text-muted transition-colors hover:text-accent"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="aside-safety" className="panel border-l-2 border-l-accent px-4 py-4">
            <h2 id="aside-safety" className="eyebrow !text-muted">
              Warnings
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              Requirements differ per ROM. Check each release page before
              flashing.
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
