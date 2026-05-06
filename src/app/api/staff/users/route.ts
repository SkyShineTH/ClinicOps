import { jsonError, jsonOk } from "@/lib/api-response";
import { authorizeStaffRequest } from "@/lib/staff-auth";
import { createStaffUser, listStaffUsers } from "@/lib/staff-demo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return jsonOk({ items: await listStaffUsers() });
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
  const email = String(body.email ?? "").trim();
  const role = String(body.role ?? "หน้าร้าน").trim();
  const branch = String(body.branch ?? "สยาม").trim();

  if (!name || !email) return jsonError("missing_fields", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("invalid_email", 400);

  return jsonOk(
    {
      item: await createStaffUser({
        name: name.slice(0, 120),
        email: email.slice(0, 160),
        role: role.slice(0, 80),
        branch: branch.slice(0, 80),
      }),
    },
    { status: 201 },
  );
}
