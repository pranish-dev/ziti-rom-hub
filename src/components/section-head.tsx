import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHead({
  label,
  href,
  linkLabel,
  children,
}: {
  label: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <h2 className="eyebrow !text-muted">{label}</h2>
      {children}
      {href && linkLabel && (
        <Link
          href={href}
          className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
        >
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export function MetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line-soft py-2.5 last:border-b-0">
      <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
        {label}
      </dt>
      <dd className="text-right text-[13.5px] leading-snug text-fg">
        {children}
      </dd>
    </div>
  );
}

/** Compact key/value block used in sidebars and detail pages. */
export function MetaList({
  children,
}: {
  children: ReactNode;
}) {
  return <dl>{children}</dl>;
}
