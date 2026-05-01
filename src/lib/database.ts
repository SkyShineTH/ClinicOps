import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

declare global {
  var __clinicOpsSql: Sql | undefined;
  var __clinicOpsSqlUrl: string | undefined;
}

function numberFromEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.trunc(value) : fallback;
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() ?? "";
}

export function isDatabaseConfigured() {
  return getDatabaseUrl().length > 0;
}

export function getSql() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;

  if (!globalThis.__clinicOpsSql || globalThis.__clinicOpsSqlUrl !== databaseUrl) {
    globalThis.__clinicOpsSql = postgres(databaseUrl, {
      connect_timeout: numberFromEnv("DATABASE_CONNECT_TIMEOUT_SECONDS", 5),
      idle_timeout: numberFromEnv("DATABASE_IDLE_TIMEOUT_SECONDS", 20),
      max: numberFromEnv("DATABASE_POOL_MAX", 5),
      ssl: process.env.DATABASE_SSL === "true" ? "require" : undefined,
    });
    globalThis.__clinicOpsSqlUrl = databaseUrl;
  }

  return globalThis.__clinicOpsSql;
}

export function getRequiredSql() {
  const sql = getSql();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }
  return sql;
}

export async function checkDatabase() {
  const sql = getSql();

  if (!sql) {
    return {
      configured: false,
      latencyMs: null,
      status: "skipped",
    } as const;
  }

  const startedAt = Date.now();

  try {
    await sql`select 1`;
    return {
      configured: true,
      latencyMs: Date.now() - startedAt,
      status: "ok",
    } as const;
  } catch (error) {
    console.error("Database readiness check failed", error);
    return {
      configured: true,
      error: error instanceof Error ? error.name : "Error",
      latencyMs: Date.now() - startedAt,
      status: "error",
    } as const;
  }
}
