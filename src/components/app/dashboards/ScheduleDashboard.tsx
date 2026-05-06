"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { toYmdLocal } from "@/lib/dashboard-demo-data";
import { type ScheduleBlock } from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

function scheduleSearchText(b: ScheduleBlock) {
  return [
    b.dateYmd,
    b.startTime,
    b.endTime,
    b.patientLabel,
    b.service,
    b.room,
    b.provider,
    b.branch,
    b.status,
  ].join(" ");
}

export function ScheduleDashboard() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [q, setQ] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    dateYmd: "",
    startTime: "10:00",
    endTime: "10:45",
    patientLabel: "",
    service: "",
    room: "ห้อง 1",
    provider: "ทพ. วิมล ใจดี",
    branch: "สยาม",
  });

  useEffect(() => {
    setDraft((prev) => (prev.dateYmd ? prev : { ...prev, dateYmd: toYmdLocal(new Date()) }));

    async function load() {
      setLoadError(null);
      try {
        const res = await fetch("/api/staff/schedule", { cache: "no-store" });
        const data = (await res.json()) as { items?: ScheduleBlock[] };
        if (!res.ok) throw new Error("fail");
        setBlocks(data.items ?? []);
      } catch {
        setLoadError("โหลดตารางนัดไม่สำเร็จ");
      }
    }

    void load();
  }, []);

  async function createBlock() {
    if (!draft.patientLabel.trim() || !draft.service.trim()) {
      setLoadError("กรอกผู้ป่วยและบริการก่อนเพิ่มนัด");
      return;
    }

    try {
      const res = await fetch("/api/staff/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, status: "รอเข้าพบ" }),
      });
      const data = (await res.json()) as { item?: ScheduleBlock };
      if (!res.ok || !data.item) throw new Error("fail");
      setBlocks((prev) => [data.item!, ...prev]);
      setDraft((prev) => ({ ...prev, patientLabel: "", service: "" }));
    } catch {
      setLoadError("เพิ่มนัดไม่สำเร็จ");
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/staff/schedule/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { item?: ScheduleBlock };
      if (!res.ok || !data.item) throw new Error("fail");
      setBlocks((prev) => prev.map((block) => (block.id === id ? data.item! : block)));
    } catch {
      setLoadError("อัปเดตสถานะนัดไม่สำเร็จ");
    }
  }

  async function deleteBlock(id: string) {
    try {
      const res = await fetch(`/api/staff/schedule/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("fail");
      setBlocks((prev) => prev.filter((block) => block.id !== id));
    } catch {
      setLoadError("ลบนัดไม่สำเร็จ");
    }
  }

  const days = useMemo(() => {
    const s = new Set(blocks.map((b) => b.dateYmd));
    return ["all", ...Array.from(s).sort()];
  }, [blocks]);

  const baseFiltered = useMemo(() => {
    if (dayFilter === "all") return blocks;
    return blocks.filter((b) => b.dateYmd === dayFilter);
  }, [blocks, dayFilter]);

  const filtered = useMemo(
    () => filterAndSortBySearch(baseFiltered, q, scheduleSearchText),
    [baseFiltered, q],
  );

  const grouped = useMemo(() => {
    const m = new Map<string, ScheduleBlock[]>();
    for (const b of filtered) {
      const list = m.get(b.dateYmd) ?? [];
      list.push(b);
      m.set(b.dateYmd, list);
    }
    for (const list of m.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-staff-ink">ตารางนัดและเก้าอี้</h1>
        <p className="mt-1 text-sm text-staff-muted">
          มุมมองตามวันที่จาก demo backend · ค้นหาผู้ป่วย แพทย์ ห้อง หรือบริการ
        </p>
      </header>

      {loadError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      )}

      <section className="grid gap-3 rounded-2xl border border-staff-line bg-staff-surface p-4 shadow-sm lg:grid-cols-[0.8fr_0.6fr_0.6fr_1.2fr_1.1fr_0.8fr_1fr_0.8fr_auto]">
        <input type="date" value={draft.dateYmd} onChange={(e) => setDraft((prev) => ({ ...prev, dateYmd: e.target.value }))} className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.startTime} onChange={(e) => setDraft((prev) => ({ ...prev, startTime: e.target.value }))} className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.endTime} onChange={(e) => setDraft((prev) => ({ ...prev, endTime: e.target.value }))} className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.patientLabel} onChange={(e) => setDraft((prev) => ({ ...prev, patientLabel: e.target.value }))} placeholder="ผู้ป่วย" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.service} onChange={(e) => setDraft((prev) => ({ ...prev, service: e.target.value }))} placeholder="บริการ" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.room} onChange={(e) => setDraft((prev) => ({ ...prev, room: e.target.value }))} placeholder="ห้อง" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.provider} onChange={(e) => setDraft((prev) => ({ ...prev, provider: e.target.value }))} placeholder="แพทย์" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.branch} onChange={(e) => setDraft((prev) => ({ ...prev, branch: e.target.value }))} placeholder="สาขา" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <button type="button" onClick={() => void createBlock()} className="rounded-xl bg-staff-accent px-4 py-2 text-sm font-semibold text-white">
          เพิ่มนัด
        </button>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <StaffSearchField
            id="sched-search"
            value={q}
            onChange={setQ}
            resultCount={filtered.length}
            totalCount={baseFiltered.length}
          />
        </div>
        <div className="shrink-0 lg:w-56">
          <label htmlFor="sched-day" className="text-xs font-medium text-staff-muted">
            วันที่
          </label>
          <select
            id="sched-day"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="mt-1 w-full rounded-xl border border-staff-line bg-staff-surface px-3 py-2.5 text-sm text-staff-ink"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d === "all" ? "ทุกวัน" : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {grouped.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-staff-line bg-staff-surface px-6 py-10 text-center text-sm text-staff-muted">
            ไม่มีนัดที่ตรงกับการค้นหา
          </p>
        ) : (
          grouped.map(([ymd, list]) => (
            <section key={ymd} className="rounded-2xl border border-staff-line bg-staff-surface shadow-sm">
              <div className="border-b border-staff-line bg-slate-50 px-4 py-3">
                <h2 className="text-sm font-semibold text-staff-ink">
                  {new Date(ymd + "T12:00:00").toLocaleDateString("th-TH", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <p className="text-xs text-staff-muted">{list.length} ช่องเวลา</p>
              </div>
              <ul className="divide-y divide-staff-line">
                {list.map((b) => (
                  <li key={b.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold text-staff-ink">
                        {b.startTime} – {b.endTime}
                      </p>
                      <p className="text-sm text-staff-ink">{b.patientLabel}</p>
                      <p className="text-xs text-staff-muted">
                        {b.service} · {b.room} · {b.provider}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-staff-accent-soft px-2 py-0.5 text-xs font-medium text-staff-accent">
                        {b.branch}
                      </span>
                      <select
                        value={b.status}
                        onChange={(e) => void updateStatus(b.id, e.target.value)}
                        className="rounded-full border border-staff-line bg-slate-100 px-2 py-0.5 text-xs text-staff-muted"
                      >
                        {["รอเข้าพบ", "เช็คอินแล้ว", "กำลังรักษา", "เสร็จสิ้น", "ไม่มาตามนัด", "ยกเลิก"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => void deleteBlock(b.id)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                        aria-label={`ลบ ${b.patientLabel}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
