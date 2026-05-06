import { jsonError, jsonOk, readSearchParam } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { createScheduleBlock, listScheduleBlocks } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = readSearchParam(url, "day");
  const items = (await listScheduleBlocks()).filter((item) => !day || item.dateYmd === day);

  return jsonOk({ items });
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

  const dateYmd = String(body.dateYmd ?? "").trim();
  const startTime = String(body.startTime ?? "").trim();
  const endTime = String(body.endTime ?? "").trim();
  const patientLabel = String(body.patientLabel ?? "").trim();
  const service = String(body.service ?? "").trim();
  const room = String(body.room ?? "ห้อง 1").trim();
  const provider = String(body.provider ?? "ไม่ระบุ").trim();
  const branch = String(body.branch ?? "สยาม").trim();
  const status = String(body.status ?? "รอเข้าพบ").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYmd)) return jsonError("invalid_date", 400);
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    return jsonError("invalid_time", 400);
  }
  if (!patientLabel || !service) return jsonError("missing_fields", 400);

  return jsonOk(
    {
      item: await createScheduleBlock({
        dateYmd,
        startTime,
        endTime,
        patientLabel: patientLabel.slice(0, 120),
        service: service.slice(0, 120),
        room: room.slice(0, 60),
        provider: provider.slice(0, 120),
        branch: branch.slice(0, 80),
        status: status.slice(0, 60),
      }),
    },
    { status: 201 },
  );
}
