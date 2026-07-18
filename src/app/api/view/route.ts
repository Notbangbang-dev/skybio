import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight in-memory per-IP throttle: at most one counted view per IP per
// window. Bounds counter inflation + DB write amplification without needing
// Redis. (Single-container deploy → one process → this map is authoritative.)
const WINDOW_MS = 60_000;
const seen = new Map<string, number>();

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Increment the public view counter (throttled). Best-effort; never throws. */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const now = Date.now();

    // Opportunistic cleanup so the map can't grow unbounded.
    if (seen.size > 5000) {
      for (const [k, t] of seen) if (now - t > WINDOW_MS) seen.delete(k);
    }

    const last = seen.get(ip);
    if (last && now - last < WINDOW_MS) {
      const cur = await prisma.profile.findUnique({
        where: { id: "singleton" },
        select: { views: true },
      });
      return Response.json({ ok: true, views: cur?.views ?? 0, throttled: true });
    }
    seen.set(ip, now);

    const p = await prisma.profile.update({
      where: { id: "singleton" },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    return Response.json({ ok: true, views: p.views });
  } catch {
    return Response.json({ ok: false }, { status: 200 });
  }
}
