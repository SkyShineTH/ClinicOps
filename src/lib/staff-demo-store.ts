import { isDatabaseConfigured } from "./database";
import * as database from "./staff-database-store";
import * as memory from "./staff-memory-store";
import type {
  AuditEntry,
  ClinicalVisit,
  InventoryItem,
  MarketingCampaign,
  PipelineLead,
  PipelineStage,
  ScheduleBlock,
  StaffUser,
} from "./staff-seed-data";
import type { StaffCapabilityId, StaffPermissionMatrix } from "./staff-permissions";
export {
  STAFF_CAPABILITIES,
  type StaffCapabilityId,
  type StaffPermissionMatrix,
} from "./staff-permissions";

function shouldUseDatabase() {
  return isDatabaseConfigured();
}

async function fromStaffStore<T>(databaseRead: () => Promise<T>, memoryRead: () => T | Promise<T>) {
  if (!shouldUseDatabase()) return memoryRead();

  try {
    return await databaseRead();
  } catch (error) {
    console.error("Staff database store unavailable; using memory fallback", error);
    return memoryRead();
  }
}

export function getStaffStorageMode() {
  return shouldUseDatabase() ? "postgres" : "memory";
}

export async function listInventoryItems() {
  return fromStaffStore(database.listInventoryItemsFromDatabase, memory.listInventoryItemsFromMemory);
}

export async function createInventoryItem(input: Omit<InventoryItem, "id">) {
  return fromStaffStore(
    () => database.createInventoryItemInDatabase(input),
    () => memory.createInventoryItemInMemory(input),
  );
}

export async function adjustInventoryQty(id: string, delta: number) {
  return fromStaffStore(
    () => database.adjustInventoryQtyInDatabase(id, delta),
    () => memory.adjustInventoryQtyInMemory(id, delta),
  );
}

export async function deleteInventoryItem(id: string) {
  return fromStaffStore(
    () => database.deleteInventoryItemFromDatabase(id),
    () => memory.deleteInventoryItemFromMemory(id),
  );
}

export async function listPipelineLeads() {
  return fromStaffStore(database.listPipelineLeadsFromDatabase, memory.listPipelineLeadsFromMemory);
}

export async function createPipelineLead(input: Omit<PipelineLead, "id" | "lastContact">) {
  return fromStaffStore(
    () => database.createPipelineLeadInDatabase(input),
    () => memory.createPipelineLeadInMemory(input),
  );
}

export async function updatePipelineStage(id: string, stage: PipelineStage) {
  return fromStaffStore(
    () => database.updatePipelineStageInDatabase(id, stage),
    () => memory.updatePipelineStageInMemory(id, stage),
  );
}

export async function deletePipelineLead(id: string) {
  return fromStaffStore(
    () => database.deletePipelineLeadFromDatabase(id),
    () => memory.deletePipelineLeadFromMemory(id),
  );
}

export async function listMarketingCampaigns() {
  return fromStaffStore(database.listMarketingCampaignsFromDatabase, memory.listMarketingCampaignsFromMemory);
}

export async function createMarketingCampaign(input: Omit<MarketingCampaign, "id" | "updatedAt">) {
  return fromStaffStore(
    () => database.createMarketingCampaignInDatabase(input),
    () => memory.createMarketingCampaignInMemory(input),
  );
}

export async function updateMarketingStatus(id: string, status: MarketingCampaign["status"]) {
  return fromStaffStore(
    () => database.updateMarketingStatusInDatabase(id, status),
    () => memory.updateMarketingStatusInMemory(id, status),
  );
}

export async function deleteMarketingCampaign(id: string) {
  return fromStaffStore(
    () => database.deleteMarketingCampaignFromDatabase(id),
    () => memory.deleteMarketingCampaignFromMemory(id),
  );
}

export async function listScheduleBlocks(): Promise<ScheduleBlock[]> {
  return fromStaffStore(database.listScheduleBlocksFromDatabase, memory.listScheduleBlocksFromMemory);
}

export async function createScheduleBlock(input: Omit<ScheduleBlock, "id">) {
  return fromStaffStore(
    () => database.createScheduleBlockInDatabase(input),
    () => memory.createScheduleBlockInMemory(input),
  );
}

export async function updateScheduleStatus(id: string, status: string) {
  return fromStaffStore(
    () => database.updateScheduleStatusInDatabase(id, status),
    () => memory.updateScheduleStatusInMemory(id, status),
  );
}

export async function deleteScheduleBlock(id: string) {
  return fromStaffStore(
    () => database.deleteScheduleBlockFromDatabase(id),
    () => memory.deleteScheduleBlockFromMemory(id),
  );
}

export async function listClinicalVisits(): Promise<Array<ClinicalVisit & { note: string }>> {
  return fromStaffStore(database.listClinicalVisitsFromDatabase, memory.listClinicalVisitsFromMemory);
}

export async function updateClinicalNote(id: string, note: string) {
  return fromStaffStore(
    () => database.updateClinicalNoteInDatabase(id, note),
    () => memory.updateClinicalNoteInMemory(id, note),
  );
}

export async function createClinicalVisit(
  input: Omit<ClinicalVisit, "id" | "consentFlags"> & { consentFlags?: string[]; note?: string },
) {
  return fromStaffStore(
    () => database.createClinicalVisitInDatabase(input),
    () => memory.createClinicalVisitInMemory(input),
  );
}

export async function deleteClinicalVisit(id: string) {
  return fromStaffStore(
    () => database.deleteClinicalVisitFromDatabase(id),
    () => memory.deleteClinicalVisitFromMemory(id),
  );
}

export async function listStaffUsers(): Promise<StaffUser[]> {
  return fromStaffStore(database.listStaffUsersFromDatabase, memory.listStaffUsersFromMemory);
}

export async function createStaffUser(input: Omit<StaffUser, "id" | "lastActive">) {
  return fromStaffStore(
    () => database.createStaffUserInDatabase(input),
    () => memory.createStaffUserInMemory(input),
  );
}

export async function deleteStaffUser(id: string) {
  return fromStaffStore(
    () => database.deleteStaffUserFromDatabase(id),
    () => memory.deleteStaffUserFromMemory(id),
  );
}

export async function getPermissionMatrix(): Promise<StaffPermissionMatrix> {
  return fromStaffStore(database.getPermissionMatrixFromDatabase, memory.getPermissionMatrixFromMemory);
}

export async function updatePermission(
  userId: string,
  capability: StaffCapabilityId,
  enabled: boolean,
) {
  return fromStaffStore(
    () => database.updatePermissionInDatabase(userId, capability, enabled),
    () => memory.updatePermissionInMemory(userId, capability, enabled),
  );
}

export async function listAuditEntries(): Promise<AuditEntry[]> {
  return fromStaffStore(database.listAuditEntriesFromDatabase, memory.listAuditEntriesFromMemory);
}
