import { NextRequest } from "next/server";
import { createReadStream } from "fs";
import { contentTypeFor, resolveUploadPath, uploadSize } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stream a byte range of a file as a web ReadableStream. Uses an explicit
 * controller bridge (not Readable.toWeb, which can misbehave as a Next response
 * body) so uploaded images/audio/video always serve correctly, without ever
 * buffering the whole file into memory.
 */
function fileStream(target: string, start: number, end: number): ReadableStream<Uint8Array> {
  const node = createReadStream(target, { start, end });
  return new ReadableStream<Uint8Array>({
    start(controller) {
      node.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)));
      node.on("end", () => controller.close());
      node.on("error", (err) => controller.error(err));
    },
    cancel() {
      node.destroy();
    },
  });
}

/**
 * Serve an uploaded file from UPLOAD_DIR. Read-only, path-traversal guarded, and
 * streamed with Range support so <video>/<audio> can seek.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const target = resolveUploadPath(segments ?? []);
  if (!target) return new Response("Not found", { status: 404 });

  const total = await uploadSize(target);
  if (total === null) return new Response("Not found", { status: 404 });

  const contentType = contentTypeFor(target);

  if (total === 0) {
    return new Response(new Uint8Array(), {
      status: 200,
      headers: { "Content-Type": contentType, "Content-Length": "0", "Accept-Ranges": "bytes" },
    });
  }

  const range = req.headers.get("range");
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range);

  if (m) {
    let start = m[1] ? parseInt(m[1], 10) : 0;
    let end = m[2] ? parseInt(m[2], 10) : total - 1;
    if (!Number.isFinite(start) || start < 0) start = 0;
    if (!Number.isFinite(end) || end >= total) end = total - 1;
    if (start > end || start >= total) {
      return new Response("Range Not Satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${total}` },
      });
    }
    return new Response(fileStream(target, start, end), {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return new Response(fileStream(target, 0, total - 1), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(total),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
