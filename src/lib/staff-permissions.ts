export const STAFF_CAPABILITIES = [
  { id: "book", label: "จอง/นัด" },
  { id: "cal", label: "ปฏิทิน" },
  { id: "lead", label: "ลีด" },
  { id: "clinical", label: "คลินิก Lite" },
  { id: "admin", label: "ตั้งค่า" },
] as const;

export type StaffCapabilityId = (typeof STAFF_CAPABILITIES)[number]["id"];
export type StaffPermissionMatrix = Record<string, Record<StaffCapabilityId, boolean>>;
