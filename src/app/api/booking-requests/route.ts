import { NextResponse } from "next/server";
import {
  addBookingRequest,
  getBookingStorageMode,
  listBookingRequests,
  updateBookingRequestStatus,
  type BookingRequestInput,
} from "@/lib/booking-request-store";
import type { BookingRequestStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowedStatuses = ["pending", "confirmed", "reschedule", "rejected"] as const;

function requiredString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (value == null || String(value).trim() === "") return null;
  return String(value).trim();
}

function optionalString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (value == null || String(value).trim() === "") return null;
  return String(value).trim();
}

function parseBookingRequestBody(body: unknown): { data: BookingRequestInput } | { error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { error: "invalid_body" };
  }

  const record = body as Record<string, unknown>;
  const branchId = requiredString(record, "branchId");
  const branchName = requiredString(record, "branchName");
  const serviceId = requiredString(record, "serviceId");
  const serviceName = requiredString(record, "serviceName");
  const slotStart = requiredString(record, "slotStart");
  const patientName = requiredString(record, "patientName");
  const phone = requiredString(record, "phone");

  if (!branchId) return { error: "missing_branchId" };
  if (!branchName) return { error: "missing_branchName" };
  if (!serviceId) return { error: "missing_serviceId" };
  if (!serviceName) return { error: "missing_serviceName" };
  if (!slotStart) return { error: "missing_slotStart" };
  if (Number.isNaN(Date.parse(slotStart))) return { error: "invalid_slotStart" };
  if (!patientName) return { error: "missing_patientName" };
  if (!phone) return { error: "missing_phone" };

  return {
    data: {
      branchId,
      branchName,
      serviceId,
      serviceName,
      providerPreference: optionalString(record, "providerPreference"),
      slotStart,
      patientName,
      phone,
      email: optionalString(record, "email"),
      note: optionalString(record, "note"),
    },
  };
}

function isBookingRequestStatus(status: string): status is BookingRequestStatus {
  return allowedStatuses.includes(status as (typeof allowedStatuses)[number]);
}

export async function GET() {
  try {
    return NextResponse.json({
      items: await listBookingRequests(),
      storage: getBookingStorageMode(),
    });
  } catch (error) {
    console.error("Failed to list booking requests", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = parseBookingRequestBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const row = await addBookingRequest(parsed.data);
    return NextResponse.json({ item: row });
  } catch (error) {
    console.error("Failed to create booking request", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  let body: { id?: string; status?: string };

  try {
    body = (await req.json()) as { id?: string; status?: string };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!isBookingRequestStatus(body.status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  try {
    const updated = await updateBookingRequestStatus(body.id, body.status);
    if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("Failed to update booking request", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
