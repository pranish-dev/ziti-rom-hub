"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MIN_DISPLAY_MS = 300;
const FINISH_MS = 400;
const WATCHDOG_MS = 5000;

function isInternalNavigation(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    anchor.target === "_blank" ||
    anchor.hasAttribute("download")
  ) {
    return false;
  }

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Red top progress bar shown while a client-side navigation is in flight.
 * Starts when an internal link is clicked, finishes when the route changes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const startPath = useRef<string | null>(null);
  const shownAt = useRef(0);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor || !isInternalNavigation(anchor)) return;
      startPath.current = window.location.pathname;
      shownAt.current = performance.now();
      setDone(false);
      setLoading(true);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Route changed → finish the bar (respecting a minimum display time).
  useEffect(() => {
    if (!loading) return;
    if (startPath.current === null || startPath.current === pathname) return;

    const wait = Math.max(0, MIN_DISPLAY_MS - (performance.now() - shownAt.current));
    const finish = window.setTimeout(() => setDone(true), wait);
    const reset = window.setTimeout(() => {
      setLoading(false);
      setDone(false);
      startPath.current = null;
    }, wait + FINISH_MS);

    return () => {
      window.clearTimeout(finish);
      window.clearTimeout(reset);
    };
  }, [pathname, loading]);

  // Watchdog: never leave the bar stuck if a navigation never completes.
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => {
      setLoading(false);
      setDone(false);
      startPath.current = null;
    }, WATCHDOG_MS);
    return () => window.clearTimeout(timer);
  }, [loading]);

  if (!loading) return null;

  return (
    <div aria-hidden="true" className="nav-progress-track">
      <div className={`nav-progress-bar${done ? " nav-progress-bar--done" : ""}`} />
    </div>
  );
}
