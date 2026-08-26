"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps every <pre> in the markdown HTML with a copy button at render time,
 * so the button is part of the server-rendered HTML (visible immediately,
 * even before JavaScript loads). The effect below only wires up the click
 * handling via event delegation.
 */
function withCopyButtons(html: string): string {
  return html.replace(
    /<pre([^>]*)>([\s\S]*?)<\/pre>/g,
    (_match, attrs: string, inner: string) =>
      `<div class="code-block"><pre${attrs}>${inner}</pre>` +
      `<button type="button" class="code-copy" aria-label="Copy code to clipboard">Copy</button></div>`
  );
}

function fallbackCopy(text: string): boolean {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}

export function MarkdownBody({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button.code-copy");
      if (!button) return;

      const code = button.parentElement?.querySelector("pre");
      const text = code?.textContent ?? "";
      const flash = () => {
        button.textContent = "Copied";
        button.classList.add("code-copy--done");
        window.setTimeout(() => {
          button.textContent = "Copy";
          button.classList.remove("code-copy--done");
        }, 1600);
      };

      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(flash)
          .catch(() => fallbackCopy(text) && flash());
      } else if (fallbackCopy(text)) {
        flash();
      }
    }

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: withCopyButtons(html) }}
    />
  );
}
