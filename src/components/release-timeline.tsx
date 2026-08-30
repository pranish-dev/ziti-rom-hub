"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TimelineItem } from "@/lib/timeline";

export function ReleaseTimeline({ items }: { items: TimelineItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [markerTop, setMarkerTop] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);

  // null = nothing hovered/focused → defaults to the latest release.
  const active = activeHref ?? items[0]?.href ?? "";

  const positionMarker = useCallback((href: string) => {
    const root = rootRef.current;
    const el = href ? itemRefs.current.get(href) : undefined;
    if (!root || !el) return;
    // `offsetTop` is relative to the nearest positioned ancestor (the root).
    setMarkerTop(el.offsetTop);
  }, []);

  // Reposition when the active item changes or when the first reveal happens
  // (fonts settle, layout stabilizes, marker becomes visible).
  useEffect(() => {
    if (active) positionMarker(active);
  }, [active, positionMarker, revealed]);

  // Keep the marker aligned if the layout shifts (resize / late font load).
  useEffect(() => {
    if (!revealed) return undefined;
    const onResize = () => {
      window.requestAnimationFrame(() => positionMarker(active));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [revealed, active, positionMarker]);
  // Scroll reveal: each entry fades/slides in as it enters the viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealedOnce = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        const batch = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          .filter((entry) => !revealedOnce.has(entry.target));
        if (batch.length === 0) return;
        batch.forEach((entry, index) => {
          const el = entry.target as HTMLElement;
          revealedOnce.add(el);
          window.setTimeout(
            () => el.classList.add("is-visible"),
            Math.min(index * 110, 450)
          );
          observer.unobserve(el);
        });
        if (!revealedRef.current) {
          revealedRef.current = true;
          setRevealed(true);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    root.querySelectorAll(".tl-item").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) {
    return (
      <p className="border-b border-line py-10 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
        No releases available yet.
      </p>
    );
  }

  // Consecutive year groups — items arrive sorted newest first.
  const groups: Array<{ year: string; items: TimelineItem[] }> = [];
  for (const item of items) {
    const year = item.dateISO.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.items.push(item);
    else groups.push({ year, items: [item] });
  }

  return (
    <div
      ref={rootRef}
      onMouseLeave={() => setActiveHref(null)}
      className={`tl-root relative space-y-8 ${revealed ? "is-revealed" : ""}`}
    >
      {groups.map((group) => (
        <div key={group.year}>
          <h3 className="eyebrow">{group.year}</h3>
          <ol className="mt-4">
            {group.items.map((item) => {
              const isActive = item.href === active;
              return (
                <li
                  key={item.href}
                  ref={(node) => {
                    if (node) itemRefs.current.set(item.href, node);
                    else itemRefs.current.delete(item.href);
                  }}
                  data-active={isActive && revealed ? "true" : "false"}
                  className="tl-item relative pb-7 pl-7 last:pb-0"
                >
                  {/* Neutral marker — the single red cursor glides onto this spot.
                      Centered with `left` (not a translate utility) so the reveal
                      translate in globals.css can't clobber the centering. */}
                  <span
                    aria-hidden="true"
                    className="tl-dot absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border border-muted/50 bg-background"
                  />
                  <Link
                    href={item.href}
                    onMouseEnter={() => setActiveHref(item.href)}
                    onFocus={() => setActiveHref(item.href)}
                    className="tl-content group block"
                  >
                    <span className="block">
                      <time
                        dateTime={item.dateISO}
                        className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint"
                      >
                        {item.dateLabel}
                      </time>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[14.5px] font-semibold text-fg transition-colors group-hover:text-accent">
                          {item.romName}
                        </span>
                        <span className="font-mono text-[13.5px] font-medium text-muted transition-colors group-hover:text-accent">
                          {item.version}
                        </span>
                        {item.isLatest && (
                          <span className="badge-new">Latest</span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted">
                        {item.meta}
                      </span>
                      <span
                        aria-hidden="true"
                        className="mt-1.5 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-faint transition-colors group-hover:text-accent"
                      >
                        View release →
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}

      {/* The one active red marker. Positioned via translateY; the +4px aligns
          it with each item's marker line (top-1 within the item). */}
      <span
        aria-hidden="true"
        className="tl-cursor"
        style={{ transform: `translateX(-50%) translateY(${markerTop + 4}px)` }}
      />
    </div>
  );
}
