import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { createInventoryItem, listInventoryItems } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return jsonOk({ items: await listInventoryItems() });
}

export async function POST(req: Request) {
  const unauthorized = authorizeStaffRequest(req);
  if (unauthorized) return unauthorized;

  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError("invalid_body", 400);
  }

  const sku = String(body.sku ?? "").trim();
  const nameTh = String(body.nameTh ?? "").trim();
  const nameEn = String(body.nameEn ?? nameTh).trim();
  const category = String(body.category ?? "ทั่วไป").trim();
  const supplier = String(body.supplier ?? "Demo supplier").trim();
  const location = String(body.location ?? "คลัง").trim();
  const qty = Number(body.qty);
  const par = Number(body.par);

  if (!sku || !nameTh) return jsonError("missing_fields", 400);
  if (!Number.isFinite(qty) || qty < 0) return jsonError("invalid_qty", 400);
  if (!Number.isFinite(par) || par < 0) return jsonError("invalid_par", 400);

  return jsonOk(
    {
      item: await createInventoryItem({
        sku: sku.slice(0, 40),
        nameTh: nameTh.slice(0, 120),
        nameEn: nameEn.slice(0, 120),
        category: category.slice(0, 80),
        qty: Math.trunc(qty),
        par: Math.trunc(par),
        supplier: supplier.slice(0, 120),
        location: location.slice(0, 120),
      }),
    },
    { status: 201 },
  );
}
