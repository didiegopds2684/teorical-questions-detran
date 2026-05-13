import type { Dificuldade, Filters, ModuleSummary, Paginated, Question } from '../types';

// Em dev usa o proxy do Vite (/api → localhost:3000). Em prod usa VITE_API_URL (sem barra final).
const BASE = import.meta.env.VITE_API_URL ?? '/api';

function buildParams(filters: Filters & Record<string, unknown>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== '') p.set(k, String(v));
  }
  return p.toString();
}

export async function fetchModules(): Promise<ModuleSummary[]> {
  const res = await fetch(`${BASE}/modules`);
  if (!res.ok) throw new Error('Falha ao buscar módulos');
  const json = await res.json() as { data: ModuleSummary[] };
  return json.data;
}

export async function fetchQuestions(
  filters: Filters & { q?: string; page?: number; limit?: number },
): Promise<Paginated<Question>> {
  const qs = buildParams(filters as Record<string, unknown>);
  const res = await fetch(`${BASE}/questions${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Falha ao buscar questões');
  return res.json() as Promise<Paginated<Question>>;
}

export async function fetchRandom(filters: Filters): Promise<Question> {
  const qs = buildParams(filters as Record<string, unknown>);
  const res = await fetch(`${BASE}/questions/random${qs ? '?' + qs : ''}`);
  if (res.status === 404) throw new Error('Nenhuma questão encontrada com esses filtros');
  if (!res.ok) throw new Error('Falha ao buscar questão aleatória');
  return res.json() as Promise<Question>;
}

export async function fetchQuestionById(id: string): Promise<Question> {
  const res = await fetch(`${BASE}/questions/${id}`);
  if (!res.ok) throw new Error('Questão não encontrada');
  return res.json() as Promise<Question>;
}

export async function fetchBatch(
  filters: Filters,
  count: number,
): Promise<Question[]> {
  const qs = buildParams({ ...filters, limit: count, page: 1 } as Record<string, unknown>);
  const res = await fetch(`${BASE}/questions${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Falha ao buscar questões');
  const json = await res.json() as Paginated<Question>;
  const questions = json.data;
  return questions.sort(() => Math.random() - 0.5);
}

export const dificuldadeLabel: Record<Dificuldade, string> = {
  facil: 'Fácil',
  intermediario: 'Intermediário',
  dificil: 'Difícil',
};

export const PARTE_TITLES: Record<number, string> = {
  1: 'Legislação de trânsito',
  2: 'Direção defensiva',
  3: 'Primeiros socorros, meio ambiente e cidadania',
  4: 'Mecânica básica',
};
