import { jsonError, jsonOk, readSearchParam } from "@/lib/api-response";
import { branches, providers } from "@/lib/mock-data";
import { buildSlotPresets } from "@/lib/provider-availability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const branchId = readSearchParam(url, "branchId");
  const providerId = readSearchParam(url, "providerId") ?? "any";

  if (!branchId) return jsonError("missing_branchId", 400);
  if (!branches.some((branch) => branch.id === branchId)) return jsonError("invalid_branchId", 400);
  if (!providers.some((provider) => provider.id === providerId)) {
    return jsonError("invalid_providerId", 400);
  }

  return jsonOk({
    items: buildSlotPresets(branchId, providerId),
  });
}
