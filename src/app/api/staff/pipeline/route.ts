import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { createPipelineLead, listPipelineLeads } from "@/lib/staff-demo-store";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/staff-seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return jsonOk({
    items: await listPipelineLeads(),
    stages: PIPELINE_STAGES,
  });
}

export async function POST(req: Request) {
  const unauthorized = authorizeStaffRequest(req);
  if (unauthorized) return unauthorized;

  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError("invalid_body", 400);
  }

  const name = String(body.name ?? "").trim();
  const phoneLast4 = String(body.phoneLast4 ?? "").replace(/\D/g, "").slice(-4);
  const stage = String(body.stage ?? "สอบถาม") as PipelineStage;
  const valueThb = Number(body.valueThb ?? 0);
  const source = String(body.source ?? "เว็บจอง").trim();
  const note = String(body.note ?? "").trim();

  if (!name || phoneLast4.length !== 4) return jsonError("missing_fields", 400);
  if (!PIPELINE_STAGES.includes(stage)) return jsonError("invalid_stage", 400);
  if (!Number.isFinite(valueThb) || valueThb < 0) return jsonError("invalid_value", 400);

  return jsonOk(
    {
      item: await createPipelineLead({
        name: name.slice(0, 120),
        phoneLast4,
        stage,
        valueThb: Math.trunc(valueThb),
        source: source.slice(0, 80),
        note: note.slice(0, 240),
      }),
    },
    { status: 201 },
  );
}
