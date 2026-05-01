"use client";

import { useMemo, useState } from "react";
import { useLocalStorageJson } from "@/components/app/hooks/useLocalStorageJson";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { type MarketingCampaign, marketingSeed } from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

const LS_KEY = "clinic-demo-marketing-v1";

function mktSearchText(c: MarketingCampaign) {
  return [
    c.name,
    c.channel,
    c.status,
    String(c.spendThb),
    String(c.leads),
    String(c.conversions),
    c.notes,
    c.updatedAt,
  ].join(" ");
}

export function MarketingDashboard() {
  const [campaigns, setCampaigns] = useLocalStorageJson<MarketingCampaign[]>(LS_KEY, marketingSeed);
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<string>("all");

  const channels = useMemo(() => {
    const s = new Set(campaigns.map((c) => c.channel));
    return ["all", ...Array.from(s).sort()];
  }, [campaigns]);

  const baseFiltered = useMemo(() => {
    if (channel === "all") return campaigns;
    return campaigns.filter((c) => c.channel === channel);
  }, [campaigns, channel]);

  const filtered = useMemo(
    () => filterAndSortBySearch(baseFiltered, q, mktSearchText),
    [baseFiltered, q],
  );

  function setStatus(id: string, status: MarketingCampaign["status"]) {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString().slice(0, 10) } : c)),
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-staff-ink">การตลาดและช่องทาง</h1>
        <p className="mt-1 text-sm text-staff-muted">
          แคมเปญจำลอง — เปลี่ยนสถานะได้ · ค้นหาแบบหลายคำ (ชื่อ ช่องทาง UTM ฯลฯ)
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <StaffSearchField
            id="mkt-search"
            value={q}
            onChange={setQ}
            resultCount={filtered.length}
            totalCount={baseFiltered.length}
          />
        </div>
        <div className="shrink-0 lg:w-52">
          <label htmlFor="mkt-channel" className="text-xs font-medium text-staff-muted">
            กรองช่องทาง
          </label>
          <select
            id="mkt-channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-staff-line bg-staff-surface px-3 py-2.5 text-sm text-staff-ink"
          >
            {channels.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "ทุกช่องทาง" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["ใช้จ่ายรวม (จำลอง)", campaigns.reduce((s, c) => s + c.spendThb, 0)],
            ["ลีดรวม", campaigns.reduce((s, c) => s + c.leads, 0)],
            ["แปลงรวม", campaigns.reduce((s, c) => s + c.conversions, 0)],
          ] as const
        ).map(([label, v]) => (
          <div key={label} className="rounded-2xl border border-staff-line bg-staff-surface p-5 shadow-sm">
            <p className="text-2xl font-semibold tabular-nums text-staff-accent">{v.toLocaleString("th-TH")}</p>
            <p className="mt-1 text-xs text-staff-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-staff-line bg-staff-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-staff-muted">
              <tr>
                <th className="px-4 py-3">แคมเปญ</th>
                <th className="px-4 py-3">ช่องทาง</th>
                <th className="px-4 py-3">ใช้จ่าย</th>
                <th className="px-4 py-3">ลีด</th>
                <th className="px-4 py-3">แปลง</th>
                <th className="px-4 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-staff-line">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-staff-ink">{c.name}</p>
                    <p className="text-xs text-staff-faint">{c.notes}</p>
                  </td>
                  <td className="px-4 py-3 text-staff-muted">{c.channel}</td>
                  <td className="px-4 py-3 tabular-nums">{c.spendThb.toLocaleString("th-TH")}</td>
                  <td className="px-4 py-3 tabular-nums">{c.leads}</td>
                  <td className="px-4 py-3 tabular-nums">{c.conversions}</td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => setStatus(c.id, e.target.value as MarketingCampaign["status"])}
                      className="rounded-lg border border-staff-line bg-canvas px-2 py-1 text-xs text-staff-ink"
                    >
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="draft">draft</option>
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
