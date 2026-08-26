import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-2 lg:max-w-sm">
          <p className="font-display text-[15px] font-bold tracking-tight">
            ZITI{" "}
            <span className="ml-1.5 font-medium text-muted">
              ROM&nbsp;HUB
            </span>
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
            Community-maintained ROM archive for the {site.device}{" "}
            ({site.codename}).
          </p>
        </div>

        <div>
          <p className="eyebrow">Device</p>
          <dl className="mt-4 space-y-2.5 text-[13px]">
            <div className="flex justify-between gap-4 sm:block lg:flex">
              <dt className="text-faint">Model</dt>
              <dd className="text-muted">CPH2569</dd>
            </div>
            <div className="flex justify-between gap-4 sm:block lg:flex">
              <dt className="text-faint">Codename</dt>
              <dd className="font-mono text-[12px] text-muted">ziti</dd>
            </div>
            <div className="flex justify-between gap-4 sm:block lg:flex">
              <dt className="text-faint">Source</dt>
              <dd>
                <a
                  href={site.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted transition-colors hover:text-accent"
                >
                  GitHub ↗
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-line-soft">
        <div className="container-page flex flex-col gap-1.5 py-5 text-[12px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ziti ROM Hub contributors.</p>
          <p>
            Not affiliated with OnePlus. Flash at your own risk — read the{" "}
            <Link href="/warnings" className="text-muted underline decoration-line underline-offset-4 hover:text-accent">
              warnings
            </Link>{" "}
            first.
          </p>
        </div>
      </div>
    </footer>
  );
}
