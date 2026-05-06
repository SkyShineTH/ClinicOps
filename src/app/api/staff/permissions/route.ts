import { jsonOk } from "@/lib/api-response";
import { getPermissionMatrix, STAFF_CAPABILITIES } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return jsonOk({
    capabilities: STAFF_CAPABILITIES,
    matrix: await getPermissionMatrix(),
  });
}
