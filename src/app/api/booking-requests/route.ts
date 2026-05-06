import {
  addBookingRequest,
  getBookingStorageMode,
  listBookingRequests,
  updateBookingRequestStatus,
  type BookingRequestFilters,
} from "@/lib/booking-request-store";
import { jsonError, jsonOk, readSearchParam, readYmdParam } from "@/lib/api-response";
import {
  isBookingRequestStatus,
  parseBookingRequestBody,
} from "@/lib/booking-validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function readFilters(req: Request): BookingRequestFilters | { error: string } {
  const url = new URL(req.url);
  const start = readYmdParam(url, "start");
  const end = readYmdParam(url, "end");
  const status = readSearchParam(url, "status");

  if (start === "invalid") return { error: "invalid_start" };
  if (end === "invalid") return { error: "invalid_end" };
  if (status && !isBookingRequestStatus(status)) return { error: "invalid_status" };
  const statusFilter = status && isBookingRequestStatus(status) ? status : null;

  return {
    branchId: readSearchParam(url, "branchId"),
    serviceId: readSearchParam(url, "serviceId"),
    status: statusFilter,
    start,
    end,
  };
}

export async function GET(req: Request) {
  const filters = readFilters(req);
  if ("error" in filters) {
    return jsonError(filters.error, 400);
  }

  try {
    return jsonOk({
      items: await listBookingRequests(filters),
      storage: getBookingStorageMode(),
    });
  } catch (error) {
    console.error("Failed to list booking requests", error);
    return jsonError("storage_unavailable", 503);
  }
}

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonError("invalid_body", 400);
  }

  const parsed = parseBookingRequestBody(body);
  if ("error" in parsed) {
    return jsonError(parsed.error, 400);
  }

  try {
    const row = await addBookingRequest(parsed.data);
    return jsonOk({ item: row }, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking request", error);
    return jsonError("storage_unavailable", 503);
  }
}

export async function PATCH(req: Request) {
  let body: { id?: string; status?: string };

  try {
    body = (await req.json()) as { id?: string; status?: string };
  } catch {
    return jsonError("invalid_body", 400);
  }

  if (!body.id || !body.status) {
    return jsonError("missing_fields", 400);
  }
  if (!isBookingRequestStatus(body.status)) {
    return jsonError("invalid_status", 400);
  }

  try {
    const updated = await updateBookingRequestStatus(body.id, body.status);
    if (!updated) return jsonError("not_found", 404);
    return jsonOk({ item: updated });
  } catch (error) {
    console.error("Failed to update booking request", error);
    return jsonError("storage_unavailable", 503);
  }
}
