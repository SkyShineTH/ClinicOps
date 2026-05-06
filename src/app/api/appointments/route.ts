import { jsonError, jsonOk, readSearchParam, readYmdParam } from "@/lib/api-response";
import { hydrateDemoAppointments } from "@/lib/dashboard-demo-data";
import { branches, services } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const branchId = readSearchParam(url, "branchId");
  const categoryId = readSearchParam(url, "categoryId");
  const start = readYmdParam(url, "start");
  const end = readYmdParam(url, "end");

  if (start === "invalid") return jsonError("invalid_start", 400);
  if (end === "invalid") return jsonError("invalid_end", 400);
  if (branchId && !branches.some((branch) => branch.id === branchId)) {
    return jsonError("invalid_branchId", 400);
  }
  if (categoryId && !services.some((service) => service.id === categoryId)) {
    return jsonError("invalid_categoryId", 400);
  }

  const items = hydrateDemoAppointments().filter((appointment) => {
    if (start && appointment.slotDate < start) return false;
    if (end && appointment.slotDate > end) return false;
    if (branchId && appointment.branchId !== branchId) return false;
    if (categoryId && appointment.categoryId !== categoryId) return false;
    return true;
  });

  return jsonOk({ items });
}
