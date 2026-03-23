import { readFileSync } from "node:fs";
import { join } from "node:path";
import cors from "cors";
import express from "express";
import type pg from "pg";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { errorHandler, asyncHandler } from "./common/error-handler.js";
import { getEnv } from "./config/env.js";
import { getPool } from "./db/pool.js";
import { createQuestionsRouter } from "./modules/questions/questions.router.js";
import { QuestionsRepository } from "./modules/questions/questions.repository.js";
import { QuestionsService } from "./modules/questions/questions.service.js";

function loadOpenApiSpec(): Record<string, unknown> {
  const path = join(process.cwd(), "openapi", "openapi.yaml");
  const raw = readFileSync(path, "utf-8");
  return YAML.parse(raw) as Record<string, unknown>;
}

/** Só `/health` — sem env nem DB. O servidor pode fazer `listen` antes de `loadEnv` (Railway). */
export function createLivenessApp(): express.Application {
  const app = express();
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
  return app;
}

/** Rotas e middleware completos (chama `loadEnv` / pool). */
export function configureApp(app: express.Application, pool?: pg.Pool): void {
  const p = pool ?? getPool();
  const repo = new QuestionsRepository(p);
  const questionsService = new QuestionsService(repo);
  const env = getEnv();

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  const openApiSpec = loadOpenApiSpec();

  app.get("/openapi.json", (_req, res) => {
    res.json(openApiSpec);
  });

  if (env.ENABLE_SWAGGER) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "Autocurso API" }));
  }

  app.get(
    "/modules",
    asyncHandler(async (_req, res) => {
      const data = await questionsService.modules();
      res.json({ data });
    }),
  );

  app.use("/questions", createQuestionsRouter(questionsService));

  app.use(errorHandler);
}

export function createApp(pool?: pg.Pool): express.Application {
  const app = createLivenessApp();
  configureApp(app, pool);
  return app;
}
