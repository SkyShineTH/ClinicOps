"use client";

import { useMemo, useState } from "react";
import { useLocalStorageJson } from "@/components/app/hooks/useLocalStorageJson";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { type ClinicalVisit, clinicalSeed } from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

const LS_NOTES_KEY = "clinic-demo-clinical-notes-v1";

function clinicalSearchText(v: ClinicalVisit) {
  return [v.hn, v.patientLabel, v.provider, v.branch, v.summary, ...v.consentFlags].join(" ");
}

export function ClinicalLiteDashboard() {
  const visits = clinicalSeed;
  const [notesById, setNotesById] = useLocalStorageJson<Record<string, string>>(LS_NOTES_KEY, {});
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => filterAndSortBySearch(visits, q, clinicalSearchText),
    [visits, q],
  );

  function setNote(id: string, text: string) {
    setNotesById((prev) => ({ ...prev, [id]: text }));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-teal/30 bg-sky-soft/40 px-4 py-3 text-sm text-staff-muted">
        <strong className="text-staff-ink">ขอบเขต:</strong> สาธิตเท่านั้น — ไม่ใช่ EMR เต็มรูปแบบ ไม่มีการวินิจฉัยหรือสั่งยา
      </div>

      <header>
        <h1 className="text-xl font-semibold text-staff-ink">บันทึกคลินิกแบบย่อ</h1>
        <p className="mt-1 text-sm text-staff-muted">
          ดูการมาเยือนล่าสุด · บันทึกหมายเหตุคลินิกชั่วคราว (เก็บในเบราว์เซอร์)
        </p>
      </header>

      <StaffSearchField
        id="clinical-search"
        value={q}
        onChange={setQ}
        resultCount={filtered.length}
        totalCount={visits.length}
      />

      <div className="space-y-4">
        {filtered.map((v) => (
          <article
            key={v.id}
            className="rounded-2xl border border-staff-line bg-staff-surface p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-semibold text-staff-ink">{v.patientLabel}</p>
                <p className="text-xs text-staff-muted">
                  {v.hn} · {v.branch} ·{" "}
                  {new Date(v.visitedAt).toLocaleString("th-TH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <p className="text-sm text-staff-muted">{v.provider}</p>
            </div>
            <p className="mt-3 text-sm text-staff-muted">{v.summary}</p>
            {v.consentFlags.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1">
                {v.consentFlags.map((f) => (
                  <li
                    key={f}
                    className="rounded-full bg-staff-accent-soft px-2 py-0.5 text-[11px] font-medium text-staff-accent"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            )}
            <label className="mt-4 block text-xs font-medium text-staff-muted">
              หมายเหตุคลินิก (ไม่ซิงก์เซิร์ฟเวอร์)
            </label>
            <textarea
              className="mt-1 w-full rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm text-staff-ink"
              rows={2}
              value={notesById[v.id] ?? ""}
              onChange={(e) => setNote(v.id, e.target.value)}
              placeholder="เช่น นัดติดตาม หรือสิ่งที่ต้องระวัง…"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
