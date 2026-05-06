import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import {
  STAFF_CAPABILITIES,
  updatePermission,
  type StaffCapabilityId,
} from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ capability: string; userId: string }>;
};

function isCapability(value: string): value is StaffCapabilityId {
  return STAFF_CAPABILITIES.some((capability) => capability.id === value);
}

export async function PATCH(req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(req);
  if (unauthorized) return unauthorized;

  const { capability, userId } = await params;
  let body: { enabled?: unknown };

  try {
    body = (await req.json()) as { enabled?: unknown };
  } catch {
    return jsonError("invalid_body", 400);
  }

  if (!isCapability(capability)) return jsonError("invalid_capability", 400);
  if (typeof body.enabled !== "boolean") return jsonError("invalid_enabled", 400);

  const row = await updatePermission(userId, capability, body.enabled);
  if (!row) return jsonError("not_found", 404);

  return jsonOk({ row });
}
