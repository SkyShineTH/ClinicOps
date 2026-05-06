import { NextResponse } from "next/server";

export function jsonOk<T>(payload: T, init?: ResponseInit) {
  return NextResponse.json(payload, {
    ...init,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      ...init?.headers,
    },
  });
}

export function jsonError(error: string, status: number) {
  return jsonOk({ error }, { status });
}

export function readSearchParam(url: URL, key: string) {
  const value = url.searchParams.get(key)?.trim();
  return value ? value : null;
}

export function readYmdParam(url: URL, key: string) {
  const value = readSearchParam(url, key);
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "invalid";
}
