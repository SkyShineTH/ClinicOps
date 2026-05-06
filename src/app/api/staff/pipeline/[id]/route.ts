import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { deletePipelineLead, updatePipelineStage } from "@/lib/staff-demo-store";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/staff-seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  let body: { stage?: unknown };

  try {
    body = (await req.json()) as { stage?: unknown };
  } catch {
    return jsonError("invalid_body", 400);
  }

  if (typeof body.stage !== "string" || !PIPELINE_STAGES.includes(body.stage as PipelineStage)) {
    return jsonError("invalid_stage", 400);
  }

  const item = await updatePipelineStage(id, body.stage as PipelineStage);
  if (!item) return jsonError("not_found", 404);

  return jsonOk({ item });
}

export async function DELETE(_req: Request, { params }: Context) {
  const unauthorized = authorizeStaffRequest(_req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const deleted = await deletePipelineLead(id);
  if (!deleted) return jsonError("not_found", 404);
  return jsonOk({ deleted: true });
}
