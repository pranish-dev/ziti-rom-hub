"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { GlobalSearch } from "@/components/global-search";

const NAV_ITEMS = [
  { href: "/ziti/roms", label: "ROMs" },
  { href: "/releases", label: "Releases" },
  { href: "/guides", label: "Guides" },
  { href: "/warnings", label: "Warnings", accent: true },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/ziti/roms") {
    return pathname.startsWith("/ziti");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function LogoMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="24" height="24" fill="#F50514" />
      <path
        d="M6.2 6h11.6v3.3l-7.4 5.4h7.4V18H6.2v-3.3l7.4-5.4H6.2Z"
        fill="#080808"
      />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur-sm">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label={`${site.name} home`}
        >
          <LogoMark />
          <span className="font-display text-[16px] font-bold tracking-tight">
            ZITI{" "}
            <span className="ml-1.5 font-medium text-muted">
              ROM&nbsp;HUB
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? "nav-link-active" : ""} ${
                  item.accent && active ? "text-accent" : ""
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </Link>
            );
          })}
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <a
            href={site.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            GitHub <span aria-hidden="true" className="text-faint">↗</span>
          </a>
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          <GlobalSearch />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 flex h-11 w-11 items-center justify-center text-muted hover:text-fg md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            {open ? (
              <path
                d="M4 4l12 12M16 4L4 16"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
              />
            ) : (
              <path
                d="M2.5 5.5h15M2.5 10h15M2.5 14.5h15"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
              />
            )}
          </svg>
        </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-line bg-background md:hidden"
        >
          <ul className="container-page flex flex-col py-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex min-h-12 items-center border-b border-line-soft text-[13px] font-mono uppercase tracking-[0.16em] last:border-b-0 ${
                      active
                        ? item.accent
                          ? "text-accent"
                          : "text-fg"
                        : "text-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <a
                href={site.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center border-b border-line-soft font-mono text-[13px] uppercase tracking-[0.16em] text-muted last:border-b-0"
              >
                GitHub <span aria-hidden="true" className="ml-1">↗</span>
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
