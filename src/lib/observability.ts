type LogLevel = "info" | "warn" | "error";

type BookingApiLogFields = {
  action: string;
  durationMs: number;
  error?: string;
  method: string;
  path: string;
  requestId?: string;
  status: "ok" | "error";
  statusCode: number;
  storage: string;
};

export function readRequestId(req: Request) {
  return req.headers.get("x-request-id")?.trim() || undefined;
}

export function logBookingApiEvent(fields: BookingApiLogFields) {
  const level: LogLevel = fields.status === "error" ? "error" : "info";
  const payload = {
    event: "booking_api",
    level,
    service: "ClinicOps",
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}
