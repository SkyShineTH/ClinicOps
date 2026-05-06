import { branches, services } from "./mock-data";
import type { BookingRequestStatus } from "./types";
import type { BookingRequestInput } from "./booking-request-store";

export const allowedBookingStatuses = [
  "pending",
  "confirmed",
  "reschedule",
  "rejected",
] as const satisfies readonly BookingRequestStatus[];

const thPhone = /^0[0-9]{9}$/;
const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requiredString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (value == null || String(value).trim() === "") return null;
  return String(value).trim();
}

function optionalString(body: Record<string, unknown>, key: string, maxLength = 500) {
  const value = body[key];
  if (value == null || String(value).trim() === "") return null;
  return String(value).trim().slice(0, maxLength);
}

export function isBookingRequestStatus(status: string): status is BookingRequestStatus {
  return allowedBookingStatuses.includes(status as BookingRequestStatus);
}

export function parseBookingRequestBody(
  body: unknown,
): { data: BookingRequestInput } | { error: string } {
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
  const phone = requiredString(record, "phone")?.replace(/\s+/g, "");
  const email = optionalString(record, "email", 120);

  if (!branchId) return { error: "missing_branchId" };
  if (!branches.some((branch) => branch.id === branchId)) return { error: "invalid_branchId" };
  if (!branchName) return { error: "missing_branchName" };
  if (!serviceId) return { error: "missing_serviceId" };
  if (!services.some((service) => service.id === serviceId)) return { error: "invalid_serviceId" };
  if (!serviceName) return { error: "missing_serviceName" };
  if (!slotStart) return { error: "missing_slotStart" };
  if (Number.isNaN(Date.parse(slotStart))) return { error: "invalid_slotStart" };
  if (!patientName || patientName.length < 2) return { error: "missing_patientName" };
  if (!phone) return { error: "missing_phone" };
  if (!thPhone.test(phone)) return { error: "invalid_phone" };
  if (email && !simpleEmail.test(email)) return { error: "invalid_email" };

  return {
    data: {
      branchId,
      branchName,
      serviceId,
      serviceName,
      providerPreference: optionalString(record, "providerPreference", 120),
      slotStart,
      patientName: patientName.slice(0, 120),
      phone,
      email,
      note: optionalString(record, "note", 700),
    },
  };
}
