import { addDays, toYmdLocal } from "./dashboard-demo-data";
import {
  auditSeed,
  clinicalSeed,
  inventorySeed,
  marketingSeed,
  PIPELINE_STAGES,
  pipelineSeed,
  scheduleSeedTemplate,
  staffUsersSeed,
  type AuditEntry,
  type ClinicalVisit,
  type InventoryItem,
  type MarketingCampaign,
  type PipelineLead,
  type PipelineStage,
  type ScheduleBlock,
  type StaffUser,
} from "./staff-seed-data";

const STAFF_CAPABILITIES = [
  { id: "book", label: "จอง/นัด" },
  { id: "cal", label: "ปฏิทิน" },
  { id: "lead", label: "ลีด" },
  { id: "clinical", label: "คลินิก Lite" },
  { id: "admin", label: "ตั้งค่า" },
] as const;

type StaffCapabilityId = (typeof STAFF_CAPABILITIES)[number]["id"];
type StaffPermissionMatrix = Record<string, Record<StaffCapabilityId, boolean>>;

type StaffStore = {
  audit: AuditEntry[];
  clinical: Array<ClinicalVisit & { note: string }>;
  inventory: InventoryItem[];
  marketing: MarketingCampaign[];
  permissions: StaffPermissionMatrix;
  pipeline: PipelineLead[];
  schedule: ScheduleBlock[];
  users: StaffUser[];
};

declare global {
  var __clinicDemoStaffStore: StaffStore | undefined;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function defaultPermissions(users = staffUsersSeed): StaffPermissionMatrix {
  const matrix: StaffPermissionMatrix = {};
  for (const user of users) {
    matrix[user.id] = {
      book: user.role === "หน้าร้าน" || user.role === "Admin",
      cal: user.role === "หน้าร้าน" || user.role === "Admin",
      lead: user.role === "การตลาด" || user.role === "Admin",
      clinical: user.role === "Admin",
      admin: user.role === "Admin",
    };
  }
  return matrix;
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function hydrateInitialSchedule(reference = new Date()): ScheduleBlock[] {
  const base = startOfLocalDay(reference);
  return scheduleSeedTemplate.map(({ relativeDay, ...rest }) => ({
    ...rest,
    dateYmd: toYmdLocal(addDays(base, relativeDay)),
  }));
}

function getStore(): StaffStore {
  if (!globalThis.__clinicDemoStaffStore) {
    const users = clone(staffUsersSeed);
    globalThis.__clinicDemoStaffStore = {
      audit: clone(auditSeed),
      clinical: clinicalSeed.map((visit) => ({ ...visit, note: "" })),
      inventory: clone(inventorySeed),
      marketing: clone(marketingSeed),
      permissions: defaultPermissions(users),
      pipeline: clone(pipelineSeed),
      schedule: hydrateInitialSchedule(),
      users,
    };
  }

  return globalThis.__clinicDemoStaffStore;
}

function addAudit(entry: Omit<AuditEntry, "id" | "at">) {
  const store = getStore();
  const row: AuditEntry = {
    ...entry,
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
  };
  store.audit.unshift(row);
  return row;
}

export function listInventoryItemsFromMemory() {
  return clone(getStore().inventory);
}

export function createInventoryItemInMemory(input: Omit<InventoryItem, "id">) {
  const store = getStore();
  const item: InventoryItem = {
    ...input,
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  store.inventory.unshift(item);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่มวัสดุ",
    detail: `${item.sku}: ${item.nameTh}`,
  });
  return clone(item);
}

export function adjustInventoryQtyInMemory(id: string, delta: number) {
  const store = getStore();
  const index = store.inventory.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const current = store.inventory[index]!;
  const next = { ...current, qty: Math.max(0, current.qty + delta) };
  store.inventory[index] = next;
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "ปรับสต็อก",
    detail: `${next.sku}: ${current.qty} -> ${next.qty}`,
  });
  return clone(next);
}

