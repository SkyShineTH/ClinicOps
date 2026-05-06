import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { createMarketingCampaign, listMarketingCampaigns } from "@/lib/staff-demo-store";
import type { MarketingCampaign } from "@/lib/staff-seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return jsonOk({ items: await listMarketingCampaigns() });
}

function isMarketingStatus(value: unknown): value is MarketingCampaign["status"] {
  return value === "active" || value === "paused" || value === "draft";
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

  const name = String(body.name ?? "").trim();
  const channel = String(body.channel ?? "LINE").trim();
  const spendThb = Number(body.spendThb ?? 0);
  const leads = Number(body.leads ?? 0);
  const conversions = Number(body.conversions ?? 0);
  const status = isMarketingStatus(body.status) ? body.status : "draft";
  const notes = String(body.notes ?? "").trim();

  if (!name || !channel) return jsonError("missing_fields", 400);
  if (![spendThb, leads, conversions].every((value) => Number.isFinite(value) && value >= 0)) {
    return jsonError("invalid_metrics", 400);
  }

  return jsonOk(
    {
      item: await createMarketingCampaign({
        name: name.slice(0, 140),
        channel: channel.slice(0, 80),
        spendThb: Math.trunc(spendThb),
        leads: Math.trunc(leads),
        conversions: Math.trunc(conversions),
        status,
        notes: notes.slice(0, 240),
      }),
    },
    { status: 201 },
  );
}
