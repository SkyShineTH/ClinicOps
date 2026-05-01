"use client";

import { useMemo, useState } from "react";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { addDays, toYmdLocal } from "@/lib/dashboard-demo-data";
import { type ScheduleBlock, scheduleSeedTemplate } from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function hydrateSchedule(): ScheduleBlock[] {
  const base = startOfLocalDay(new Date());
  return scheduleSeedTemplate.map(({ relativeDay, ...rest }) => ({
    ...rest,
    dateYmd: toYmdLocal(addDays(base, relativeDay)),
  }));
}

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
  const blocks = useMemo(() => hydrateSchedule(), []);
  const [q, setQ] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("all");

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
          มุมมองตามวันที่ (อิงวันที่เครื่อง) · ค้นหาผู้ป่วย แพทย์ ห้อง หรือบริการ
        </p>
      </header>

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
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-staff-muted">
                        {b.status}
                      </span>
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
