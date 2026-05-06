import { addDays, toYmdLocal } from "./dashboard-demo-data";
import { getRequiredSql } from "./database";
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
import {
  STAFF_CAPABILITIES,
  type StaffCapabilityId,
  type StaffPermissionMatrix,
} from "./staff-permissions";

type ModuleName =
  | "audit"
  | "clinical"
  | "inventory"
  | "marketing"
  | "permissions"
  | "pipeline"
  | "schedule"
  | "users";

type StaffRecordRow<T> = {
  id: string;
  data: T;
};

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
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

function defaultPermissionRow(user: StaffUser): StaffPermissionMatrix[string] {
  return {
    book: user.role === "หน้าร้าน" || user.role === "Admin",
    cal: user.role === "หน้าร้าน" || user.role === "Admin",
    lead: user.role === "การตลาด" || user.role === "Admin",
    clinical: user.role === "Admin",
    admin: user.role === "Admin",
  };
}

async function insertRecord<T>(module: ModuleName, id: string, data: T) {
  const sql = getRequiredSql();
  await sql`
    INSERT INTO staff_demo_records (module, id, data)
    VALUES (${module}, ${id}, ${sql.json(data as Parameters<typeof sql.json>[0])})
    ON CONFLICT (module, id) DO NOTHING
  `;
}

async function upsertRecord<T>(module: ModuleName, id: string, data: T) {
  const sql = getRequiredSql();
  await sql`
    INSERT INTO staff_demo_records (module, id, data)
    VALUES (${module}, ${id}, ${sql.json(data as Parameters<typeof sql.json>[0])})
    ON CONFLICT (module, id) DO UPDATE
    SET data = excluded.data, updated_at = now()
  `;
}

async function listRecords<T>(module: ModuleName) {
  await ensureStaffSeeded();
  const sql = getRequiredSql();
  const rows = await sql<StaffRecordRow<T>[]>`
    SELECT id, data
    FROM staff_demo_records
    WHERE module = ${module}
    ORDER BY created_at DESC, id DESC
  `;
  return rows.map((row) => row.data);
}

async function getRecord<T>(module: ModuleName, id: string) {
  await ensureStaffSeeded();
  const sql = getRequiredSql();
  const rows = await sql<StaffRecordRow<T>[]>`
    SELECT id, data
    FROM staff_demo_records
    WHERE module = ${module} AND id = ${id}
    LIMIT 1
  `;
  return rows[0]?.data ?? null;
}

