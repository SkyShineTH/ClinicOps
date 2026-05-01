import { randomUUID } from "node:crypto";
import { getRequiredSql } from "./database";
import type { BookingRequest, BookingRequestStatus } from "./types";

export type BookingRequestInput = Omit<BookingRequest, "id" | "createdAt" | "status">;

type BookingRequestRow = {
  id: string;
  created_at: Date | string;
  branch_id: string;
  branch_name: string;
  service_id: string;
  service_name: string;
  provider_preference: string | null;
  slot_start: Date | string;
  patient_name: string;
  phone: string;
  email: string | null;
  note: string | null;
  status: BookingRequestStatus;
};

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapBookingRequest(row: BookingRequestRow): BookingRequest {
  return {
    id: row.id,
    createdAt: toIso(row.created_at),
    branchId: row.branch_id,
    branchName: row.branch_name,
    serviceId: row.service_id,
    serviceName: row.service_name,
    providerPreference: row.provider_preference,
    slotStart: toIso(row.slot_start),
    patientName: row.patient_name,
    phone: row.phone,
    email: row.email,
    note: row.note,
    status: row.status,
  };
}

export async function listBookingRequestsFromDatabase() {
  const sql = getRequiredSql();
  const rows = await sql<BookingRequestRow[]>`
    SELECT
      id,
      created_at,
      branch_id,
      branch_name,
      service_id,
      service_name,
      provider_preference,
      slot_start,
      patient_name,
      phone,
      email,
      note,
      status
    FROM booking_requests
    ORDER BY created_at DESC
  `;

  return rows.map(mapBookingRequest);
}

export async function addBookingRequestToDatabase(entry: BookingRequestInput) {
  const sql = getRequiredSql();
  const rows = await sql<BookingRequestRow[]>`
    INSERT INTO booking_requests (
      id,
      branch_id,
      branch_name,
      service_id,
      service_name,
      provider_preference,
      slot_start,
      patient_name,
      phone,
      email,
      note
    ) VALUES (
      ${`req-${randomUUID()}`},
      ${entry.branchId},
      ${entry.branchName},
      ${entry.serviceId},
      ${entry.serviceName},
      ${entry.providerPreference},
      ${new Date(entry.slotStart)},
      ${entry.patientName},
      ${entry.phone},
      ${entry.email},
      ${entry.note}
    )
    RETURNING
      id,
      created_at,
      branch_id,
      branch_name,
      service_id,
      service_name,
      provider_preference,
      slot_start,
      patient_name,
      phone,
      email,
      note,
      status
  `;

  return mapBookingRequest(rows[0]!);
}

export async function updateBookingRequestStatusInDatabase(
  id: string,
  status: BookingRequestStatus,
) {
  const sql = getRequiredSql();
  const rows = await sql<BookingRequestRow[]>`
    UPDATE booking_requests
    SET status = ${status}
    WHERE id = ${id}
    RETURNING
      id,
      created_at,
      branch_id,
      branch_name,
      service_id,
      service_name,
      provider_preference,
      slot_start,
      patient_name,
      phone,
      email,
      note,
      status
  `;

  return rows[0] ? mapBookingRequest(rows[0]) : null;
}
