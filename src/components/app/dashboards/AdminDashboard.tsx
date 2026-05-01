"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorageJson } from "@/components/app/hooks/useLocalStorageJson";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { type AuditEntry, type StaffUser, auditSeed, staffUsersSeed } from "@/lib/staff-seed-data";
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

const LS_PERMS = "clinic-demo-admin-perms-v1";
const LS_AUDIT = "clinic-demo-admin-audit-v1";

function defaultMatrix(): PermMatrix {
  const m: PermMatrix = {};
  for (const u of staffUsersSeed) {
    m[u.id] = {
      book: u.role === "หน้าร้าน" || u.role === "Admin",
      cal: u.role === "หน้าร้าน" || u.role === "Admin",
      lead: u.role === "การตลาด" || u.role === "Admin",
      clinical: u.role === "Admin",
      admin: u.role === "Admin",
    };
  }
  return m;
}

function userSearchText(u: StaffUser) {
  return [u.name, u.email, u.role, u.branch, u.lastActive].join(" ");
}

function auditSearchText(a: AuditEntry) {
  return [a.at, a.actor, a.action, a.detail].join(" ");
}

export function AdminDashboard() {
  const [matrix, setMatrix] = useLocalStorageJson<PermMatrix>(LS_PERMS, defaultMatrix());
  const matrixRef = useRef(matrix);
  useEffect(() => {
    matrixRef.current = matrix;
  }, [matrix]);
  const [audit, setAudit] = useLocalStorageJson<AuditEntry[]>(LS_AUDIT, auditSeed);
  const [qUsers, setQUsers] = useState("");
  const [qAudit, setQAudit] = useState("");

  const usersFiltered = useMemo(
    () => filterAndSortBySearch(staffUsersSeed, qUsers, userSearchText),
    [qUsers],
  );

  const auditFiltered = useMemo(() => filterAndSortBySearch(audit, qAudit, auditSearchText), [audit, qAudit]);

  function togglePerm(userId: string, cap: CapId) {
    const prev = matrixRef.current;
    const row = prev[userId] ?? defaultMatrix()[userId]!;
    const nextVal = !row[cap];
    const nextMatrix: PermMatrix = {
      ...prev,
      [userId]: { ...row, [cap]: nextVal },
    };
    matrixRef.current = nextMatrix;
    setMatrix(nextMatrix);
    const u = staffUsersSeed.find((x) => x.id === userId);
    setAudit((a) => [
      {
        id: `aud-${Date.now()}`,
        at: new Date().toISOString(),
        actor: "คุณบอส แอดมิน (จำลอง)",
        action: "แก้ไขสิทธิ์",
        detail: `${u?.name ?? userId}: ${CAPABILITIES.find((c) => c.id === cap)?.label} → ${nextVal ? "อนุญาต" : "ปิด"}`,
      },
      ...a,
    ]);
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-xl font-semibold text-staff-ink">ตั้งค่าและสิทธิ์</h1>
        <p className="mt-1 text-sm text-staff-muted">
          จัดการสิทธิ์ผู้ใช้จำลอง · บันทึก audit ในเบราว์เซอร์ · ค้นหาผู้ใช้และบันทึกกิจกรรม
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-staff-ink">ผู้ใช้และสิทธิ์</h2>
        <StaffSearchField
          id="admin-users-search"
          value={qUsers}
          onChange={setQUsers}
          resultCount={usersFiltered.length}
          totalCount={staffUsersSeed.length}
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
                          onChange={() => togglePerm(u.id, c.id)}
                          className="size-4 accent-staff-accent"
                          aria-label={`${u.name} — ${c.label}`}
                        />
                      </td>
                    ))}
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
