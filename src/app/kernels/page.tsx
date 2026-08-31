import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArchiveRow } from "@/components/release-row";
import { getAllKernels } from "@/lib/content";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kernels",
  description:
    "Custom kernels for the OnePlus Nord CE 3 5G (ziti) — releases, downloads and source code.",
  alternates: { canonical: "/kernels" },
  openGraph: buildOpenGraph({
    title: "Kernels",
    description:
      "Custom kernels for the OnePlus Nord CE 3 5G (ziti) — releases, downloads and source code.",
    path: "/kernels",
  }),
  twitter: buildTwitter({
    title: "Kernels",
    description:
      "Custom kernels for the OnePlus Nord CE 3 5G (ziti) — releases, downloads and source code.",
  }),
};

export default function KernelsIndexPage() {
  const kernels = getAllKernels();

  return (
    <div className="container-page pb-16 pt-10 sm:pt-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Kernels" }]} />

      <header>
        <p className="eyebrow-accent">OnePlus Nord CE 3 5G · ziti</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Kernels
        </h1>
      </header>

      <ul className="mt-10 border-t border-line">
        {kernels.map((kernel) => (
          <li key={kernel.slug} className="border-b border-line">
            <ArchiveRow
              name={kernel.name}
              href={`/kernels/${kernel.slug}`}
              description={kernel.description}
              androidBase={kernel.latest?.android ?? kernel.android ?? "—"}
              latestVersion={kernel.latest?.version}
              releaseCount={kernel.releaseCount}
            />
          </li>
        ))}
        {kernels.length === 0 && (
          <li className="border-b border-line py-10 text-center text-[14px] text-faint">
            No kernels available yet.
          </li>
        )}
      </ul>
    </div>
  );
}