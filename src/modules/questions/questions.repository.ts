import type pg from "pg";
import type { Dificuldade, ModuleSummary, Question } from "./question.types.js";
import type { Paginated } from "./question.types.js";

export type ListFilters = {
  parte?: number;
  modulo_numero?: number;
  dificuldade?: Dificuldade;
  q?: string;
};

function mapRow(row: pg.QueryResultRow): Question {
  return {
    id: row.id,
    parte: row.parte,
    modulo_numero: row.modulo_numero,
    modulo_titulo: row.modulo_titulo,
    numero: row.numero,
    dificuldade: row.dificuldade,
    enunciado: row.enunciado,
    codigo_placa: row.codigo_placa,
    alternativa_correta: row.alternativa_correta,
    comentario: row.comentario,
    alternativas_incorretas: row.alternativas_incorretas,
    fonte: row.fonte,
  };
}

export class QuestionsRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findById(id: string): Promise<Question | null> {
    const { rows } = await this.pool.query("SELECT * FROM questions WHERE id = $1", [id]);
    if (!rows[0]) return null;
    return mapRow(rows[0]);
  }

  async list(
    filters: ListFilters,
    page: number,
    limit: number,
  ): Promise<Paginated<Question>> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (filters.parte !== undefined) {
      conditions.push(`parte = $${i++}`);
      values.push(filters.parte);
    }
    if (filters.modulo_numero !== undefined) {
      conditions.push(`modulo_numero = $${i++}`);
      values.push(filters.modulo_numero);
    }
    if (filters.dificuldade !== undefined) {
      conditions.push(`dificuldade = $${i++}`);
      values.push(filters.dificuldade);
    }
    if (filters.q !== undefined && filters.q.trim() !== "") {
      conditions.push(`enunciado ILIKE $${i++}`);
      values.push(`%${filters.q.trim()}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*)::int AS c FROM questions ${where}`;
    const { rows: countRows } = await this.pool.query<{ c: number }>(countSql, values);
    const total = countRows[0]?.c ?? 0;

    const offset = (page - 1) * limit;
    const limitParam = i++;
    const offsetParam = i++;
    const listSql = `
      SELECT * FROM questions
      ${where}
      ORDER BY parte ASC, modulo_numero ASC, numero ASC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    const listValues = [...values, limit, offset];
    const { rows } = await this.pool.query(listSql, listValues);
    const total_pages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: rows.map(mapRow),
      meta: { page, limit, total, total_pages },
    };
  }

  async randomOne(filters: ListFilters): Promise<Question | null> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (filters.parte !== undefined) {
      conditions.push(`parte = $${i++}`);
      values.push(filters.parte);
    }
    if (filters.modulo_numero !== undefined) {
      conditions.push(`modulo_numero = $${i++}`);
      values.push(filters.modulo_numero);
    }
    if (filters.dificuldade !== undefined) {
      conditions.push(`dificuldade = $${i++}`);
      values.push(filters.dificuldade);
    }
    if (filters.q !== undefined && filters.q.trim() !== "") {
      conditions.push(`enunciado ILIKE $${i++}`);
      values.push(`%${filters.q.trim()}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT * FROM questions
      ${where}
      ORDER BY random()
      LIMIT 1
    `;
    const { rows } = await this.pool.query(sql, values);
    if (!rows[0]) return null;
    return mapRow(rows[0]);
  }

  async listModules(): Promise<ModuleSummary[]> {
    const sql = `
      SELECT
        parte,
        modulo_numero,
        modulo_titulo,
        COUNT(*)::int AS question_count
      FROM questions
      GROUP BY parte, modulo_numero, modulo_titulo
      ORDER BY parte ASC, modulo_numero ASC
    `;
    const { rows } = await this.pool.query(sql);
    return rows.map((r) => ({
      parte: r.parte,
      modulo_numero: r.modulo_numero,
      modulo_titulo: r.modulo_titulo,
      question_count: r.question_count,
    }));
  }
}
