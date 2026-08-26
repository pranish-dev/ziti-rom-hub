import Link from "next/link";

/**
 * Prominent pre-flash warning block. Rendered automatically whenever a
 * release declares warnings, clean_flash or backup_required.
 */
export function WarningBox({
  items,
  title = "Before flashing",
  safetyLink = true,
}: {
  items: string[];
  title?: string;
  safetyLink?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="warning-heading"
      className="border border-line border-l-2 border-l-accent bg-surface"
    >
      <div className="px-4 py-4 sm:px-5">
        <h2
          id="warning-heading"
          className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path
              d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3.2v.3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {title}
        </h2>
        <ul className="mt-3 space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-fg/90">
              <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 bg-accent" />
              {item}
            </li>
          ))}
        </ul>
        {safetyLink && (
          <p className="mt-4 border-t border-line pt-3.5">
            <Link
              href="/warnings"
              className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
            >
              Read the warnings →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
