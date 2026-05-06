import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { updateClinicalNote } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  let body: { note?: unknown };

  try {
    body = (await req.json()) as { note?: unknown };
  } catch {
    return jsonError("invalid_body", 400);
  }

  if (typeof body.note !== "string") return jsonError("invalid_note", 400);

  const item = await updateClinicalNote(id, body.note);
  if (!item) return jsonError("not_found", 404);

  return jsonOk({ item });
}
