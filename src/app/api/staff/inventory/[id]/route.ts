import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { adjustInventoryQty, deleteInventoryItem } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  let body: { delta?: unknown };

  try {
    body = (await req.json()) as { delta?: unknown };
  } catch {
    return jsonError("invalid_body", 400);
  }

  const delta = Number(body.delta);
  if (!Number.isFinite(delta) || !Number.isInteger(delta) || Math.abs(delta) > 100) {
    return jsonError("invalid_delta", 400);
  }

  const item = await adjustInventoryQty(id, delta);
  if (!item) return jsonError("not_found", 404);

  return jsonOk({ item });
}

export async function DELETE(_req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(_req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const deleted = await deleteInventoryItem(id);
  if (!deleted) return jsonError("not_found", 404);
  return jsonOk({ deleted: true });
}
