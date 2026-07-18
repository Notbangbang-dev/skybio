import { NextRequest } from "next/server";
import { assertOwner } from "@/lib/auth-helpers";
import { saveUpload, type UploadKind } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS: UploadKind[] = ["image", "video", "audio"];

/** Owner-only media upload. Field `file`, query `?kind=image|video|audio`. */
export async function POST(req: NextRequest) {
  try {
    await assertOwner();
  } catch {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const kind = req.nextUrl.searchParams.get("kind") as UploadKind | null;
  if (!kind || !KINDS.includes(kind)) {
    return Response.json({ ok: false, error: "Invalid kind" }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: "No file" }, { status: 400 });
  }

  const res = await saveUpload(file, kind);
  if (!res.ok) return Response.json(res, { status: 400 });
  return Response.json(res);
}
