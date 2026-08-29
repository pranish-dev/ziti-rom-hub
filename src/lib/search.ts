/**
 * Shared client-side search: static index loading, tokenization and scoring.
 *
 * The index itself is generated at build time by
 * scripts/generate-search-index.ts into public/search-index.json, so search
 * works entirely from static files (Cloudflare Pages, `output: "export"`).
 */

export interface SearchEntry {
  kind: "ROM" | "Release" | "Guide";
  title: string;
  subtitle: string;
  url: string;
  terms: string;
}

export const SEARCH_INDEX_URL = "/search-index.json";

/** Fetch the static search index generated at build time. */
export async function loadSearchIndex(): Promise<SearchEntry[]> {
  const response = await fetch(SEARCH_INDEX_URL);
  if (!response.ok) {
    throw new Error(`Search index request failed: ${response.status}`);
  }
  return (await response.json()) as SearchEntry[];
}

/** Release results first, then ROMs, then guides — for equal scores. */
const KIND_ORDER: Record<SearchEntry["kind"], number> = {
  Release: 0,
  ROM: 1,
  Guide: 2,
};

/**
 * Lowercase and collapse punctuation/underscores to spaces, so e.g. the query
 * "312" still matches "3.12-Hotfix" and "evolution x" matches "EvolutionX".
 */
function fold(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Split a raw query into lowercase whitespace-separated tokens. */
function tokenize(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Score one token against one haystack tier. Exact/prefix/substring matches on
 * the raw text rank highest; a punctuation-folded match ranks just below the
 * raw substring match so exact spellings win ties.
 */
function tierScore(
  haystack: string,
  foldedHaystack: string,
  token: string,
  foldedToken: string,
  exact: number,
  prefix: number,
  includes: number
): number | null {
  if (haystack.includes(token)) {
    if (haystack === token) return exact;
    if (haystack.startsWith(token)) return prefix;
    return includes;
  }
  if (foldedToken.length > 0 && foldedHaystack.includes(foldedToken)) {
    return Math.max(1, Math.round(includes * 0.6));
  }
  return null;
}

/**
 * Score a single entry against tokenized query text. Every token must match
 * somewhere (AND); title hits outweigh subtitle hits, which outweigh the
 * metadata/body blob. Returns null when the entry does not match at all.
 */
export function scoreEntry(entry: SearchEntry, tokens: string[]): number | null {
  const title = entry.title.toLowerCase();
  const subtitle = entry.subtitle.toLowerCase();
  const terms = entry.terms;
  const foldedTitle = fold(entry.title);
  const foldedSubtitle = fold(entry.subtitle);
  const foldedTerms = fold(entry.terms);

  let total = 0;
  for (const token of tokens) {
    const foldedToken = fold(token);
    let score = tierScore(
      title, foldedTitle, token, foldedToken, 160, 110, 70
    );
    if (score === null) {
      score = tierScore(
        subtitle, foldedSubtitle, token, foldedToken, 40, 34, 30
      );
    }
    if (score === null && terms.includes(token)) {
      score = 12;
    }
    if (score === null && foldedToken.length > 0 && foldedTerms.includes(foldedToken)) {
      score = 8;
    }
    if (score === null) return null;
    total += score;
  }
  return total;
}

/**
 * Search the index for a raw query string, best matches first. Returns all
 * matches (callers apply their own display limit).
 */
export function searchEntries(index: SearchEntry[], query: string): SearchEntry[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scored: Array<{ entry: SearchEntry; score: number }> = [];
  for (const entry of index) {
    const score = scoreEntry(entry, tokens);
    if (score !== null) scored.push({ entry, score });
  }
  return scored
    .sort(
      (a, b) =>
        b.score - a.score || KIND_ORDER[a.entry.kind] - KIND_ORDER[b.entry.kind]
    )
    .map((item) => item.entry);
}