async function deleteRecord(module: ModuleName, id: string) {
  await ensureStaffSeeded();
  const sql = getRequiredSql();
  const rows = await sql<{ id: string }[]>`
    DELETE FROM staff_demo_records
    WHERE module = ${module} AND id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}

let seedPromise: Promise<void> | null = null;

async function ensureStaffSeeded() {
  if (!seedPromise) {
    seedPromise = seedStaffRecords();
  }
  return seedPromise;
}

async function seedStaffRecords() {
  const sql = getRequiredSql();
  const existing = await sql<{ count: string }[]>`
    SELECT count(*)::text AS count
    FROM staff_demo_records
  `;

  if (Number(existing[0]?.count ?? 0) > 0) return;

  for (const item of inventorySeed) await insertRecord("inventory", item.id, item);
  for (const item of pipelineSeed) await insertRecord("pipeline", item.id, item);
  for (const item of marketingSeed) await insertRecord("marketing", item.id, item);
  for (const item of hydrateInitialSchedule()) await insertRecord("schedule", item.id, item);
  for (const item of clinicalSeed) await insertRecord("clinical", item.id, { ...item, note: "" });
  for (const item of staffUsersSeed) {
    await insertRecord("users", item.id, item);
    const row = defaultPermissionRow(item);
    for (const capability of STAFF_CAPABILITIES) {
      await insertRecord("permissions", `${item.id}:${capability.id}`, {
        userId: item.id,
        capability: capability.id,
        enabled: row[capability.id],
      });
    }
  }
  for (const item of auditSeed) await insertRecord("audit", item.id, item);
}

async function addAuditToDatabase(entry: Omit<AuditEntry, "id" | "at">) {
  const row: AuditEntry = {
    ...entry,
    id: newId("aud"),
    at: new Date().toISOString(),
  };
  await insertRecord("audit", row.id, row);
  return row;
}

export async function listInventoryItemsFromDatabase() {
  return listRecords<InventoryItem>("inventory");
}

export async function createInventoryItemInDatabase(input: Omit<InventoryItem, "id">) {
  await ensureStaffSeeded();
  const item: InventoryItem = { ...input, id: newId("inv") };
  await insertRecord("inventory", item.id, item);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่มวัสดุ",
    detail: `${item.sku}: ${item.nameTh}`,
  });
  return item;
}

export async function adjustInventoryQtyInDatabase(id: string, delta: number) {
  const item = await getRecord<InventoryItem>("inventory", id);
  if (!item) return null;
  const next = { ...item, qty: Math.max(0, item.qty + delta) };
  await upsertRecord("inventory", id, next);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "ปรับสต็อก",
    detail: `${next.sku}: ${item.qty} -> ${next.qty}`,
  });
  return next;
}

export async function deleteInventoryItemFromDatabase(id: string) {
  const item = await getRecord<InventoryItem>("inventory", id);
  const deleted = await deleteRecord("inventory", id);
  if (deleted) {
    await addAuditToDatabase({
      actor: "ระบบพนักงาน (สาธิต)",
      action: "ลบวัสดุ",
      detail: `${item?.sku ?? id}: ${item?.nameTh ?? ""}`,
    });
  }
  return deleted;
}

export async function listPipelineLeadsFromDatabase() {
  return listRecords<PipelineLead>("pipeline");
}

export async function createPipelineLeadInDatabase(input: Omit<PipelineLead, "id" | "lastContact">) {
  await ensureStaffSeeded();
  const lead: PipelineLead = {
    ...input,
    id: newId("lead"),
    lastContact: new Date().toISOString().slice(0, 10),
  };
  await insertRecord("pipeline", lead.id, lead);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่มลีด",
    detail: `${lead.name}: ${lead.stage}`,
  });
  return lead;
}

export async function updatePipelineStageInDatabase(id: string, stage: PipelineStage) {
  if (!PIPELINE_STAGES.includes(stage)) return null;
  const lead = await getRecord<PipelineLead>("pipeline", id);
  if (!lead) return null;
  const next = { ...lead, stage, lastContact: new Date().toISOString().slice(0, 10) };
  await upsertRecord("pipeline", id, next);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "อัปเดตลีด",
    detail: `${next.name}: ${lead.stage} -> ${stage}`,
  });
  return next;
}

export async function deletePipelineLeadFromDatabase(id: string) {
  const lead = await getRecord<PipelineLead>("pipeline", id);
  const deleted = await deleteRecord("pipeline", id);
  if (deleted) {
    await addAuditToDatabase({
      actor: "ระบบพนักงาน (สาธิต)",
      action: "ลบลีด",
      detail: `${lead?.name ?? id}`,
    });
  }
  return deleted;
}

export async function listMarketingCampaignsFromDatabase() {
  return listRecords<MarketingCampaign>("marketing");
}

export async function createMarketingCampaignInDatabase(input: Omit<MarketingCampaign, "id" | "updatedAt">) {
  await ensureStaffSeeded();
  const campaign: MarketingCampaign = {
    ...input,
    id: newId("mkt"),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  await insertRecord("marketing", campaign.id, campaign);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่มแคมเปญ",
    detail: `${campaign.name}: ${campaign.channel}`,
  });
  return campaign;
}

export async function updateMarketingStatusInDatabase(id: string, status: MarketingCampaign["status"]) {
  if (!["active", "paused", "draft"].includes(status)) return null;
  const campaign = await getRecord<MarketingCampaign>("marketing", id);
  if (!campaign) return null;
  const next = { ...campaign, status, updatedAt: new Date().toISOString().slice(0, 10) };
  await upsertRecord("marketing", id, next);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "อัปเดตแคมเปญ",
    detail: `${next.name}: ${campaign.status} -> ${status}`,
  });
  return next;
}

export async function deleteMarketingCampaignFromDatabase(id: string) {
  const campaign = await getRecord<MarketingCampaign>("marketing", id);
  const deleted = await deleteRecord("marketing", id);
  if (deleted) {
    await addAuditToDatabase({
      actor: "ระบบพนักงาน (สาธิต)",
      action: "ลบแคมเปญ",
      detail: `${campaign?.name ?? id}`,
    });
  }
  return deleted;
}

export async function listScheduleBlocksFromDatabase() {
  return listRecords<ScheduleBlock>("schedule");
}

export async function createScheduleBlockInDatabase(input: Omit<ScheduleBlock, "id">) {
  await ensureStaffSeeded();
  const block: ScheduleBlock = { ...input, id: newId("sch") };
  await insertRecord("schedule", block.id, block);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่มนัด",
    detail: `${block.dateYmd} ${block.startTime}: ${block.patientLabel}`,
  });
  return block;
}

export async function updateScheduleStatusInDatabase(id: string, status: string) {
  const block = await getRecord<ScheduleBlock>("schedule", id);
  if (!block) return null;
  const next = { ...block, status: status.slice(0, 60) };
  await upsertRecord("schedule", id, next);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "อัปเดตสถานะนัด",
    detail: `${next.patientLabel}: ${block.status} -> ${next.status}`,
  });
  return next;
}

export async function deleteScheduleBlockFromDatabase(id: string) {
  const block = await getRecord<ScheduleBlock>("schedule", id);
  const deleted = await deleteRecord("schedule", id);
  if (deleted) {
    await addAuditToDatabase({
      actor: "ระบบพนักงาน (สาธิต)",
      action: "ลบนัด",
      detail: `${block?.patientLabel ?? id}`,
    });
  }
  return deleted;
}

export async function listClinicalVisitsFromDatabase() {
  return listRecords<ClinicalVisit & { note: string }>("clinical");
}

export async function updateClinicalNoteInDatabase(id: string, note: string) {
  const visit = await getRecord<ClinicalVisit & { note: string }>("clinical", id);
  if (!visit) return null;
  const next = { ...visit, note: note.slice(0, 1000) };
  await upsertRecord("clinical", id, next);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "บันทึกโน้ตคลินิก",
    detail: `${visit.hn}: ${visit.patientLabel}`,
  });
  return next;
}

export async function createClinicalVisitInDatabase(
  input: Omit<ClinicalVisit, "id" | "consentFlags"> & { consentFlags?: string[]; note?: string },
) {
  await ensureStaffSeeded();
  const visit: ClinicalVisit & { note: string } = {
    ...input,
    id: newId("enc"),
    consentFlags: input.consentFlags ?? [],
    note: input.note ?? "",
  };
  await insertRecord("clinical", visit.id, visit);
  await addAuditToDatabase({
    actor: "ระบบพนักงาน (สาธิต)",
    action: "เพิ่ม visit",
    detail: `${visit.hn}: ${visit.patientLabel}`,
  });
  return visit;
}

export async function deleteClinicalVisitFromDatabase(id: string) {
  const visit = await getRecord<ClinicalVisit & { note: string }>("clinical", id);
  const deleted = await deleteRecord("clinical", id);
  if (deleted) {
    await addAuditToDatabase({
      actor: "ระบบพนักงาน (สาธิต)",
      action: "ลบ visit",
      detail: `${visit?.hn ?? id}`,
    });
  }
  return deleted;
}

export async function listStaffUsersFromDatabase() {
  return listRecords<StaffUser>("users");
}

export async function createStaffUserInDatabase(input: Omit<StaffUser, "id" | "lastActive">) {
  await ensureStaffSeeded();
  const user: StaffUser = {
    ...input,
    id: newId("u"),
    lastActive: new Date().toISOString().slice(0, 16).replace("T", " "),
  };
  await insertRecord("users", user.id, user);
  const row = defaultPermissionRow(user);
  for (const capability of STAFF_CAPABILITIES) {
    await insertRecord("permissions", `${user.id}:${capability.id}`, {
      userId: user.id,
      capability: capability.id,
      enabled: row[capability.id],
    });
  }
  await addAuditToDatabase({
    actor: "คุณบอส แอดมิน (จำลอง)",
    action: "เพิ่มผู้ใช้",
    detail: `${user.name}: ${user.role}`,
  });
  return user;
}

export async function deleteStaffUserFromDatabase(id: string) {
  const user = await getRecord<StaffUser>("users", id);
  const deleted = await deleteRecord("users", id);
  if (!deleted) return false;
  const sql = getRequiredSql();
  await sql`
    DELETE FROM staff_demo_records
    WHERE module = 'permissions' AND data->>'userId' = ${id}
  `;
  await addAuditToDatabase({
    actor: "คุณบอส แอดมิน (จำลอง)",
    action: "ลบผู้ใช้",
    detail: `${user?.name ?? id}`,
  });
  return true;
}

export async function getPermissionMatrixFromDatabase() {
  await ensureStaffSeeded();
  const rows = await listRecords<{ userId: string; capability: StaffCapabilityId; enabled: boolean }>(
    "permissions",
  );
  const matrix: StaffPermissionMatrix = {};
  for (const row of rows) {
    matrix[row.userId] = {
      ...(matrix[row.userId] ?? {
        book: false,
        cal: false,
        lead: false,
        clinical: false,
        admin: false,
      }),
      [row.capability]: row.enabled,
    };
  }
  return matrix;
}

export async function updatePermissionInDatabase(
  userId: string,
  capability: StaffCapabilityId,
  enabled: boolean,
) {
  await ensureStaffSeeded();
  const user = await getRecord<StaffUser>("users", userId);
  if (!user) return null;
  const id = `${userId}:${capability}`;
  await upsertRecord("permissions", id, { userId, capability, enabled });
  const matrix = await getPermissionMatrixFromDatabase();
  const label = STAFF_CAPABILITIES.find((item) => item.id === capability)?.label ?? capability;
  await addAuditToDatabase({
    actor: "คุณบอส แอดมิน (จำลอง)",
    action: "แก้ไขสิทธิ์",
    detail: `${user.name}: ${label} -> ${enabled ? "อนุญาต" : "ปิด"}`,
  });
  return matrix[userId] ?? null;
}

export async function listAuditEntriesFromDatabase() {
  return listRecords<AuditEntry>("audit");
}
