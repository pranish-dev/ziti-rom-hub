#!/usr/bin/env node
/**
 * Copies image assets from content/ into public/media/ so they can be
 * served statically (and optimized by next/image).
 *
 * content/roms/lunaris-aosp/releases/3.12/banner.webp
 *   → public/media/roms/lunaris-aosp/releases/3.12/banner.webp
 *
 * Runs before `next dev` and `next build`. Output is gitignored.
 */
import { mkdirSync, copyFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const DEST = join(ROOT, "public", "media");

const IMAGE_EXTENSIONS = new Set([
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".avif",
  ".gif",
]);

function walk(dir, base = "") {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (statSync(abs).isDirectory()) {
      files.push(...walk(abs, rel));
    } else if (IMAGE_EXTENSIONS.has(extname(entry).toLowerCase())) {
      files.push({ abs, rel });
    }
  }
  return files;
}

const images = walk(CONTENT);
let copied = 0;

for (const { abs, rel } of images) {
  const target = join(DEST, rel);
  try {
    const existing = statSync(target);
    if (existing.mtimeMs >= statSync(abs).mtimeMs && existing.size === statSync(abs).size) {
      continue;
    }
  } catch {
    // target missing — fall through and copy
  }
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(abs, target);
  copied += 1;
}

console.log(
  `[copy-media] ${copied} new file${copied === 1 ? "" : "s"} copied to public/media (${images.length} total)`
);
