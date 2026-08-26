import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SearchClient } from "@/components/search-client";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search ROMs, releases and guides for the OnePlus Nord CE 3 5G (ziti).",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <div className="container-text pb-16 pt-10 sm:pt-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <header className="mb-8">
        <p className="eyebrow-accent">Find anything</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Search
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Search ROMs, releases, maintainers and guides.
        </p>
      </header>
      <SearchClient />
    </div>
  );
}
