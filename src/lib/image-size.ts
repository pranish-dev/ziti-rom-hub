import fs from "node:fs";

/**
 * Minimal dependency-free image dimension reader for the formats allowed in
 * content/ (png, jpg, webp, avif). Used to render banners at their natural
 * aspect ratio with next/image. Returns a sane 16:9 fallback when a file
 * cannot be parsed — layout uses `height: auto`, so nothing is distorted.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

const FALLBACK: ImageDimensions = { width: 1600, height: 900 };

function readPng(buf: Buffer): ImageDimensions | null {
  // 8-byte signature + 4-byte length + "IHDR" → width at 16, height at 20
  if (buf.length < 24) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function readJpeg(buf: Buffer): ImageDimensions | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let pos = 2;
  while (pos + 9 < buf.length) {
    if (buf[pos] !== 0xff) {
      pos += 1;
      continue;
    }
    const marker = buf[pos + 1];
    // SOF0–SOF15, excluding DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return {
        height: buf.readUInt16BE(pos + 5),
        width: buf.readUInt16BE(pos + 7),
      };
    }
    pos += 2 + buf.readUInt16BE(pos + 2);
  }
  return null;
}

function readWebp(buf: Buffer): ImageDimensions | null {
  if (buf.length < 30) return null;
  if (buf.toString("latin1", 0, 4) !== "RIFF" || buf.toString("latin1", 8, 12) !== "WEBP") {
    return null;
  }
  const chunk = buf.toString("latin1", 12, 16);

  if (chunk === "VP8 ") {
    // lossy: 3-byte frame tag, 3-byte sync code (9d 01 2a), then 14-bit dims
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    // lossless: signature byte 0x2f, then packed 14-bit dims
    if (buf[20] !== 0x2f) return null;
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  if (chunk === "VP8X") {
    // extended: 3-byte width-1 and height-1 (little-endian) at offset 24
    return {
      width: buf.readUIntLE(24, 3) + 1,
      height: buf.readUIntLE(27, 3) + 1,
    };
  }
  return null;
}

/** Walk ISOBMFF boxes (AVIF/HEIF) looking for an ispe box. */
function findIspe(buf: Buffer, start: number, end: number): ImageDimensions | null {
  let pos = start;
  while (pos + 8 <= end) {
    let size = buf.readUInt32BE(pos);
    const type = buf.toString("latin1", pos + 4, pos + 8);
    let headerSize = 8;
    if (size === 1) {
      if (pos + 16 > end) break;
      size = Number(buf.readBigUInt64BE(pos + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = end - pos;
    }
    if (size < headerSize) break;

    const bodyStart = pos + headerSize;
    const bodyEnd = Math.min(pos + size, end);

    if (type === "meta") {
      // full box: skip 4-byte version/flags before child boxes
      const found = findIspe(buf, bodyStart + 4, bodyEnd);
      if (found) return found;
    } else if (type === "iprp" || type === "ipco") {
      const found = findIspe(buf, bodyStart, bodyEnd);
      if (found) return found;
    } else if (type === "ispe") {
      if (bodyEnd - bodyStart >= 12) {
        return {
          width: buf.readUInt32BE(bodyStart + 4),
          height: buf.readUInt32BE(bodyStart + 8),
        };
      }
    }
    pos += size;
  }
  return null;
}

function readAvif(buf: Buffer): ImageDimensions | null {
  if (buf.toString("latin1", 4, 8) !== "ftyp") return null;
  return findIspe(buf, 0, buf.length);
}

export function getImageDimensions(absolutePath: string): ImageDimensions {
  try {
    const buf = fs.readFileSync(absolutePath);
    const ext = absolutePath.slice(absolutePath.lastIndexOf(".") + 1).toLowerCase();

    let dims: ImageDimensions | null = null;
    if (ext === "png") dims = readPng(buf);
    else if (ext === "jpg" || ext === "jpeg") dims = readJpeg(buf);
    else if (ext === "webp") dims = readWebp(buf);
    else if (ext === "avif") dims = readAvif(buf);

    if (dims && dims.width > 0 && dims.height > 0) return dims;
  } catch {
    // unreadable file → fallback below
  }
  return FALLBACK;
}
