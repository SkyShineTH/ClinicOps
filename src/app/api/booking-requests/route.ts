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
import { logBookingApiEvent, readRequestId } from "@/lib/observability";

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
  const startedAt = Date.now();
  const requestUrl = new URL(req.url);
  const requestId = readRequestId(req);
  const filters = readFilters(req);
  if ("error" in filters) {
    logBookingApiEvent({
      action: "list",
      durationMs: Date.now() - startedAt,
      error: filters.error,
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 400,
      storage: getBookingStorageMode(),
    });
    return jsonError(filters.error, 400);
  }

  try {
    const items = await listBookingRequests(filters);
    logBookingApiEvent({
      action: "list",
      durationMs: Date.now() - startedAt,
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "ok",
      statusCode: 200,
      storage: getBookingStorageMode(),
    });
    return jsonOk({
      items,
      storage: getBookingStorageMode(),
    });
  } catch (error) {
    logBookingApiEvent({
      action: "list",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.name : "Error",
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 503,
      storage: getBookingStorageMode(),
    });
    return jsonError("storage_unavailable", 503);
  }
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  const requestUrl = new URL(req.url);
  const requestId = readRequestId(req);
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logBookingApiEvent({
      action: "create",
      durationMs: Date.now() - startedAt,
      error: "invalid_body",
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 400,
      storage: getBookingStorageMode(),
    });
    return jsonError("invalid_body", 400);
  }

  const parsed = parseBookingRequestBody(body);
  if ("error" in parsed) {
    logBookingApiEvent({
      action: "create",
      durationMs: Date.now() - startedAt,
      error: parsed.error,
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 400,
      storage: getBookingStorageMode(),
    });
    return jsonError(parsed.error, 400);
  }

  try {
    const row = await addBookingRequest(parsed.data);
    logBookingApiEvent({
      action: "create",
      durationMs: Date.now() - startedAt,
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "ok",
      statusCode: 201,
      storage: getBookingStorageMode(),
    });
    return jsonOk({ item: row }, { status: 201 });
  } catch (error) {
    logBookingApiEvent({
      action: "create",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.name : "Error",
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 503,
      storage: getBookingStorageMode(),
    });
    return jsonError("storage_unavailable", 503);
  }
}

export async function PATCH(req: Request) {
  const startedAt = Date.now();
  const requestUrl = new URL(req.url);
  const requestId = readRequestId(req);
  let body: { id?: string; status?: string };

  try {
    body = (await req.json()) as { id?: string; status?: string };
  } catch {
    logBookingApiEvent({
      action: "update_status",
      durationMs: Date.now() - startedAt,
      error: "invalid_body",
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 400,
      storage: getBookingStorageMode(),
    });
    return jsonError("invalid_body", 400);
  }

  if (!body.id || !body.status) {
    logBookingApiEvent({
      action: "update_status",
      durationMs: Date.now() - startedAt,
      error: "missing_fields",
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 400,
      storage: getBookingStorageMode(),
    });
    return jsonError("missing_fields", 400);
  }
  if (!isBookingRequestStatus(body.status)) {
    logBookingApiEvent({
      action: "update_status",
      durationMs: Date.now() - startedAt,
      error: "invalid_status",
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 400,
      storage: getBookingStorageMode(),
    });
    return jsonError("invalid_status", 400);
  }

  try {
    const updated = await updateBookingRequestStatus(body.id, body.status);
    if (!updated) {
      logBookingApiEvent({
        action: "update_status",
        durationMs: Date.now() - startedAt,
        error: "not_found",
        method: req.method,
        path: requestUrl.pathname,
        requestId,
        status: "error",
        statusCode: 404,
        storage: getBookingStorageMode(),
      });
      return jsonError("not_found", 404);
    }
    logBookingApiEvent({
      action: "update_status",
      durationMs: Date.now() - startedAt,
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "ok",
      statusCode: 200,
      storage: getBookingStorageMode(),
    });
    return jsonOk({ item: updated });
  } catch (error) {
    logBookingApiEvent({
      action: "update_status",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.name : "Error",
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 503,
      storage: getBookingStorageMode(),
    });
    return jsonError("storage_unavailable", 503);
  }
}
