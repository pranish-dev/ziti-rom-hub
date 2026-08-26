import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Ziti ROM Hub is, device specifications, and how to get help with the OnePlus Nord CE 3 5G (ziti).",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container-text pb-16 pt-10 sm:pt-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <header className="border-b border-line pb-6">
        <p className="eyebrow-accent">About</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ziti ROM Hub
        </h1>
      </header>

      <div className="md mt-8 max-w-none">
        <h2>What this is</h2>
        <p>
          Ziti ROM Hub is a community hub for custom ROM releases, flashing
          guides and device information for the OnePlus Nord CE 3 5G,
          codename <strong>ziti</strong>. It exists so users do not have to dig
          through Telegram threads and forum posts to find the latest build —
          and so nobody flashes a release without seeing its requirements
          first.
        </p>

        <h2>Specification</h2>
        <table>
          <tbody>
            <tr>
              <th>Device</th>
              <td>OnePlus Nord CE 3 5G (CPH2569)</td>
            </tr>
            <tr>
              <th>Codename</th>
              <td>
                <code>ziti</code>
              </td>
            </tr>
            <tr>
              <th>Chipset</th>
              <td>Snapdragon 782G</td>
            </tr>
            <tr>
              <th>Memory</th>
              <td>8 / 12 GB LPDDR4X</td>
            </tr>
            <tr>
              <th>Storage</th>
              <td>128 / 256 GB UFS 3.1</td>
            </tr>
            <tr>
              <th>Battery</th>
              <td>5000 mAh, 80 W SUPERVOOC</td>
            </tr>
          </tbody>
        </table>

        <h2>Contributing</h2>
        <p>
          Maintainers add or update content by opening pull requests against
          the repository linked in the footer. Content is validated at build
          time — if frontmatter is malformed, the build fails with an error
          naming the exact file and field, so broken data never reaches the
          site.
        </p>

        <h2>Disclaimers</h2>
        <ul>
          <li>
            This is a community project and is not affiliated with, endorsed
            by, or supported by OnePlus.
          </li>
          <li>
            Unlocking the bootloader and flashing third-party software can
            void your warranty and carries real risk of data loss or a bricked
            device. You are responsible for what you flash.
          </li>
          <li>
            Download links point to external hosting controlled by each
            ROM&apos;s maintainer. Verify what you download before installing it.
          </li>
        </ul>

        <p className="!mt-8 border-t border-line pt-6 text-[13px] !text-faint">
          Questions or corrections? Open an issue on{" "}
          <a href={site.githubRepo} target="_blank" rel="noopener noreferrer" className="text-link">
            GitHub ↗
          </a>{" "}
          or reach out to the device community channels.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <Link href="/warnings" className="btn-outline-accent">
          Warnings
        </Link>
        <Link href="/ziti/roms" className="btn-secondary">
          Browse ROMs
        </Link>
      </div>
    </div>
  );
}
