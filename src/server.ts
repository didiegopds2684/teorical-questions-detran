import { createServer } from "node:http";
import { loadEnv } from "./config/env.js";
import { closePool } from "./db/pool.js";
import { runMigrations } from "./db/run-migrations.js";
import { createApp } from "./app.js";

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
  const env = loadEnv();
  const app = createApp();
  const server = createServer(app);

  await listen(server, env.PORT);
  console.log(`API listening on 0.0.0.0:${env.PORT}`);
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
