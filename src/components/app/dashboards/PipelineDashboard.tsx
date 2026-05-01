"use client";

import { useMemo, useState } from "react";
import { useLocalStorageJson } from "@/components/app/hooks/useLocalStorageJson";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import {
  type PipelineLead,
  type PipelineStage,
  PIPELINE_STAGES,
  pipelineSeed,
} from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

const LS_KEY = "clinic-demo-pipeline-v1";

function leadSearchText(l: PipelineLead) {
  return [l.name, l.phoneLast4, l.stage, String(l.valueThb), l.source, l.lastContact, l.note].join(" ");
}

export function PipelineDashboard() {
  const [leads, setLeads] = useLocalStorageJson<PipelineLead[]>(LS_KEY, pipelineSeed);
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const baseFiltered = useMemo(() => {
    if (stageFilter === "all") return leads;
    return leads.filter((l) => l.stage === stageFilter);
  }, [leads, stageFilter]);

  const filtered = useMemo(
    () => filterAndSortBySearch(baseFiltered, q, leadSearchText),
    [baseFiltered, q],
  );

  function moveStage(id: string, stage: PipelineStage) {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, stage, lastContact: new Date().toISOString().slice(0, 10) } : l,
      ),
    );
  }

  const byStage = useMemo(() => {
    const m = new Map<PipelineStage, number>();
    for (const s of PIPELINE_STAGES) m.set(s, 0);
    for (const l of leads) m.set(l.stage, (m.get(l.stage) ?? 0) + 1);
    return m;
  }, [leads]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-staff-ink">ลีดและผู้ประสานงาน</h1>
        <p className="mt-1 text-sm text-staff-muted">
          ย้ายขั้นตอนการขายได้ · ค้นหาชื่อ แหล่งที่มา หมายเหตุ หรือยอดเงิน
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PIPELINE_STAGES.map((s) => (
          <div key={s} className="rounded-2xl border border-staff-line bg-staff-surface px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-staff-muted">{s}</p>
            <p className="text-2xl font-semibold tabular-nums text-staff-ink">{byStage.get(s) ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <StaffSearchField
            id="pipe-search"
            value={q}
            onChange={setQ}
            resultCount={filtered.length}
            totalCount={baseFiltered.length}
          />
        </div>
        <div className="shrink-0 lg:w-52">
          <label htmlFor="pipe-stage" className="text-xs font-medium text-staff-muted">
            ขั้นตอน
          </label>
          <select
            id="pipe-stage"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="mt-1 w-full rounded-xl border border-staff-line bg-staff-surface px-3 py-2.5 text-sm text-staff-ink"
          >
            <option value="all">ทุกขั้น</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-staff-line bg-staff-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-staff-muted">
              <tr>
                <th className="px-4 py-3">ลีด</th>
                <th className="px-4 py-3">แหล่งที่มา</th>
                <th className="px-4 py-3">มูลค่า (บาท)</th>
                <th className="px-4 py-3">ติดต่อล่าสุด</th>
                <th className="px-4 py-3">ขั้นตอน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-staff-line">
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-staff-ink">{l.name}</p>
                    <p className="text-xs text-staff-faint">***{l.phoneLast4}</p>
                    <p className="mt-1 text-xs text-staff-muted">{l.note}</p>
                  </td>
                  <td className="px-4 py-3 text-staff-muted">{l.source}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {l.valueThb > 0 ? l.valueThb.toLocaleString("th-TH") : "—"}
                  </td>
                  <td className="px-4 py-3 text-staff-muted">{l.lastContact}</td>
                  <td className="px-4 py-3">
                    <select
                      value={l.stage}
                      onChange={(e) => moveStage(l.id, e.target.value as PipelineStage)}
                      className="w-full min-w-[8rem] rounded-lg border border-staff-line bg-canvas px-2 py-1.5 text-xs text-staff-ink"
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
