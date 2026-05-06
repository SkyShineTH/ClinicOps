"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { type AuditEntry, type StaffUser } from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

const CAPABILITIES = [
  { id: "book", label: "จอง/นัด" },
  { id: "cal", label: "ปฏิทิน" },
  { id: "lead", label: "ลีด" },
  { id: "clinical", label: "คลินิก Lite" },
  { id: "admin", label: "ตั้งค่า" },
] as const;

type CapId = (typeof CAPABILITIES)[number]["id"];
type PermMatrix = Record<string, Record<CapId, boolean>>;

function userSearchText(u: StaffUser) {
  return [u.name, u.email, u.role, u.branch, u.lastActive].join(" ");
}

function auditSearchText(a: AuditEntry) {
  return [a.at, a.actor, a.action, a.detail].join(" ");
}

export function AdminDashboard() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [matrix, setMatrix] = useState<PermMatrix>({});
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [qUsers, setQUsers] = useState("");
  const [qAudit, setQAudit] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    role: "หน้าร้าน",
    branch: "สยาม",
  });

  async function load() {
    setLoadError(null);
    try {
      const [usersRes, permissionsRes, auditRes] = await Promise.all([
        fetch("/api/staff/users", { cache: "no-store" }),
        fetch("/api/staff/permissions", { cache: "no-store" }),
        fetch("/api/staff/audit", { cache: "no-store" }),
      ]);
      const usersData = (await usersRes.json()) as { items?: StaffUser[] };
      const permissionsData = (await permissionsRes.json()) as { matrix?: PermMatrix };
      const auditData = (await auditRes.json()) as { items?: AuditEntry[] };

      if (!usersRes.ok || !permissionsRes.ok || !auditRes.ok) throw new Error("fail");
      setUsers(usersData.items ?? []);
      setMatrix(permissionsData.matrix ?? {});
      setAudit(auditData.items ?? []);
    } catch {
      setLoadError("โหลดข้อมูลแอดมินไม่สำเร็จ");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const usersFiltered = useMemo(
    () => filterAndSortBySearch(users, qUsers, userSearchText),
    [qUsers, users],
  );

  const auditFiltered = useMemo(() => filterAndSortBySearch(audit, qAudit, auditSearchText), [audit, qAudit]);

  async function togglePerm(userId: string, cap: CapId) {
    const prev = matrix;
    const row = prev[userId];
    if (!row) return;
    const nextVal = !row[cap];
    const nextMatrix: PermMatrix = {
      ...prev,
      [userId]: { ...row, [cap]: nextVal },
    };
    setMatrix(nextMatrix);

    try {
      const res = await fetch(`/api/staff/permissions/${userId}/${cap}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextVal }),
      });
      if (!res.ok) throw new Error("fail");

      const auditRes = await fetch("/api/staff/audit", { cache: "no-store" });
      const auditData = (await auditRes.json()) as { items?: AuditEntry[] };
      if (auditRes.ok) setAudit(auditData.items ?? []);
    } catch {
      setLoadError("อัปเดตสิทธิ์ไม่สำเร็จ");
      setMatrix(prev);
    }
  }

  async function createUser() {
    if (!draft.name.trim() || !draft.email.trim()) {
      setLoadError("กรอกชื่อและอีเมลก่อนเพิ่มผู้ใช้");
      return;
    }

    try {
      const res = await fetch("/api/staff/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("fail");
      setDraft({ name: "", email: "", role: "หน้าร้าน", branch: "สยาม" });
      await load();
    } catch {
      setLoadError("เพิ่มผู้ใช้ไม่สำเร็จ");
    }
  }

  async function deleteUser(id: string) {
    try {
      const res = await fetch(`/api/staff/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("fail");
      await load();
    } catch {
      setLoadError("ลบผู้ใช้ไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-xl font-semibold text-staff-ink">ตั้งค่าและสิทธิ์</h1>
        <p className="mt-1 text-sm text-staff-muted">
          จัดการสิทธิ์ผู้ใช้จำลองผ่าน demo backend · ค้นหาผู้ใช้และบันทึกกิจกรรม
        </p>
      </header>

      {loadError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      )}

      <section className="grid gap-3 rounded-2xl border border-staff-line bg-staff-surface p-4 shadow-sm md:grid-cols-[1.1fr_1.4fr_0.8fr_0.8fr_auto]">
        <input value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="ชื่อพนักงาน" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.email} onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))} placeholder="email" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <select value={draft.role} onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value }))} className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm">
          <option value="หน้าร้าน">หน้าร้าน</option>
          <option value="การตลาด">การตลาด</option>
          <option value="Admin">Admin</option>
        </select>
        <input value={draft.branch} onChange={(e) => setDraft((prev) => ({ ...prev, branch: e.target.value }))} placeholder="สาขา" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <button type="button" onClick={() => void createUser()} className="rounded-xl bg-staff-accent px-4 py-2 text-sm font-semibold text-white">
          เพิ่มผู้ใช้
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-staff-ink">ผู้ใช้และสิทธิ์</h2>
        <StaffSearchField
          id="admin-users-search"
          value={qUsers}
          onChange={setQUsers}
          resultCount={usersFiltered.length}
          totalCount={users.length}
        />
        <div className="overflow-hidden rounded-2xl border border-staff-line bg-staff-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium text-staff-muted">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-3">ผู้ใช้</th>
                  {CAPABILITIES.map((c) => (
                    <th key={c.id} className="px-2 py-3 text-center">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-2 py-3 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-staff-line">
                {usersFiltered.map((u) => (
                  <tr key={u.id}>
                    <td className="sticky left-0 z-10 bg-staff-surface px-3 py-3">
                      <p className="font-medium text-staff-ink">{u.name}</p>
                      <p className="text-xs text-staff-faint">{u.email}</p>
                      <p className="text-xs text-staff-muted">
                        {u.role} · {u.branch}
                      </p>
                    </td>
                    {CAPABILITIES.map((c) => (
                      <td key={c.id} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={matrix[u.id]?.[c.id] ?? false}
                          onChange={() => void togglePerm(u.id, c.id)}
                          className="size-4 accent-staff-accent"
                          aria-label={`${u.name} — ${c.label}`}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => void deleteUser(u.id)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                        aria-label={`ลบ ${u.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-staff-ink">บันทึกกิจกรรม (Audit)</h2>
        <StaffSearchField
          id="admin-audit-search"
          value={qAudit}
          onChange={setQAudit}
          resultCount={auditFiltered.length}
          totalCount={audit.length}
        />
        <ul className="space-y-2">
          {auditFiltered.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-staff-line bg-staff-surface px-4 py-3 text-sm shadow-sm"
            >
              <p className="text-xs text-staff-faint">
                {new Date(a.at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <p className="mt-1 font-medium text-staff-ink">
                {a.actor} — <span className="text-staff-accent">{a.action}</span>
              </p>
              <p className="mt-1 text-staff-muted">{a.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
