import { jsonError, jsonOk } from "@/lib/api-response";
import {
  deleteBookingRequest,
  getBookingRequest,
  updateBookingRequestStatus,
} from "@/lib/booking-request-store";
import { isBookingRequestStatus } from "@/lib/booking-validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params;

  try {
    const item = await getBookingRequest(id);
    if (!item) return jsonError("not_found", 404);
    return jsonOk({ item });
  } catch (error) {
    console.error("Failed to get booking request", error);
    return jsonError("storage_unavailable", 503);
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const { id } = await params;
  let body: { status?: string };

  try {
    body = (await req.json()) as { status?: string };
  } catch {
    return jsonError("invalid_body", 400);
  }

  if (!body.status) return jsonError("missing_status", 400);
  if (!isBookingRequestStatus(body.status)) return jsonError("invalid_status", 400);

  try {
    const item = await updateBookingRequestStatus(id, body.status);
    if (!item) return jsonError("not_found", 404);
    return jsonOk({ item });
  } catch (error) {
    console.error("Failed to update booking request", error);
    return jsonError("storage_unavailable", 503);
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await params;

  try {
    const deleted = await deleteBookingRequest(id);
    if (!deleted) return jsonError("not_found", 404);
    return jsonOk({ deleted: true });
  } catch (error) {
    console.error("Failed to delete booking request", error);
    return jsonError("storage_unavailable", 503);
  }
}