export function deleteInventoryItemFromMemory(id: string) {
  const store = getStore();
  const index = store.inventory.findIndex((item) => item.id === id);
  if (index === -1) return false;
  const [item] = store.inventory.splice(index, 1);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "ลบวัสดุ",
    detail: `${item?.sku ?? id}: ${item?.nameTh ?? ""}`,
  });
  return true;
}

export function listPipelineLeadsFromMemory() {
  return clone(getStore().pipeline);
}

export function createPipelineLeadInMemory(input: Omit<PipelineLead, "id" | "lastContact">) {
  const store = getStore();
  const lead: PipelineLead = {
    ...input,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    lastContact: new Date().toISOString().slice(0, 10),
  };
  store.pipeline.unshift(lead);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่มลีด",
    detail: `${lead.name}: ${lead.stage}`,
  });
  return clone(lead);
}

export function updatePipelineStageInMemory(id: string, stage: PipelineStage) {
  if (!PIPELINE_STAGES.includes(stage)) return null;
  const store = getStore();
  const index = store.pipeline.findIndex((lead) => lead.id === id);
  if (index === -1) return null;
  const current = store.pipeline[index]!;
  const next = { ...current, stage, lastContact: new Date().toISOString().slice(0, 10) };
  store.pipeline[index] = next;
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "อัปเดตลีด",
    detail: `${next.name}: ${current.stage} -> ${stage}`,
  });
  return clone(next);
}

export function deletePipelineLeadFromMemory(id: string) {
  const store = getStore();
  const index = store.pipeline.findIndex((lead) => lead.id === id);
  if (index === -1) return false;
  const [lead] = store.pipeline.splice(index, 1);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "ลบลีด",
    detail: `${lead?.name ?? id}`,
  });
  return true;
}

export function listMarketingCampaignsFromMemory() {
  return clone(getStore().marketing);
}

export function createMarketingCampaignInMemory(input: Omit<MarketingCampaign, "id" | "updatedAt">) {
  const store = getStore();
  const campaign: MarketingCampaign = {
    ...input,
    id: `mkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  store.marketing.unshift(campaign);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่มแคมเปญ",
    detail: `${campaign.name}: ${campaign.channel}`,
  });
  return clone(campaign);
}

export function updateMarketingStatusInMemory(id: string, status: MarketingCampaign["status"]) {
  if (!["active", "paused", "draft"].includes(status)) return null;
  const store = getStore();
  const index = store.marketing.findIndex((campaign) => campaign.id === id);
  if (index === -1) return null;
  const current = store.marketing[index]!;
  const next = { ...current, status, updatedAt: new Date().toISOString().slice(0, 10) };
  store.marketing[index] = next;
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "อัปเดตแคมเปญ",
    detail: `${next.name}: ${current.status} -> ${status}`,
  });
  return clone(next);
}

export function deleteMarketingCampaignFromMemory(id: string) {
  const store = getStore();
  const index = store.marketing.findIndex((campaign) => campaign.id === id);
  if (index === -1) return false;
  const [campaign] = store.marketing.splice(index, 1);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "ลบแคมเปญ",
    detail: `${campaign?.name ?? id}`,
  });
  return true;
}

export function listScheduleBlocksFromMemory(): ScheduleBlock[] {
  return clone(getStore().schedule);
}

export function createScheduleBlockInMemory(input: Omit<ScheduleBlock, "id">) {
  const store = getStore();
  const block: ScheduleBlock = {
    ...input,
    id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  store.schedule.unshift(block);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่มนัด",
    detail: `${block.dateYmd} ${block.startTime}: ${block.patientLabel}`,
  });
  return clone(block);
}

export function updateScheduleStatusInMemory(id: string, status: string) {
  const store = getStore();
  const index = store.schedule.findIndex((block) => block.id === id);
  if (index === -1) return null;
  const current = store.schedule[index]!;
  const next = { ...current, status: status.slice(0, 60) };
  store.schedule[index] = next;
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "อัปเดตสถานะนัด",
    detail: `${next.patientLabel}: ${current.status} -> ${next.status}`,
  });
  return clone(next);
}

export function deleteScheduleBlockFromMemory(id: string) {
  const store = getStore();
  const index = store.schedule.findIndex((block) => block.id === id);
  if (index === -1) return false;
  const [block] = store.schedule.splice(index, 1);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "ลบนัด",
    detail: `${block?.patientLabel ?? id}`,
  });
  return true;
}

export function listClinicalVisitsFromMemory() {
  return clone(getStore().clinical);
}

export function updateClinicalNoteInMemory(id: string, note: string) {
  const store = getStore();
  const index = store.clinical.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const visit = store.clinical[index]!;
  const next = { ...visit, note: note.slice(0, 1000) };
  store.clinical[index] = next;
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "บันทึกโน้ตคลินิก",
    detail: `${visit.hn}: ${visit.patientLabel}`,
  });
  return clone(next);
}

export function createClinicalVisitInMemory(
  input: Omit<ClinicalVisit, "id" | "consentFlags"> & { consentFlags?: string[]; note?: string },
) {
  const store = getStore();
  const visit: ClinicalVisit & { note: string } = {
    ...input,
    id: `enc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    consentFlags: input.consentFlags ?? [],
    note: input.note ?? "",
  };
  store.clinical.unshift(visit);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่ม visit",
    detail: `${visit.hn}: ${visit.patientLabel}`,
  });
  return clone(visit);
}

