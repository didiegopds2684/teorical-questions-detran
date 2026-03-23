import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPool, closePool } from "./pool.js";
import { loadEnv } from "../config/env.js";
import { seedQuestionsIfEmpty } from "./seed-questions.js";

const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

function migrationsDir(): string {
  return join(process.cwd(), "migrations");
}

async function ensureMigrationsTable(): Promise<void> {
  const pool = getPool();
  await pool.query(MIGRATIONS_TABLE);
}

async function getAppliedNames(): Promise<Set<string>> {
  const pool = getPool();
  const { rows } = await pool.query<{ name: string }>("SELECT name FROM schema_migrations");
  return new Set(rows.map((r) => r.name));
}

export async function runMigrations(): Promise<void> {
  await ensureMigrationsTable();
  const dir = migrationsDir();
  const files = (await readdir(dir))
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  const applied = await getAppliedNames();
  const pool = getPool();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }
    const sql = await readFile(join(dir, file), "utf-8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`Migration applied: ${file}`);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  await seedQuestionsIfEmpty();
}

async function main(): Promise<void> {
  loadEnv();
  try {
    await runMigrations();
  } finally {
    await closePool();
  }
}

const isMain = process.argv[1]?.includes("run-migrations");
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
