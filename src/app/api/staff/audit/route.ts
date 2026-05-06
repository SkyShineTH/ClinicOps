import { jsonOk } from "@/lib/api-response";
import { listAuditEntries } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return jsonOk({ items: await listAuditEntries() });
}