export function deleteClinicalVisitFromMemory(id: string) {
  const store = getStore();
  const index = store.clinical.findIndex((visit) => visit.id === id);
  if (index === -1) return false;
  const [visit] = store.clinical.splice(index, 1);
  addAudit({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "ลบ visit",
    detail: `${visit?.hn ?? id}`,
  });
  return true;
}

export function listStaffUsersFromMemory(): StaffUser[] {
  return clone(getStore().users);
}

export function createStaffUserInMemory(input: Omit<StaffUser, "id" | "lastActive">) {
  const store = getStore();
  const user: StaffUser = {
    ...input,
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    lastActive: new Date().toISOString().slice(0, 16).replace("T", " "),
  };
  store.users.unshift(user);
  store.permissions[user.id] = defaultPermissions([user])[user.id]!;
  addAudit({
    actor: "คุณบอส แอดมิน (จำลอง)",
    action: "เพิ่มผู้ใช้",
    detail: `${user.name}: ${user.role}`,
  });
  return clone(user);
}

export function deleteStaffUserFromMemory(id: string) {
  const store = getStore();
  const index = store.users.findIndex((user) => user.id === id);
  if (index === -1) return false;
  const [user] = store.users.splice(index, 1);
  delete store.permissions[id];
  addAudit({
    actor: "คุณบอส แอดมิน (จำลอง)",
    action: "ลบผู้ใช้",
    detail: `${user?.name ?? id}`,
  });
  return true;
}

export function getPermissionMatrixFromMemory() {
  return clone(getStore().permissions);
}

export function updatePermissionInMemory(userId: string, capability: StaffCapabilityId, enabled: boolean) {
  const user = getStore().users.find((item) => item.id === userId);
  if (!user) return null;
  const store = getStore();
  const row = store.permissions[userId] ?? defaultPermissions([user])[userId]!;
  store.permissions[userId] = { ...row, [capability]: enabled };
  const label = STAFF_CAPABILITIES.find((item) => item.id === capability)?.label ?? capability;
  addAudit({
    actor: "คุณบอส แอดมิน (จำลอง)",
    action: "แก้ไขสิทธิ์",
    detail: `${user.name}: ${label} -> ${enabled ? "อนุญาต" : "ปิด"}`,
  });
  return clone(store.permissions[userId]);
}

export function listAuditEntriesFromMemory() {
  return clone(getStore().audit);
}
