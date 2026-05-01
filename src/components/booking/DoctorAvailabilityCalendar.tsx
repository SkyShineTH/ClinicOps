"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { branches, providers } from "@/lib/mock-data";
import { isProviderAvailableOnDate } from "@/lib/provider-availability";

const weekdayLabelsTh = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DoctorAvailabilityCalendar() {
  const today = startOfDay(new Date());
  const [view, setView] = useState(() => ({
    y: today.getFullYear(),
    m: today.getMonth(),
  }));
  const [branchId, setBranchId] = useState(branches[0]!.id);
  const [providerId, setProviderId] = useState(providers[1]!.id);

  const { gridDays, firstWeekday } = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const last = new Date(view.y, view.m + 1, 0);
    return {
      gridDays: last.getDate(),
      firstWeekday: first.getDay(),
    };
  }, [view.y, view.m]);

  const monthTitle = useMemo(
    () =>
      new Date(view.y, view.m, 1).toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
      }),
    [view.y, view.m],
  );

  const providerLabel = providers.find((p) => p.id === providerId)?.labelTh ?? "";
  const branchLabel = branches.find((b) => b.id === branchId)?.nameTh ?? "";

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  return (
    <div className="clinical-panel rounded-[1.75rem] p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-ink">ปฏิทินวันเข้างาน (จำลอง)</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        วันที่สีเขียวคือวันที่ทันตแพทย์ท่านเลือกเข้าตรวจที่สาขานี้ — สอดคล้องกับช่วงเวลาในขั้นตอน &quot;วันเวลา&quot;
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="cal-branch" className="text-xs font-medium text-ink-muted">
            สาขา
          </label>
          <select
            id="cal-branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-line bg-white/78 px-3 py-2 text-sm text-ink transition focus:border-teal"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameTh}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cal-provider" className="text-xs font-medium text-ink-muted">
            ทันตแพทย์
          </label>
          <select
            id="cal-provider"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-line bg-white/78 px-3 py-2 text-sm text-ink transition focus:border-teal"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.labelTh}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex min-w-0 items-center justify-between gap-1 border-b border-line pb-3 sm:gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="marketing-pressable inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-line bg-white/70 text-ink-muted transition hover:border-teal/40 hover:text-teal sm:size-9"
          aria-label="เดือนก่อน"
        >
          <ChevronLeft className="size-4 sm:size-5" />
        </button>
        <p className="min-w-0 flex-1 text-balance break-words text-center text-xs font-semibold capitalize leading-snug text-ink sm:text-sm">
          {monthTitle}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="marketing-pressable inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-line bg-white/70 text-ink-muted transition hover:border-teal/40 hover:text-teal sm:size-9"
          aria-label="เดือนถัดไป"
        >
          <ChevronRight className="size-4 sm:size-5" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-ink-muted">
        {weekdayLabelsTh.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: gridDays }, (_, i) => {
          const dayNum = i + 1;
          const date = new Date(view.y, view.m, dayNum);
          const available = isProviderAvailableOnDate(providerId, branchId, date);
          const isToday = sameDay(date, today);
          const isPast = date < today && !isToday;

          return (
            <div
              key={dayNum}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium ${
                isPast
                  ? "text-ink-faint/50"
                  : available
                    ? "bg-teal/15 text-teal"
                    : "bg-white/58 text-ink-faint"
              } ${isToday ? "ring-2 ring-teal ring-offset-1 ring-offset-surface" : ""}`}
              title={
                isPast
                  ? "วันที่ผ่านมาแล้ว"
                  : available
                    ? `${providerLabel} — ${branchLabel} (มีตารางจอง)`
                    : "ไม่เข้างานที่สาขานี้"
              }
            >
              {dayNum}
            </div>
          );
        })}
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-[11px] text-ink-muted">
        <li className="flex items-center gap-2">
          <span className="size-3 rounded bg-teal/15 ring-1 ring-teal/30" />
          วันเข้างาน (มีช่วงนัดในวิซาร์ด)
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded bg-canvas ring-1 ring-line" />
          ไม่เข้างานที่สาขานี้
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded ring-2 ring-teal ring-offset-1 ring-offset-surface" />
          วันนี้
        </li>
      </ul>
    </div>
  );
}
