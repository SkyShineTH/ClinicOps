import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { createClinicalVisit, listClinicalVisits } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return jsonOk({ items: await listClinicalVisits() });
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

  const hn = String(body.hn ?? "").trim();
  const patientLabel = String(body.patientLabel ?? "").trim();
  const provider = String(body.provider ?? "ไม่ระบุ").trim();
  const branch = String(body.branch ?? "สยาม").trim();
  const summary = String(body.summary ?? "").trim();
  const note = String(body.note ?? "").trim();
  const visitedAt = String(body.visitedAt ?? new Date().toISOString()).trim();
  const consentFlags = Array.isArray(body.consentFlags)
    ? body.consentFlags.map(String).filter(Boolean).slice(0, 6)
    : [];

  if (!hn || !patientLabel || !summary) return jsonError("missing_fields", 400);
  if (Number.isNaN(Date.parse(visitedAt))) return jsonError("invalid_visitedAt", 400);

  return jsonOk(
    {
      item: await createClinicalVisit({
        hn: hn.slice(0, 40),
        patientLabel: patientLabel.slice(0, 120),
        provider: provider.slice(0, 120),
        branch: branch.slice(0, 80),
        summary: summary.slice(0, 500),
        visitedAt,
        consentFlags,
        note: note.slice(0, 1000),
      }),
    },
    { status: 201 },
  );
}
