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
    // :: + ipv6Only: false aceita IPv4 e IPv6 (probes internos da Railway / Docker)
    server.listen({ port, host: "::", ipv6Only: false }, () => resolve());
    server.once("error", reject);
  });
}

async function main(): Promise<void> {
  const env = loadEnv();
  const port = env.PORT;
  const app = createApp();
  const server = createServer(app);

  await listen(server, port);
  console.log(`API listening on [::]:${port} (dual-stack)`);
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
