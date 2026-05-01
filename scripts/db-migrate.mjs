import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error("DATABASE_URL is required to run migrations.");
  process.exit(1);
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");
const migrationsDir = path.join(projectRoot, "database", "migrations");

const sql = postgres(databaseUrl, {
  connect_timeout: Number(process.env.DATABASE_CONNECT_TIMEOUT_SECONDS ?? 5),
  idle_timeout: 5,
  max: 1,
  onnotice: () => undefined,
  ssl: process.env.DATABASE_SSL === "true" ? "require" : undefined,
});

try {
  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    await sql.file(path.join(migrationsDir, file));
    console.log(`Applied ${file}`);
  }
} finally {
  await sql.end({ timeout: 5 });
}
