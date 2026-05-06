"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import {
  type PipelineLead,
  type PipelineStage,
  PIPELINE_STAGES,
} from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

function leadSearchText(l: PipelineLead) {
  return [l.name, l.phoneLast4, l.stage, String(l.valueThb), l.source, l.lastContact, l.note].join(" ");
}

export function PipelineDashboard() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    phoneLast4: "",
    source: "เว็บจอง",
    valueThb: "0",
    note: "",
    stage: "สอบถาม" as PipelineStage,
  });

  async function load() {
    setLoadError(null);
    try {
      const res = await fetch("/api/staff/pipeline", { cache: "no-store" });
      const data = (await res.json()) as { items?: PipelineLead[] };
      if (!res.ok) throw new Error("fail");
      setLeads(data.items ?? []);
    } catch {
      setLoadError("โหลดลีดไม่สำเร็จ");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const baseFiltered = useMemo(() => {
    if (stageFilter === "all") return leads;
    return leads.filter((l) => l.stage === stageFilter);
  }, [leads, stageFilter]);

  const filtered = useMemo(
    () => filterAndSortBySearch(baseFiltered, q, leadSearchText),
    [baseFiltered, q],
  );

  async function moveStage(id: string, stage: PipelineStage) {
    try {
      const res = await fetch(`/api/staff/pipeline/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      const data = (await res.json()) as { item?: PipelineLead };
      if (!res.ok || !data.item) throw new Error("fail");
      setLeads((prev) => prev.map((lead) => (lead.id === id ? data.item! : lead)));
    } catch {
      setLoadError("อัปเดตขั้นตอนไม่สำเร็จ");
    }
  }

  async function createLead() {
    if (!draft.name.trim() || draft.phoneLast4.replace(/\D/g, "").length < 4) {
      setLoadError("กรอกชื่อลีดและเบอร์ 4 หลักท้ายก่อนเพิ่ม");
      return;
    }

    try {
      const res = await fetch("/api/staff/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, valueThb: Number(draft.valueThb) }),
      });
      const data = (await res.json()) as { item?: PipelineLead };
      if (!res.ok || !data.item) throw new Error("fail");
      setLeads((prev) => [data.item!, ...prev]);
      setDraft({ name: "", phoneLast4: "", source: "เว็บจอง", valueThb: "0", note: "", stage: "สอบถาม" });
    } catch {
      setLoadError("เพิ่มลีดไม่สำเร็จ");
    }
  }

  async function deleteLead(id: string) {
    try {
      const res = await fetch(`/api/staff/pipeline/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("fail");
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch {
      setLoadError("ลบลีดไม่สำเร็จ");
    }
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
          ย้ายขั้นตอนการขายผ่าน demo backend · ค้นหาชื่อ แหล่งที่มา หมายเหตุ หรือยอดเงิน
        </p>
      </header>

      {loadError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      )}

      <section className="grid gap-3 rounded-2xl border border-staff-line bg-staff-surface p-4 shadow-sm lg:grid-cols-[1.2fr_0.8fr_0.9fr_0.8fr_1.4fr_auto]">
        <input
          value={draft.name}
          onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="ชื่อลีด"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <input
          value={draft.phoneLast4}
          onChange={(e) => setDraft((prev) => ({ ...prev, phoneLast4: e.target.value }))}
          placeholder="เบอร์ 4 หลักท้าย"
          inputMode="numeric"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <input
          value={draft.source}
          onChange={(e) => setDraft((prev) => ({ ...prev, source: e.target.value }))}
          placeholder="แหล่งที่มา"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <input
          value={draft.valueThb}
          onChange={(e) => setDraft((prev) => ({ ...prev, valueThb: e.target.value }))}
          placeholder="มูลค่า"
          inputMode="numeric"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <input
          value={draft.note}
          onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))}
          placeholder="หมายเหตุ"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <button type="button" onClick={() => void createLead()} className="rounded-xl bg-staff-accent px-4 py-2 text-sm font-semibold text-white">
          เพิ่มลีด
        </button>
      </section>

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
                <th className="px-4 py-3">ลบ</th>
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
                      onChange={(e) => void moveStage(l.id, e.target.value as PipelineStage)}
                      className="w-full min-w-[8rem] rounded-lg border border-staff-line bg-canvas px-2 py-1.5 text-xs text-staff-ink"
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void deleteLead(l.id)}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                      aria-label={`ลบ ${l.name}`}
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
    </div>
  );
}
