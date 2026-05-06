import {
  addBookingRequest as addBookingRequestToMemory,
  deleteBookingRequest as deleteBookingRequestFromMemory,
  getBookingRequest as getBookingRequestFromMemory,
  listBookingRequests as listBookingRequestsFromMemory,
  updateBookingRequestStatus as updateBookingRequestStatusInMemory,
} from "./booking-server-store";
import {
  addBookingRequestToDatabase,
  deleteBookingRequestFromDatabase,
  getBookingRequestFromDatabase,
  listBookingRequestsFromDatabase,
  updateBookingRequestStatusInDatabase,
  type BookingRequestInput,
} from "./booking-database-store";
import { isDatabaseConfigured } from "./database";
import type { BookingRequest, BookingRequestStatus } from "./types";

export type { BookingRequestInput };

export type BookingRequestFilters = {
  branchId?: string | null;
  serviceId?: string | null;
  status?: BookingRequestStatus | null;
  start?: string | null;
  end?: string | null;
};

export function getBookingStorageMode() {
  return isDatabaseConfigured() ? "postgres" : "memory";
}

function ymdFromIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function applyFilters(items: BookingRequest[], filters: BookingRequestFilters = {}) {
  return items.filter((item) => {
    if (filters.branchId && item.branchId !== filters.branchId) return false;
    if (filters.serviceId && item.serviceId !== filters.serviceId) return false;
    if (filters.status && item.status !== filters.status) return false;

    const slotDate = ymdFromIso(item.slotStart);
    if (filters.start && slotDate < filters.start) return false;
    if (filters.end && slotDate > filters.end) return false;

    return true;
  });
}

export async function listBookingRequests(filters: BookingRequestFilters = {}) {
  const items = isDatabaseConfigured()
    ? await listBookingRequestsFromDatabase()
    : listBookingRequestsFromMemory();

  return applyFilters(items, filters);
}

export async function addBookingRequest(entry: BookingRequestInput) {
  if (isDatabaseConfigured()) {
    return addBookingRequestToDatabase(entry);
  }

  return addBookingRequestToMemory(entry);
}

export async function getBookingRequest(id: string) {
  if (isDatabaseConfigured()) {
    return getBookingRequestFromDatabase(id);
  }

  return getBookingRequestFromMemory(id);
}

export async function updateBookingRequestStatus(id: string, status: BookingRequestStatus) {
  if (isDatabaseConfigured()) {
    return updateBookingRequestStatusInDatabase(id, status);
  }

  return updateBookingRequestStatusInMemory(id, status);
}

export async function deleteBookingRequest(id: string) {
  if (isDatabaseConfigured()) {
    return deleteBookingRequestFromDatabase(id);
  }

  return deleteBookingRequestFromMemory(id);
}
