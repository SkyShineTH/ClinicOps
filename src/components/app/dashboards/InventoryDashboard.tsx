"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { type InventoryItem } from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

function inventorySearchText(r: InventoryItem) {
  return [r.sku, r.nameTh, r.nameEn, r.category, r.supplier, r.location, String(r.qty), String(r.par)].join(
    " ",
  );
}

export function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [q, setQ] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    sku: "",
    nameTh: "",
    qty: "0",
    par: "10",
    category: "ทั่วไป",
  });

  async function load() {
    setLoadError(null);
    try {
      const res = await fetch("/api/staff/inventory", { cache: "no-store" });
      const data = (await res.json()) as { items?: InventoryItem[] };
      if (!res.ok) throw new Error("fail");
      setItems(data.items ?? []);
    } catch {
      setLoadError("โหลดคลังไม่สำเร็จ");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => filterAndSortBySearch(items, q, inventorySearchText),
    [items, q],
  );

  const lowStock = useMemo(() => items.filter((r) => r.qty < r.par), [items]);

  async function adjustQty(id: string, delta: number) {
    try {
      const res = await fetch(`/api/staff/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      const data = (await res.json()) as { item?: InventoryItem };
      if (!res.ok || !data.item) throw new Error("fail");
      setItems((prev) => prev.map((item) => (item.id === id ? data.item! : item)));
    } catch {
      setLoadError("ปรับจำนวนไม่สำเร็จ");
    }
  }

  async function createItem() {
    if (!draft.sku.trim() || !draft.nameTh.trim()) {
      setLoadError("กรอก SKU และชื่อวัสดุก่อนเพิ่มรายการ");
      return;
    }

    try {
      const res = await fetch("/api/staff/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          qty: Number(draft.qty),
          par: Number(draft.par),
          nameEn: draft.nameTh,
          supplier: "Demo supplier",
          location: "คลังใหม่",
        }),
      });
      const data = (await res.json()) as { item?: InventoryItem };
      if (!res.ok || !data.item) throw new Error("fail");
      setItems((prev) => [data.item!, ...prev]);
      setDraft({ sku: "", nameTh: "", qty: "0", par: "10", category: "ทั่วไป" });
    } catch {
      setLoadError("เพิ่มวัสดุไม่สำเร็จ");
    }
  }

  async function deleteItem(id: string) {
    try {
      const res = await fetch(`/api/staff/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("fail");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setLoadError("ลบวัสดุไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-staff-ink">คลังและวัสดุ</h1>
        <p className="mt-1 text-sm text-staff-muted">
          ปรับจำนวนคงเหลือผ่าน demo backend · แจ้งเตือนเมื่อต่ำกว่าเกณฑ์
        </p>
      </header>

      {loadError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      )}

      <section className="grid gap-3 rounded-2xl border border-staff-line bg-staff-surface p-4 shadow-sm md:grid-cols-[1fr_1.4fr_0.7fr_0.7fr_1fr_auto]">
        <input
          value={draft.sku}
          onChange={(e) => setDraft((prev) => ({ ...prev, sku: e.target.value }))}
          placeholder="SKU"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <input
          value={draft.nameTh}
          onChange={(e) => setDraft((prev) => ({ ...prev, nameTh: e.target.value }))}
          placeholder="ชื่อวัสดุ"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <input
          value={draft.qty}
          onChange={(e) => setDraft((prev) => ({ ...prev, qty: e.target.value }))}
          placeholder="คงเหลือ"
          inputMode="numeric"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <input
          value={draft.par}
          onChange={(e) => setDraft((prev) => ({ ...prev, par: e.target.value }))}
          placeholder="เกณฑ์"
          inputMode="numeric"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <input
          value={draft.category}
          onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
          placeholder="หมวด"
          className="rounded-xl border border-staff-line bg-canvas px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void createItem()}
          className="rounded-xl bg-staff-accent px-4 py-2 text-sm font-semibold text-white"
        >
          เพิ่ม
        </button>
      </section>

      <StaffSearchField
        id="inventory-search"
        value={q}
        onChange={setQ}
        resultCount={filtered.length}
        totalCount={items.length}
      />

      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>สต็อกต่ำ:</strong> {lowStock.length} รายการ — ตรวจสอบการสั่งซื้อ
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-staff-line bg-staff-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-staff-muted">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">รายการ</th>
                <th className="px-4 py-3">หมวด</th>
                <th className="px-4 py-3">คงเหลือ</th>
                <th className="px-4 py-3">เกณฑ์</th>
                <th className="px-4 py-3">ที่เก็บ</th>
                <th className="px-4 py-3">ซัพพลายเออร์</th>
                <th className="px-4 py-3">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-staff-line">
              {filtered.map((r) => (
                <tr key={r.id} className={r.qty < r.par ? "bg-red-50/50" : ""}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-staff-muted">
                    {r.sku}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-staff-ink">{r.nameTh}</p>
                    <p className="text-xs text-staff-faint">{r.nameEn}</p>
                  </td>
                  <td className="px-4 py-3 text-staff-muted">{r.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="ลดจำนวน"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-staff-line text-staff-muted hover:border-staff-accent hover:text-staff-accent"
                        onClick={() => void adjustQty(r.id, -1)}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-[2rem] text-center font-semibold tabular-nums text-staff-ink">
                        {r.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="เพิ่มจำนวน"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-staff-line text-staff-muted hover:border-staff-accent hover:text-staff-accent"
                        onClick={() => void adjustQty(r.id, 1)}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-staff-muted">{r.par}</td>
                  <td className="px-4 py-3 text-staff-muted">{r.location}</td>
                  <td className="px-4 py-3 text-staff-muted">{r.supplier}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void deleteItem(r.id)}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                      aria-label={`ลบ ${r.nameTh}`}
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
