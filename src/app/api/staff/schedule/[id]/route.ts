import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { deleteScheduleBlock, updateScheduleStatus } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  let body: { status?: unknown };

  try {
    body = (await req.json()) as { status?: unknown };
  } catch {
    return jsonError("invalid_body", 400);
  }

  if (typeof body.status !== "string" || body.status.trim() === "") {
    return jsonError("invalid_status", 400);
  }

  const item = await updateScheduleStatus(id, body.status.trim());
  if (!item) return jsonError("not_found", 404);

  return jsonOk({ item });
}

export async function DELETE(_req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(_req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const deleted = await deleteScheduleBlock(id);
  if (!deleted) return jsonError("not_found", 404);
  return jsonOk({ deleted: true });
}
