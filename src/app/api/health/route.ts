import packageJson from "../../../../package.json";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const uptimeSeconds = Math.round(process.uptime());

  return NextResponse.json(
    {
      status: "ok",
      app: packageJson.name,
      service: "ClinicOps",
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      uptime: {
        seconds: uptimeSeconds,
        startedAt: new Date(Date.now() - uptimeSeconds * 1000).toISOString(),
      },
      runtime: {
        node: process.version,
        environment: process.env.NODE_ENV ?? "development",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
