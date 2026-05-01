"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Appointment, AppointmentStatus, BookingRequest } from "@/lib/types";
import {
  eachYmdInRange,
  hydrateDemoAppointments,
  parseRequestSlotDate,
} from "@/lib/dashboard-demo-data";
import { branches } from "@/lib/mock-data";
import { DashboardFilterBar } from "./DashboardFilterBar";
import { useDashboardFilters, ymdInRange } from "./dashboard-filters-context";

const statusLabels: Record<BookingRequest["status"], string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  reschedule: "เสนอเวลาใหม่",
  rejected: "ปฏิเสธ",
};

const apptLabels: Record<Appointment["status"], string> = {
  scheduled: "รอเข้าพบ",
  checked_in: "เช็คอินแล้ว",
  in_progress: "กำลังรักษา",
  completed: "เสร็จสิ้น",
  no_show: "ไม่มาตามนัด",
  cancelled: "ยกเลิก",
};

const statusStripOrder: AppointmentStatus[] = [
  "scheduled",
  "checked_in",
  "in_progress",
  "completed",
  "no_show",
  "cancelled",
];

const stripColors: Partial<Record<AppointmentStatus, string>> = {
  scheduled: "bg-slate-300",
  checked_in: "bg-indigo-400",
  in_progress: "bg-indigo-600",
  completed: "bg-emerald-400",
  no_show: "bg-amber-400",
  cancelled: "bg-slate-200",
};

function branchName(id: string) {
  return branches.find((b) => b.id === id)?.nameTh ?? id;
}

