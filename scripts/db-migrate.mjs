import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
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

async function listMigrations() {
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  return Promise.all(
    files.map(async (file) => {
      const filePath = path.join(migrationsDir, file);
      const contents = await readFile(filePath);
      const checksum = createHash("sha256").update(contents).digest("hex");

      return {
        checksum,
        file,
        filePath,
      };
    }),
  );
}

async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now(),
      execution_ms integer NOT NULL
    )
  `;
}

async function getAppliedMigrations() {
  const rows = await sql`
    SELECT filename, checksum
    FROM schema_migrations
    ORDER BY filename
  `;

  return new Map(rows.map((row) => [row.filename, row.checksum]));
}

try {
  await ensureMigrationsTable();

  const migrations = await listMigrations();
  const appliedMigrations = await getAppliedMigrations();
  let appliedCount = 0;
  let skippedCount = 0;

  for (const migration of migrations) {
    const appliedChecksum = appliedMigrations.get(migration.file);

    if (appliedChecksum) {
      if (appliedChecksum !== migration.checksum) {
        throw new Error(
          `Checksum mismatch for already-applied migration ${migration.file}. ` +
            "Create a new migration instead of editing an applied one.",
        );
      }

      skippedCount += 1;
      console.log(`Skipped ${migration.file}`);
      continue;
    }

    const startedAt = Date.now();

    await sql.begin(async (tx) => {
      await tx.file(migration.filePath);
      await tx`
        INSERT INTO schema_migrations (filename, checksum, execution_ms)
        VALUES (${migration.file}, ${migration.checksum}, ${Date.now() - startedAt})
      `;
    });

    appliedCount += 1;
    console.log(`Applied ${migration.file}`);
  }

  console.log(`Migrations complete: ${appliedCount} applied, ${skippedCount} skipped.`);
} finally {
  await sql.end({ timeout: 5 });
}
