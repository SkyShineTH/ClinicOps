import {
  addBookingRequest as addBookingRequestToMemory,
  listBookingRequests as listBookingRequestsFromMemory,
  updateBookingRequestStatus as updateBookingRequestStatusInMemory,
} from "./booking-server-store";
import {
  addBookingRequestToDatabase,
  listBookingRequestsFromDatabase,
  updateBookingRequestStatusInDatabase,
  type BookingRequestInput,
} from "./booking-database-store";
import { isDatabaseConfigured } from "./database";
import type { BookingRequestStatus } from "./types";

export type { BookingRequestInput };

export function getBookingStorageMode() {
  return isDatabaseConfigured() ? "postgres" : "memory";
}

export async function listBookingRequests() {
  if (isDatabaseConfigured()) {
    return listBookingRequestsFromDatabase();
  }

  return listBookingRequestsFromMemory();
}

export async function addBookingRequest(entry: BookingRequestInput) {
  if (isDatabaseConfigured()) {
    return addBookingRequestToDatabase(entry);
  }

  return addBookingRequestToMemory(entry);
}

export async function updateBookingRequestStatus(id: string, status: BookingRequestStatus) {
  if (isDatabaseConfigured()) {
    return updateBookingRequestStatusInDatabase(id, status);
  }

  return updateBookingRequestStatusInMemory(id, status);
}
