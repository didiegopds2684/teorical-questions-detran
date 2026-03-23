import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler.js";
import type { QuestionsService } from "./questions.service.js";
import type { Dificuldade } from "./question.types.js";

const dificuldadeSchema = z.enum(["facil", "intermediario", "dificil"]);

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  parte: z.coerce.number().int().positive().optional(),
  modulo_numero: z.coerce.number().int().positive().optional(),
  dificuldade: dificuldadeSchema.optional(),
  q: z.string().optional(),
});

const randomQuerySchema = z.object({
  parte: z.coerce.number().int().positive().optional(),
  modulo_numero: z.coerce.number().int().positive().optional(),
  dificuldade: dificuldadeSchema.optional(),
  q: z.string().optional(),
});

export function createQuestionsRouter(service: QuestionsService): Router {
  const r = Router();

  r.get(
    "/",
    asyncHandler(async (req, res) => {
      const q = listQuerySchema.parse(req.query);
      const filters = {
        parte: q.parte,
        modulo_numero: q.modulo_numero,
        dificuldade: q.dificuldade as Dificuldade | undefined,
        q: q.q,
      };
      const result = await service.list(filters, q.page, q.limit);
      res.json(result);
    }),
  );

  r.get(
    "/random",
    asyncHandler(async (req, res) => {
      const q = randomQuerySchema.parse(req.query);
      const filters = {
        parte: q.parte,
        modulo_numero: q.modulo_numero,
        dificuldade: q.dificuldade as Dificuldade | undefined,
        q: q.q,
      };
      const question = await service.random(filters);
      res.json(question);
    }),
  );

  r.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = z.string().min(1).parse(req.params.id);
      const question = await service.getById(id);
      res.json(question);
    }),
  );

  return r;
}
