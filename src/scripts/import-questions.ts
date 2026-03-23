import { loadEnv } from "../config/env.js";
import { closePool } from "../db/pool.js";
import { importQuestionsFromJson } from "../db/seed-questions.js";

async function main(): Promise<void> {
  loadEnv();
  try {
    await importQuestionsFromJson();
  } finally {
    await closePool();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
