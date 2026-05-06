import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { deleteMarketingCampaign, updateMarketingStatus } from "@/lib/staff-demo-store";
import type { MarketingCampaign } from "@/lib/staff-seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

function isMarketingStatus(value: unknown): value is MarketingCampaign["status"] {
  return value === "active" || value === "paused" || value === "draft";
}

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

  if (!isMarketingStatus(body.status)) return jsonError("invalid_status", 400);

  const item = await updateMarketingStatus(id, body.status);
  if (!item) return jsonError("not_found", 404);

  return jsonOk({ item });
}

export async function DELETE(_req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(_req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const deleted = await deleteMarketingCampaign(id);
  if (!deleted) return jsonError("not_found", 404);
  return jsonOk({ deleted: true });
}
