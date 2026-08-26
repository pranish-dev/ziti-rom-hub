import Link from "next/link";
import { Fragment } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-7 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-faint"
    >
      {items.map((item, index) => (
        <Fragment key={`${item.href ?? item.label}-${index}`}>
          {index > 0 && (
            <span aria-hidden="true" className="text-line">
              /
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-muted">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-muted">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
