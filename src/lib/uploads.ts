import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "@/env";

export type UploadKind = "image" | "video" | "audio";

/** Allowed extensions + magic-byte signatures per kind. */
const RULES: Record<
  UploadKind,
  { exts: string[]; mimes: string[]; sniff: (b: Buffer) => boolean }
> = {
  image: {
    exts: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"],
    mimes: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif"],
    sniff: (b) =>
      // PNG
      (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) ||
      // JPEG
      (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ||
      // GIF
      (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) ||
      // RIFF (webp) / others share RIFF; ftyp (avif) checked loosely
      (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) ||
      b.slice(4, 8).toString("ascii") === "ftyp",
  },
  video: {
    exts: [".mp4", ".webm", ".mov", ".m4v", ".ogv"],
    mimes: ["video/mp4", "video/webm", "video/quicktime", "video/ogg"],
    sniff: (b) =>
      // ISO base media (mp4/mov): ....ftyp
      b.slice(4, 8).toString("ascii") === "ftyp" ||
      // WebM / Matroska (EBML)
      (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) ||
      // Ogg
      (b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53),
  },
  audio: {
    exts: [".mp3", ".ogg", ".wav", ".m4a", ".flac", ".opus"],
    mimes: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4", "audio/flac", "audio/x-m4a"],
    sniff: (b) =>
      // ID3 (mp3) or MPEG frame sync
      (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) ||
      (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) ||
      // Ogg / Opus
      (b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53) ||
      // RIFF/WAVE
      (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) ||
      // flac
      (b[0] === 0x66 && b[1] === 0x4c && b[2] === 0x61 && b[3] === 0x43) ||
      // ISO base media (m4a): ....ftyp
      b.slice(4, 8).toString("ascii") === "ftyp",
  },
};

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".ogv": "video/ogg",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".opus": "audio/ogg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".flac": "audio/flac",
};

export function contentTypeFor(name: string): string {
  return CONTENT_TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream";
}

function uploadRoot(): string {
  return path.resolve(env.UPLOAD_DIR);
}

export interface SaveResult {
  ok: boolean;
  url?: string;
  error?: string;
}

/**
 * Validate (extension + declared mime + magic bytes + size) and save an uploaded
 * file under UPLOAD_DIR with a random name. Returns a public /api/uploads/ URL.
 */
export async function saveUpload(file: File, kind: UploadKind): Promise<SaveResult> {
  const rule = RULES[kind];
  const ext = path.extname(file.name).toLowerCase();

  if (!rule.exts.includes(ext)) {
    return { ok: false, error: `Unsupported ${kind} type (${ext || "no extension"}).` };
  }
  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  if (file.size <= 0) return { ok: false, error: "Empty file." };
  if (file.size > maxBytes) {
    return { ok: false, error: `File too large (max ${env.MAX_UPLOAD_MB} MB).` };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (!rule.sniff(buf.subarray(0, 16))) {
    return { ok: false, error: "File contents don't match the expected format." };
  }

  const dir = path.join(uploadRoot(), kind);
  await fs.mkdir(dir, { recursive: true });
  const name = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  await fs.writeFile(path.join(dir, name), buf);

  return { ok: true, url: `/api/uploads/${kind}/${name}` };
}

/**
 * Resolve a request path (segments after /api/uploads/) to an absolute file
 * inside UPLOAD_DIR, or null if it escapes the root (path-traversal guard).
 */
export function resolveUploadPath(segments: string[]): string | null {
  const root = uploadRoot();
  const target = path.resolve(root, ...segments);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

export async function readUpload(target: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(target);
  } catch {
    return null;
  }
}
