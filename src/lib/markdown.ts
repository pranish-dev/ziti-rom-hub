import { marked } from "marked";

marked.use({ gfm: true });

/** Render a markdown string to HTML. Content is repo-owned and trusted. */
export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}

/** Convert markdown to a plain-text approximation for search/excerpts. */
export function stripMarkdown(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[*_~>#|-]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
