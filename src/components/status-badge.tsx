import type { Rom } from "@/lib/types";

/**
 * Compact ROM status label. Uses the existing rectangular badge treatment
 * (like .badge-new): red accent for Official, neutral for Unofficial.
 * Reads from the single `Rom["support"]` source of truth.
 */
export function StatusBadge({
  support,
  className = "",
}: {
  support: Rom["support"];
  className?: string;
}) {
  const isOfficial = support === "official";
  return (
    <span
      className={`inline-flex items-center border px-1.5 py-px font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${
        isOfficial
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-line bg-raised text-muted"
      } ${className}`}
    >
      {isOfficial ? "Official" : "Unofficial"}
    </span>
  );
}