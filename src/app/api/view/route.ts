import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Increment the public view counter. Best-effort; never throws to the client. */
export async function POST() {
  try {
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
