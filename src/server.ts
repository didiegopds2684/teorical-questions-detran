import { createServer } from "node:http";
import { configureApp, createLivenessApp } from "./app.js";
import { getEnv } from "./config/env.js";
import { closePool } from "./db/pool.js";
import { runMigrations } from "./db/run-migrations.js";

/** Porta só de `process.env` — sem `loadEnv`, para abrir o socket antes de validar o resto. */
function parseListenPort(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") return 3000;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 3000;
}

function listen(
  server: ReturnType<typeof createServer>,
  port: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    server.listen({ port, host: "0.0.0.0" }, () => resolve());
    server.once("error", reject);
  });
}

async function main(): Promise<void> {
  const port = parseListenPort();
  const app = createLivenessApp();
  const server = createServer(app);

  await listen(server, port);
  console.log(`[boot] listening on 0.0.0.0:${port} (health ready before env/db)`);

  configureApp(app);
  const env = getEnv();
  if (env.ENABLE_SWAGGER) {
    console.log(`OpenAPI UI: http://localhost:${env.PORT}/docs`);
  }

  await runMigrations();

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
