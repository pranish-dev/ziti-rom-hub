"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const SWIPE_THRESHOLD_PX = 48;

/**
 * Responsive screenshot gallery with a lightbox.
 * - keyboard: Esc closes, ←/→ navigate
 * - touch: swipe left/right navigates
 * - scroll is locked while the lightbox is open
 */
export function ScreenshotGallery({
  images,
  altBase,
}: {
  images: string[];
  altBase: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length]
  );

  const isOpen = openIndex !== null;

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, step]);

  if (images.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {images.map((src, index) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group block w-full overflow-hidden border border-line bg-surface transition-colors hover:border-muted/50 focus-visible:border-accent"
              aria-label={`Open screenshot ${index + 1} of ${images.length}`}
            >
              <span className="relative block aspect-[9/18.5] w-full">
                <Image
                  src={src}
                  alt={`${altBase} — screenshot ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${altBase} screenshots`}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={close}
          onTouchStart={(event) => {
            setTouchStartX(event.changedTouches[0].clientX);
          }}
          onTouchEnd={(event) => {
            if (touchStartX === null) return;
            const delta =
              event.changedTouches[0].clientX - touchStartX;
            setTouchStartX(null);
            if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
              step(delta > 0 ? -1 : 1);
            }
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              {openIndex + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={close}
              className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-fg"
              aria-label="Close gallery"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  d="M3 3l12 12M15 3L3 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill="none"
                />
              </svg>
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={images[openIndex]}
              src={images[openIndex]}
              alt={`${altBase} — screenshot ${openIndex + 1}`}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          </div>

          <div
            className="flex items-center justify-center gap-4 pb-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous screenshot"
              className="flex h-12 w-12 items-center justify-center border border-line text-muted transition-colors hover:border-muted/60 hover:text-fg"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M10 2 4 8l6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill="none"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next screenshot"
              className="flex h-12 w-12 items-center justify-center border border-line text-muted transition-colors hover:border-muted/60 hover:text-fg"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 2l6 6-6 6" stroke="currentColor" strokeWidth="1.8" fill="none" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
