import type { BookingRequest } from "./types";

const seed: BookingRequest[] = [
  {
    id: "req-seed-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    branchId: "siam",
    branchName: "สยาม",
    serviceId: "veneers",
    serviceName: "วีเนียร์",
    providerPreference: null,
    slotStart: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    patientName: "คุณสมหญิง (ตัวอย่าง)",
    phone: "0812345678",
    email: null,
    note: "สอบถามเวลาเย็น",
    status: "pending",
  },
  {
    id: "req-seed-2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    branchId: "thonglor",
    branchName: "ทองหล่อ",
    serviceId: "ortho",
    serviceName: "จัดฟัน",
    providerPreference: null,
    slotStart: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    patientName: "คุณนนท์ (ตัวอย่าง)",
    phone: "0890001122",
    email: null,
    note: null,
    status: "confirmed",
  },
  {
    id: "req-seed-3",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    branchId: "ari",
    branchName: "อารีย์",
    serviceId: "implants",
    serviceName: "รากเทียม",
    providerPreference: null,
    slotStart: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    patientName: "คุณแนน (ตัวอย่าง)",
    phone: "0823344556",
    email: null,
    note: "ขอคิวเช้า",
    status: "pending",
  },
];

declare global {
  var __clinicDemoBookingStore: BookingRequest[] | undefined;
}

function getStore(): BookingRequest[] {
  if (!globalThis.__clinicDemoBookingStore) {
    globalThis.__clinicDemoBookingStore = [...seed];
  }
  return globalThis.__clinicDemoBookingStore;
}

export function listBookingRequests(): BookingRequest[] {
  return [...getStore()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getBookingRequest(id: string): BookingRequest | null {
  return getStore().find((r) => r.id === id) ?? null;
}

export function addBookingRequest(entry: Omit<BookingRequest, "id" | "createdAt" | "status">) {
  const row: BookingRequest = {
    ...entry,
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  getStore().unshift(row);
  return row;
}

export function updateBookingRequestStatus(
  id: string,
  status: BookingRequest["status"],
): BookingRequest | null {
  const store = getStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  store[idx] = { ...store[idx], status };
  return store[idx];
}

export function deleteBookingRequest(id: string): boolean {
  const store = getStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
