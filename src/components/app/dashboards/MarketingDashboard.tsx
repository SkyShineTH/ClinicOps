"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { type MarketingCampaign } from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

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
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    channel: "LINE",
    spendThb: "0",
    leads: "0",
    conversions: "0",
    notes: "",
  });

  async function load() {
    setLoadError(null);
    try {
      const res = await fetch("/api/staff/marketing", { cache: "no-store" });
      const data = (await res.json()) as { items?: MarketingCampaign[] };
      if (!res.ok) throw new Error("fail");
      setCampaigns(data.items ?? []);
    } catch {
      setLoadError("โหลดแคมเปญไม่สำเร็จ");
    }
  }

  useEffect(() => {
    void load();
  }, []);

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

  async function setStatus(id: string, status: MarketingCampaign["status"]) {
    try {
      const res = await fetch(`/api/staff/marketing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { item?: MarketingCampaign };
      if (!res.ok || !data.item) throw new Error("fail");
      setCampaigns((prev) => prev.map((campaign) => (campaign.id === id ? data.item! : campaign)));
    } catch {
      setLoadError("อัปเดตแคมเปญไม่สำเร็จ");
    }
  }

  async function createCampaign() {
    if (!draft.name.trim() || !draft.channel.trim()) {
      setLoadError("กรอกชื่อแคมเปญและช่องทางก่อนเพิ่ม");
      return;
    }

    try {
      const res = await fetch("/api/staff/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          spendThb: Number(draft.spendThb),
          leads: Number(draft.leads),
          conversions: Number(draft.conversions),
          status: "draft",
        }),
      });
      const data = (await res.json()) as { item?: MarketingCampaign };
      if (!res.ok || !data.item) throw new Error("fail");
      setCampaigns((prev) => [data.item!, ...prev]);
      setDraft({ name: "", channel: "LINE", spendThb: "0", leads: "0", conversions: "0", notes: "" });
    } catch {
      setLoadError("เพิ่มแคมเปญไม่สำเร็จ");
    }
  }

  async function deleteCampaign(id: string) {
    try {
      const res = await fetch(`/api/staff/marketing/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("fail");
      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    } catch {
      setLoadError("ลบแคมเปญไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-staff-ink">การตลาดและช่องทาง</h1>
        <p className="mt-1 text-sm text-staff-muted">
          แคมเปญจำลองจาก demo backend — เปลี่ยนสถานะได้ · ค้นหาแบบหลายคำ
        </p>
      </header>

      {loadError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      )}

      <section className="grid gap-3 rounded-2xl border border-staff-line bg-staff-surface p-4 shadow-sm lg:grid-cols-[1.5fr_0.8fr_0.7fr_0.6fr_0.6fr_1.3fr_auto]">
        <input value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="ชื่อแคมเปญ" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.channel} onChange={(e) => setDraft((prev) => ({ ...prev, channel: e.target.value }))} placeholder="ช่องทาง" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.spendThb} onChange={(e) => setDraft((prev) => ({ ...prev, spendThb: e.target.value }))} placeholder="ใช้จ่าย" inputMode="numeric" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.leads} onChange={(e) => setDraft((prev) => ({ ...prev, leads: e.target.value }))} placeholder="ลีด" inputMode="numeric" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.conversions} onChange={(e) => setDraft((prev) => ({ ...prev, conversions: e.target.value }))} placeholder="แปลง" inputMode="numeric" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.notes} onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))} placeholder="notes / UTM" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <button type="button" onClick={() => void createCampaign()} className="rounded-xl bg-staff-accent px-4 py-2 text-sm font-semibold text-white">
          เพิ่ม
        </button>
      </section>

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
                <th className="px-4 py-3">ลบ</th>
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
                      onChange={(e) => void setStatus(c.id, e.target.value as MarketingCampaign["status"])}
                      className="rounded-lg border border-staff-line bg-canvas px-2 py-1 text-xs text-staff-ink"
                    >
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="draft">draft</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void deleteCampaign(c.id)}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                      aria-label={`ลบ ${c.name}`}
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
