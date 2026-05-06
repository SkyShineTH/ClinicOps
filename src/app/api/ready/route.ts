import packageJson from "../../../../package.json";
import { checkDatabase } from "@/lib/database";
import { getBookingStorageMode } from "@/lib/booking-request-store";
import { getStaffStorageMode } from "@/lib/staff-demo-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const database = await checkDatabase();
  const ready = database.status !== "error";

  return NextResponse.json(
    {
      status: ready ? "ready" : "not_ready",
      app: packageJson.name,
      service: "ClinicOps",
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      storage: {
        mode: getBookingStorageMode(),
        booking: getBookingStorageMode(),
        staff: getStaffStorageMode(),
      },
      checks: {
        database,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
      status: ready ? 200 : 503,
    },
  );
}
