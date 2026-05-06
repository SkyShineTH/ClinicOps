"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { type ClinicalVisit } from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

type ClinicalVisitWithNote = ClinicalVisit & { note: string };

function clinicalSearchText(v: ClinicalVisitWithNote) {
  return [v.hn, v.patientLabel, v.provider, v.branch, v.summary, v.note, ...v.consentFlags].join(" ");
}

export function ClinicalLiteDashboard() {
  const [visits, setVisits] = useState<ClinicalVisitWithNote[]>([]);
  const [q, setQ] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    hn: "",
    patientLabel: "",
    provider: "ทพ. วิมล ใจดี",
    branch: "สยาม",
    summary: "",
  });

  useEffect(() => {
    async function load() {
      setLoadError(null);
      try {
        const res = await fetch("/api/staff/clinical-visits", { cache: "no-store" });
        const data = (await res.json()) as { items?: ClinicalVisitWithNote[] };
        if (!res.ok) throw new Error("fail");
        setVisits(data.items ?? []);
      } catch {
        setLoadError("โหลดข้อมูลคลินิกไม่สำเร็จ");
      }
    }

    void load();
  }, []);

  const filtered = useMemo(
    () => filterAndSortBySearch(visits, q, clinicalSearchText),
    [visits, q],
  );

  async function setNote(id: string, text: string) {
    setVisits((prev) => prev.map((visit) => (visit.id === id ? { ...visit, note: text } : visit)));

    try {
      const res = await fetch(`/api/staff/clinical-visits/${id}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: text }),
      });
      if (!res.ok) throw new Error("fail");
    } catch {
      setLoadError("บันทึกหมายเหตุไม่สำเร็จ");
    }
  }

  async function createVisit() {
    if (!draft.hn.trim() || !draft.patientLabel.trim() || !draft.summary.trim()) {
      setLoadError("กรอก HN ผู้ป่วย และสรุปก่อนเพิ่ม visit");
      return;
    }

    try {
      const res = await fetch("/api/staff/clinical-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, visitedAt: new Date().toISOString(), consentFlags: [] }),
      });
      const data = (await res.json()) as { item?: ClinicalVisitWithNote };
      if (!res.ok || !data.item) throw new Error("fail");
      setVisits((prev) => [data.item!, ...prev]);
      setDraft({ hn: "", patientLabel: "", provider: "ทพ. วิมล ใจดี", branch: "สยาม", summary: "" });
    } catch {
      setLoadError("เพิ่ม visit ไม่สำเร็จ");
    }
  }

  async function deleteVisit(id: string) {
    try {
      const res = await fetch(`/api/staff/clinical-visits/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("fail");
      setVisits((prev) => prev.filter((visit) => visit.id !== id));
    } catch {
      setLoadError("ลบ visit ไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-teal/30 bg-sky-soft/40 px-4 py-3 text-sm text-staff-muted">
        <strong className="text-staff-ink">ขอบเขต:</strong> สาธิตเท่านั้น — ไม่ใช่ EMR เต็มรูปแบบ ไม่มีการวินิจฉัยหรือสั่งยา
      </div>

      <header>
        <h1 className="text-xl font-semibold text-staff-ink">บันทึกคลินิกแบบย่อ</h1>
        <p className="mt-1 text-sm text-staff-muted">
          ดูการมาเยือนล่าสุด · บันทึกหมายเหตุคลินิกผ่าน demo backend
        </p>
      </header>

      {loadError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      )}

      <section className="grid gap-3 rounded-2xl border border-staff-line bg-staff-surface p-4 shadow-sm lg:grid-cols-[0.7fr_1.1fr_1fr_0.7fr_1.6fr_auto]">
        <input value={draft.hn} onChange={(e) => setDraft((prev) => ({ ...prev, hn: e.target.value }))} placeholder="HN" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.patientLabel} onChange={(e) => setDraft((prev) => ({ ...prev, patientLabel: e.target.value }))} placeholder="ผู้ป่วย" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.provider} onChange={(e) => setDraft((prev) => ({ ...prev, provider: e.target.value }))} placeholder="แพทย์" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.branch} onChange={(e) => setDraft((prev) => ({ ...prev, branch: e.target.value }))} placeholder="สาขา" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <input value={draft.summary} onChange={(e) => setDraft((prev) => ({ ...prev, summary: e.target.value }))} placeholder="สรุป visit" className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm" />
        <button type="button" onClick={() => void createVisit()} className="rounded-xl bg-staff-accent px-4 py-2 text-sm font-semibold text-white">
          เพิ่ม
        </button>
      </section>

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
              <button
                type="button"
                onClick={() => void deleteVisit(v.id)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                aria-label={`ลบ ${v.patientLabel}`}
              >
                <Trash2 className="size-4" />
              </button>
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
              value={v.note}
              onChange={(e) => void setNote(v.id, e.target.value)}
              placeholder="เช่น นัดติดตาม หรือสิ่งที่ต้องระวัง…"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
