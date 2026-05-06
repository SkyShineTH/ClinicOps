import { jsonError, jsonOk } from "@/lib/api-response";
import {
  deleteBookingRequest,
  getBookingStorageMode,
  getBookingRequest,
  updateBookingRequestStatus,
} from "@/lib/booking-request-store";
import { isBookingRequestStatus } from "@/lib/booking-validation";
import { logBookingApiEvent, readRequestId } from "@/lib/observability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Context) {
  const startedAt = Date.now();
  const requestUrl = new URL(_req.url);
  const requestId = readRequestId(_req);
  const { id } = await params;

  try {
    const item = await getBookingRequest(id);
    if (!item) {
      logBookingApiEvent({
        action: "get",
        durationMs: Date.now() - startedAt,
        error: "not_found",
        method: _req.method,
        path: requestUrl.pathname,
        requestId,
        status: "error",
        statusCode: 404,
        storage: getBookingStorageMode(),
      });
      return jsonError("not_found", 404);
    }
    logBookingApiEvent({
      action: "get",
      durationMs: Date.now() - startedAt,
      method: _req.method,
      path: requestUrl.pathname,
      requestId,
      status: "ok",
      statusCode: 200,
      storage: getBookingStorageMode(),
    });
    return jsonOk({ item });
  } catch (error) {
    logBookingApiEvent({
      action: "get",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.name : "Error",
      method: _req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 503,
      storage: getBookingStorageMode(),
    });
    return jsonError("storage_unavailable", 503);
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const startedAt = Date.now();
  const requestUrl = new URL(req.url);
  const requestId = readRequestId(req);
  const { id } = await params;
  let body: { status?: string };

  try {
    body = (await req.json()) as { status?: string };
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

  if (!body.status) {
    logBookingApiEvent({
      action: "update_status",
      durationMs: Date.now() - startedAt,
      error: "missing_status",
      method: req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 400,
      storage: getBookingStorageMode(),
    });
    return jsonError("missing_status", 400);
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
    const item = await updateBookingRequestStatus(id, body.status);
    if (!item) {
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
    return jsonOk({ item });
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

export async function DELETE(_req: Request, { params }: Context) {
  const startedAt = Date.now();
  const requestUrl = new URL(_req.url);
  const requestId = readRequestId(_req);
  const { id } = await params;

  try {
    const deleted = await deleteBookingRequest(id);
    if (!deleted) {
      logBookingApiEvent({
        action: "delete",
        durationMs: Date.now() - startedAt,
        error: "not_found",
        method: _req.method,
        path: requestUrl.pathname,
        requestId,
        status: "error",
        statusCode: 404,
        storage: getBookingStorageMode(),
      });
      return jsonError("not_found", 404);
    }
    logBookingApiEvent({
      action: "delete",
      durationMs: Date.now() - startedAt,
      method: _req.method,
      path: requestUrl.pathname,
      requestId,
      status: "ok",
      statusCode: 200,
      storage: getBookingStorageMode(),
    });
    return jsonOk({ deleted: true });
  } catch (error) {
    logBookingApiEvent({
      action: "delete",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.name : "Error",
      method: _req.method,
      path: requestUrl.pathname,
      requestId,
      status: "error",
      statusCode: 503,
      storage: getBookingStorageMode(),
    });
    return jsonError("storage_unavailable", 503);
  }
}
