import { jsonError } from "./api-response";

export function authorizeStaffRequest(req: Request) {
  const token = process.env.STAFF_API_TOKEN?.trim();
  if (!token) return null;

  const provided = req.headers.get("x-staff-demo-token")?.trim();
  if (provided === token) return null;

  return jsonError("unauthorized", 401);
}
