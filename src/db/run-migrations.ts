import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPool, closePool } from "./pool.js";
import { getEnv, loadEnv } from "../config/env.js";
import { seedQuestionsIfEmpty } from "./seed-questions.js";

function migrationsTableDdl(table: string): string {
  return `
CREATE TABLE IF NOT EXISTS ${table} (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
}

function migrationsDir(): string {
  return join(process.cwd(), "migrations");
}

async function ensureMigrationsTable(migrationsTable: string): Promise<void> {
  const pool = getPool();
  await pool.query(migrationsTableDdl(migrationsTable));
}

async function getAppliedNames(migrationsTable: string): Promise<Set<string>> {
  const pool = getPool();
  const { rows } = await pool.query<{ name: string }>(`SELECT name FROM ${migrationsTable}`);
  return new Set(rows.map((r) => r.name));
}

export async function runMigrations(): Promise<void> {
  loadEnv();
  const migrationsTable = getEnv().SCHEMA_MIGRATIONS_TABLE;
  await ensureMigrationsTable(migrationsTable);
  const dir = migrationsDir();
  const files = (await readdir(dir))
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  const applied = await getAppliedNames(migrationsTable);
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
      await client.query(`INSERT INTO ${migrationsTable} (name) VALUES ($1)`, [file]);
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