export function ReceptionBoard() {
  const { filters, dateRange } = useDashboardFilters();
  const [baseAppointments] = useState<Appointment[]>(() => hydrateDemoAppointments(new Date()));

  const [requests, setRequests] = useState<BookingRequest[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/booking-requests", { cache: "no-store" });
      const data = (await res.json()) as { items?: BookingRequest[] };
      setRequests(data.items ?? []);
    } catch {
      setLoadError("โหลดข้อมูลไม่สำเร็จ ลองอีกครั้ง");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchStatus(id: string, status: BookingRequest["status"]) {
    setActionId(id);
    try {
      const res = await fetch("/api/booking-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("fail");
      await load();
    } catch {
      setLoadError("อัปเดตไม่สำเร็จ");
    } finally {
      setActionId(null);
    }
  }

  const filteredAppointments = useMemo(() => {
    return baseAppointments.filter((a) => {
      if (!ymdInRange(a.slotDate, dateRange.start, dateRange.end)) return false;
      if (filters.region !== "all" && a.branchId !== filters.region) return false;
      if (filters.category !== "all" && a.categoryId !== filters.category) return false;
      return true;
    });
  }, [baseAppointments, dateRange.end, dateRange.start, filters.category, filters.region]);

  const filteredRequests = useMemo(() => {
    if (!requests) return null;
    return requests.filter((r) => {
      const ymd = parseRequestSlotDate(r.slotStart);
      if (!ymdInRange(ymd, dateRange.start, dateRange.end)) return false;
      if (filters.region !== "all" && r.branchId !== filters.region) return false;
      if (filters.category !== "all" && r.serviceId !== filters.category) return false;
      return true;
    });
  }, [requests, dateRange.end, dateRange.start, filters.category, filters.region]);

  const kpis = useMemo(() => {
    return {
      scheduled: filteredAppointments.filter((a) => a.status === "scheduled").length,
      checked: filteredAppointments.filter((a) => a.status === "checked_in").length,
      noShow: filteredAppointments.filter((a) => a.status === "no_show").length,
      total: filteredAppointments.length,
    };
  }, [filteredAppointments]);

  const activityByDay = useMemo(() => {
    const days = eachYmdInRange(dateRange.start, dateRange.end);
    return days.map((day) => {
      const ap = filteredAppointments.filter((a) => a.slotDate === day).length;
      const rq = (filteredRequests ?? []).filter((r) => parseRequestSlotDate(r.slotStart) === day).length;
      return { day, total: ap + rq, ap, rq };
    });
  }, [dateRange.end, dateRange.start, filteredAppointments, filteredRequests]);

  const activityMax = useMemo(
    () => Math.max(1, ...activityByDay.map((d) => d.total)),
    [activityByDay],
  );

  const statusCounts = useMemo(() => {
    const m = new Map<AppointmentStatus, number>();
    for (const s of statusStripOrder) m.set(s, 0);
    for (const a of filteredAppointments) {
      m.set(a.status, (m.get(a.status) ?? 0) + 1);
    }
    return m;
  }, [filteredAppointments]);

  const statusTotal = filteredAppointments.length || 1;

  const statusSegments = useMemo(() => {
    return statusStripOrder
      .map((st) => ({
        st,
        n: statusCounts.get(st) ?? 0,
        pct: ((statusCounts.get(st) ?? 0) / statusTotal) * 100,
      }))
      .filter((s) => s.n > 0);
  }, [statusCounts, statusTotal]);

  const sortedTableRows = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      if (a.slotDate !== b.slotDate) return a.slotDate < b.slotDate ? -1 : 1;
      return a.time.localeCompare(b.time);
    });
  }, [filteredAppointments]);

  return (
    <div className="space-y-10">
      <DashboardFilterBar />

      {loadError && (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {loadError}
        </p>
      )}

      <section className="space-y-5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-staff-muted">
            ตัวชี้วัด (ตามตัวกรอง)
          </h2>
          <p className="mt-1 text-sm text-staff-faint">นัดในช่วงที่เลือก — ข้อมูลจำลอง</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "นัดทั้งหมด", value: kpis.total },
            { label: "รอเข้าพบ", value: kpis.scheduled },
            { label: "เช็คอินแล้ว", value: kpis.checked },
            { label: "ไม่มาตามนัด", value: kpis.noShow },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-staff-line bg-staff-surface p-6 shadow-sm"
            >
              <p className="text-3xl font-semibold text-staff-ink">{k.value}</p>
              <p className="mt-2 text-sm text-staff-muted">{k.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-staff-line bg-staff-surface p-6 shadow-sm lg:col-span-3">
          <h2 className="text-sm font-semibold text-staff-ink">กิจกรรมรายวัน</h2>
          <p className="mt-1 text-xs text-staff-muted">
            นัด + คำขอจอง (นับตามวันนัด) ในช่วงที่เลือก
          </p>
          <div className="mt-8 flex gap-1 sm:gap-1.5">
            {activityByDay.map(({ day, total, ap, rq }) => {
              const pct = Math.round((total / activityMax) * 100);
              const fill = total > 0 ? Math.max(pct, 12) : 0;
              return (
                <div
                  key={day}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  title={`${day}: นัด ${ap} · คำขอ ${rq}`}
                >
                  <div className="flex h-32 w-full max-w-[2.75rem] flex-col justify-end rounded-t-xl bg-staff-accent-soft">
                    <div
                      className="w-full rounded-t-xl bg-staff-accent transition-all duration-300"
                      style={{ height: `${fill}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-staff-faint sm:text-[10px]">
                    {day.slice(5).replace("-", "/")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-staff-line bg-staff-surface p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-staff-ink">สถานะนัด</h2>
          <p className="mt-1 text-xs text-staff-muted">สัดส่วนในช่วงที่กรอง</p>
          <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="flex h-full w-full">
              {statusSegments.map((seg, i) => {
                const roundedL = i === 0 ? "rounded-l-full" : "";
                const roundedR = i === statusSegments.length - 1 ? "rounded-r-full" : "";
                return (
                  <div
                    key={seg.st}
                    className={`${stripColors[seg.st] ?? "bg-slate-300"} h-full ${roundedL} ${roundedR}`}
                    style={{ width: `${seg.pct}%` }}
                    title={`${apptLabels[seg.st]}: ${seg.n}`}
                  />
                );
              })}
            </div>
          </div>
          <ul className="mt-5 space-y-2 text-xs text-staff-muted">
            {statusStripOrder.map((st) => {
              const n = statusCounts.get(st) ?? 0;
              if (n === 0) return null;
              return (
                <li key={st} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${stripColors[st] ?? "bg-slate-300"}`} />
                    {apptLabels[st]}
                  </span>
                  <span className="font-medium text-staff-ink">{n}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-staff-ink">ตารางนัด</h2>
            <p className="mt-1 text-sm text-staff-muted">แสดงเฉพาะรายการที่ผ่านตัวกรอง</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="self-start rounded-xl border border-staff-line bg-staff-surface px-4 py-2 text-sm font-medium text-staff-accent transition hover:bg-staff-accent-soft"
          >
            รีเฟรชคำขอจากเว็บ
          </button>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-staff-line bg-staff-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-staff-muted">
                <tr>
                  <th className="px-5 py-4">วันที่</th>
                  <th className="px-5 py-4">เวลา</th>
                  <th className="px-5 py-4">สาขา</th>
                  <th className="px-5 py-4">ผู้ป่วย (จำลอง)</th>
                  <th className="px-5 py-4">บริการ</th>
                  <th className="px-5 py-4">ห้อง</th>
                  <th className="px-5 py-4">แพทย์</th>
                  <th className="px-5 py-4">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-staff-line">
                {sortedTableRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-staff-muted">
                      ไม่มีนัดในช่วงหรือเงื่อนไขที่เลือก
                    </td>
                  </tr>
                ) : (
                  sortedTableRows.map((a) => (
                    <tr key={a.id} className="bg-staff-surface transition hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-5 py-4 text-staff-muted">{a.slotDate}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-staff-ink">{a.time}</td>
                      <td className="px-5 py-4 text-staff-muted">{branchName(a.branchId)}</td>
                      <td className="px-5 py-4 text-staff-ink">{a.patientName}</td>
                      <td className="px-5 py-4 text-staff-muted">{a.service}</td>
                      <td className="px-5 py-4 text-staff-ink">{a.room}</td>
                      <td className="px-5 py-4 text-staff-muted">{a.provider}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-staff-ink">
                          {apptLabels[a.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-staff-ink">คำขอจองจากเว็บ</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-staff-muted">
          แสดงเฉพาะคำขอที่ตรงช่วงวันที่ · สาขา · หมวดบริการ (นับจากวันนัด) — ข้อมูลจาก demo backend
        </p>
        <div className="mt-6 space-y-4">
          {requests === null && <p className="text-sm text-staff-muted">กำลังโหลด…</p>}
          {filteredRequests?.length === 0 && (
            <p className="rounded-2xl border border-dashed border-staff-line bg-staff-surface px-6 py-12 text-center text-sm text-staff-muted">
              ไม่มีคำขอในช่วงหรือเงื่อนไขที่เลือก
            </p>
          )}
          {filteredRequests?.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-4 rounded-2xl border border-staff-line bg-staff-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-staff-ink">{r.patientName}</p>
                <p className="mt-1 text-sm text-staff-muted">
                  {r.serviceName} · {r.branchName} · {new Date(r.slotStart).toLocaleString("th-TH")}
                </p>
                <p className="text-xs text-staff-faint">{r.phone}</p>
                <p className="mt-2 text-xs">
                  <span className="inline-flex rounded-full bg-staff-accent-soft px-2.5 py-0.5 font-medium text-staff-accent">
                    {statusLabels[r.status]}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={actionId === r.id || r.status !== "pending"}
                  onClick={() => void patchStatus(r.id, "confirmed")}
                  className="rounded-xl bg-staff-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-staff-accent-hover disabled:opacity-40"
                >
                  ยืนยัน
                </button>
                <button
                  type="button"
                  disabled={actionId === r.id || r.status !== "pending"}
                  onClick={() => void patchStatus(r.id, "reschedule")}
                  className="rounded-xl border border-staff-line bg-staff-surface px-4 py-2 text-xs font-medium text-staff-ink transition hover:border-staff-accent/30 disabled:opacity-40"
                >
                  เสนอเวลาใหม่
                </button>
                <button
                  type="button"
                  disabled={actionId === r.id || r.status !== "pending"}
                  onClick={() => void patchStatus(r.id, "rejected")}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-800 transition hover:bg-red-100 disabled:opacity-40"
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
