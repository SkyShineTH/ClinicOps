import { jsonError } from "./api-response";

export function authorizeStaffRequest(req: Request) {
  const token = process.env.STAFF_API_TOKEN?.trim();
  if (!token) {
    if (process.env.NODE_ENV === "production") {
      return jsonError("staff_api_token_required", 503);
    }

    return null;
  }

  const provided = req.headers.get("x-staff-demo-token")?.trim();
  if (provided === token) return null;

  return jsonError("unauthorized", 401);
}
