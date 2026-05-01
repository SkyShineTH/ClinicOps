"use client";

import { Filter, RotateCcw } from "lucide-react";
import { branches, services } from "@/lib/mock-data";
import type { DateRangePreset } from "./dashboard-filters-context";
import { useDashboardFilters } from "./dashboard-filters-context";

const datePresetLabels: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "วันนี้" },
  { value: "7d", label: "7 วันล่าสุด" },
  { value: "30d", label: "30 วันล่าสุด" },
  { value: "custom", label: "กำหนดเอง" },
];

const selectClass =
  "w-full rounded-xl border border-staff-line bg-staff-surface px-3 py-2.5 text-sm text-staff-ink shadow-sm transition focus:border-staff-accent focus:outline-none focus:ring-2 focus:ring-staff-accent/20";

const labelClass = "mb-1.5 block text-xs font-medium text-staff-muted";

export function DashboardFilterBar() {
  const {
    filters,
    setDatePreset,
    setCustomFrom,
    setCustomTo,
    setRegion,
    setCategory,
    resetFilters,
  } = useDashboardFilters();

  return (
    <div className="rounded-2xl border border-staff-line bg-staff-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 text-staff-ink">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-staff-accent-soft text-staff-accent">
            <Filter className="size-[18px]" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold">ตัวกรองทั้งแดชบอร์ด</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-staff-muted">
              ช่วงวันที่ · สาขา · หมวดบริการ — อัปเดต KPI กราฟ และตารางทันที
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-staff-line px-3 py-2 text-xs font-medium text-staff-muted transition hover:border-staff-accent/30 hover:text-staff-accent"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          รีเซ็ต
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <div>
            <label htmlFor="dash-date-preset" className={labelClass}>
              ช่วงวันที่
            </label>
            <select
              id="dash-date-preset"
              value={filters.datePreset}
              onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
              className={selectClass}
            >
              {datePresetLabels.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {filters.datePreset === "custom" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dash-from" className={labelClass}>
                  ตั้งแต่
                </label>
                <input
                  id="dash-from"
                  type="date"
                  value={filters.customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className={selectClass}
                />
              </div>
              <div>
                <label htmlFor="dash-to" className={labelClass}>
                  ถึง
                </label>
                <input
                  id="dash-to"
                  type="date"
                  value={filters.customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className={selectClass}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="dash-region" className={labelClass}>
            สาขา / ภูมิภาค
          </label>
          <select
            id="dash-region"
            value={filters.region}
            onChange={(e) => setRegion(e.target.value)}
            className={selectClass}
          >
            <option value="all">ทุกสาขา</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameTh}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dash-category" className={labelClass}>
            หมวดบริการ
          </label>
          <select
            id="dash-category"
            value={filters.category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            <option value="all">ทุกหมวด</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameTh}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
