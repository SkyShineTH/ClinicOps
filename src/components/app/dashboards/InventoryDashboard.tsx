"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocalStorageJson } from "@/components/app/hooks/useLocalStorageJson";
import { StaffSearchField } from "@/components/app/staff/StaffSearchField";
import { type InventoryItem, inventorySeed } from "@/lib/staff-seed-data";
import { filterAndSortBySearch } from "@/lib/text-search";

const LS_KEY = "clinic-demo-inventory-v1";

function inventorySearchText(r: InventoryItem) {
  return [r.sku, r.nameTh, r.nameEn, r.category, r.supplier, r.location, String(r.qty), String(r.par)].join(
    " ",
  );
}

export function InventoryDashboard() {
  const [items, setItems] = useLocalStorageJson<InventoryItem[]>(LS_KEY, inventorySeed);
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => filterAndSortBySearch(items, q, inventorySearchText),
    [items, q],
  );

  const lowStock = useMemo(() => items.filter((r) => r.qty < r.par), [items]);

  function adjustQty(id: string, delta: number) {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, qty: Math.max(0, r.qty + delta) } : r)),
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-staff-ink">คลังและวัสดุ</h1>
        <p className="mt-1 text-sm text-staff-muted">
          ปรับจำนวนคงเหลือได้ (บันทึกในเบราว์เซอร์) · แจ้งเตือนเมื่อต่ำกว่าเกณฑ์
        </p>
      </header>

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
                        onClick={() => adjustQty(r.id, -1)}
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
                        onClick={() => adjustQty(r.id, 1)}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-staff-muted">{r.par}</td>
                  <td className="px-4 py-3 text-staff-muted">{r.location}</td>
                  <td className="px-4 py-3 text-staff-muted">{r.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
