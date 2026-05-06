import { jsonOk } from "@/lib/api-response";
import { branches, brand, providers, services } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return jsonOk({
    brand,
    branches,
    services,
    providers,
  });
}
