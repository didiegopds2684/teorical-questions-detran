import type { Application } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { closePool, getPool } from "./db/pool.js";
import { runMigrations } from "./db/run-migrations.js";

const sample = {
  id: "test-p1-m1-q1",
  parte: 1,
  modulo_numero: 1,
  modulo_titulo: "Módulo teste",
  numero: 1,
  dificuldade: "facil",
  enunciado: "Pergunta de teste sobre trânsito",
  codigo_placa: null,
  alternativa_correta: "Correta",
  comentario: "Comentário",
  alternativas_incorretas: ["A", "B", "C"],
  fonte: "test",
};

describe("API (integration)", () => {
  const pool = getPool();
  let app: Application;

  beforeAll(async () => {
    await pool.query("SELECT 1");
    await runMigrations();
    await pool.query("DELETE FROM questions WHERE id LIKE 'test-%'");
    await pool.query(
      `INSERT INTO questions (
        id, parte, modulo_numero, modulo_titulo, numero, dificuldade,
        enunciado, codigo_placa, alternativa_correta, comentario,
        alternativas_incorretas, fonte
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        sample.id,
        sample.parte,
        sample.modulo_numero,
        sample.modulo_titulo,
        sample.numero,
        sample.dificuldade,
        sample.enunciado,
        sample.codigo_placa,
        sample.alternativa_correta,
        sample.comentario,
        sample.alternativas_incorretas,
        sample.fonte,
      ],
    );
    app = createApp(pool);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM questions WHERE id LIKE 'test-%'");
    await closePool();
  });

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /openapi.json returns OpenAPI 3 document", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\.0\./);
    expect(res.body.paths["/health"]).toBeDefined();
  });

  it("GET /questions returns paginated list", async () => {
    const res = await request(app).get("/questions").query({ limit: 5, q: "teste" });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 5,
      total: expect.any(Number),
      total_pages: expect.any(Number),
    });
    expect(res.body.data.some((q: { id: string }) => q.id === sample.id)).toBe(true);
  });

  it("GET /questions/:id returns 404 for unknown id", async () => {
    const res = await request(app).get("/questions/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("GET /questions/:id returns question", async () => {
    const res = await request(app).get(`/questions/${sample.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(sample.id);
    expect(res.body.enunciado).toContain("teste");
  });

  it("GET /questions/random returns a question", async () => {
    const res = await request(app).get("/questions/random").query({ parte: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
  });

  it("GET /modules returns data array", async () => {
    const res = await request(app).get("/modules");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("GET /questions rejects invalid limit", async () => {
    const res = await request(app).get("/questions").query({ limit: 999 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
