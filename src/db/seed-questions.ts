import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getEnv } from "../config/env.js";
import { getPool } from "./pool.js";

type QuestionJson = {
  id: string;
  parte: number;
  modulo_numero: number;
  modulo_titulo: string;
  numero: number;
  dificuldade: string;
  enunciado: string;
  codigo_placa: string | null;
  alternativa_correta: string;
  comentario: string;
  alternativas_incorretas: string[];
  fonte: string;
};

const INSERT_SQL = `
INSERT INTO questions (
  id, parte, modulo_numero, modulo_titulo, numero, dificuldade,
  enunciado, codigo_placa, alternativa_correta, comentario,
  alternativas_incorretas, fonte
) VALUES (
  $1, $2, $3, $4, $5, $6,
  $7, $8, $9, $10,
  $11, $12
)
ON CONFLICT (id) DO UPDATE SET
  parte = EXCLUDED.parte,
  modulo_numero = EXCLUDED.modulo_numero,
  modulo_titulo = EXCLUDED.modulo_titulo,
  numero = EXCLUDED.numero,
  dificuldade = EXCLUDED.dificuldade,
  enunciado = EXCLUDED.enunciado,
  codigo_placa = EXCLUDED.codigo_placa,
  alternativa_correta = EXCLUDED.alternativa_correta,
  comentario = EXCLUDED.comentario,
  alternativas_incorretas = EXCLUDED.alternativas_incorretas,
  fonte = EXCLUDED.fonte
`;

function defaultQuestionsPath(): string {
  return resolve(process.cwd(), "tools", "extractor", "data", "questions.json");
}

export async function seedQuestionsIfEmpty(): Promise<void> {
  const pool = getPool();
  const { rows } = await pool.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM questions");
  const total = Number(rows[0]?.total ?? "0");

  if (total > 0) {
    return;
  }
  await importQuestionsFromJson();
}

export async function importQuestionsFromJson(): Promise<void> {
  const pool = getPool();
  const env = getEnv();
  const jsonPath = env.QUESTIONS_JSON_PATH ?? defaultQuestionsPath();
  const raw = await readFile(jsonPath, "utf-8");
  const data = JSON.parse(raw) as QuestionJson[];

  if (!Array.isArray(data)) {
    throw new Error("questions.json must be an array");
  }

  const client = await pool.connect();
  let imported = 0;
  try {
    await client.query("BEGIN");
    for (const q of data) {
      await client.query(INSERT_SQL, [
        q.id,
        q.parte,
        q.modulo_numero,
        q.modulo_titulo,
        q.numero,
        q.dificuldade,
        q.enunciado,
        q.codigo_placa,
        q.alternativa_correta,
        q.comentario,
        q.alternativas_incorretas,
        q.fonte,
      ]);
      imported++;
    }
    await client.query("COMMIT");
    console.log(`Import finished: ${imported} questions (upsert) from ${jsonPath}`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
