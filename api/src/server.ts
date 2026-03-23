import { createServer } from "node:http";
import { loadEnv } from "./config/env.js";
import { closePool } from "./db/pool.js";
import { runMigrations } from "./db/run-migrations.js";
import { createApp } from "./app.js";

async function main(): Promise<void> {
  const env = loadEnv();
  await runMigrations();
  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
    if (env.ENABLE_SWAGGER) {
      console.log(`OpenAPI UI: http://localhost:${env.PORT}/docs`);
    }
  });

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
