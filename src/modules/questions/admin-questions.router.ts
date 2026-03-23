import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler.js";
import { HttpError } from "../../common/http-error.js";
import type { QuestionsService } from "./questions.service.js";

const questionBodySchema = z.object({
  id: z.string().min(1),
  parte: z.coerce.number().int().positive(),
  modulo_numero: z.coerce.number().int().positive(),
  modulo_titulo: z.string().min(1),
  numero: z.coerce.number().int().positive(),
  dificuldade: z.enum(["facil", "intermediario", "dificil"]),
  enunciado: z.string().min(1),
  codigo_placa: z.string().nullable(),
  alternativa_correta: z.string().min(1),
  comentario: z.string().min(1),
  alternativas_incorretas: z.array(z.string()),
  fonte: z.string().min(1),
});

export function createAdminQuestionsRouter(service: QuestionsService): Router {
  const r = Router();

  r.post(
    "/",
    asyncHandler(async (req, res) => {
      const body = questionBodySchema.parse(req.body);
      const saved = await service.upsert(body);
      res.status(200).json(saved);
    }),
  );

  r.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = z.string().min(1).parse(req.params.id);
      const ok = await service.deleteById(id);
      if (!ok) throw new HttpError(404, "NOT_FOUND", `Question not found: ${id}`);
      res.status(204).send();
    }),
  );

  r.post(
    "/import",
    asyncHandler(async (req, res) => {
      const schema = z.array(questionBodySchema);
      const items = schema.parse(req.body);
      const result = await service.importMany(items);
      res.status(200).json(result);
    }),
  );

  return r;
}
