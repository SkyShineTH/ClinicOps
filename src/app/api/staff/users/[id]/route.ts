import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { deleteStaffUser } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(_req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const deleted = await deleteStaffUser(id);
  if (!deleted) return jsonError("not_found", 404);
  return jsonOk({ deleted: true });
}
