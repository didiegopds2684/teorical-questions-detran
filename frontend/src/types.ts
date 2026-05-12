export type Dificuldade = 'facil' | 'intermediario' | 'dificil';

export interface Question {
  id: string;
  parte: number;
  modulo_numero: number;
  modulo_titulo: string;
  numero: number;
  dificuldade: Dificuldade;
  enunciado: string;
  codigo_placa: string | null;
  alternativa_correta: string;
  comentario: string;
  alternativas_incorretas: string[];
  fonte: string;
}

export interface ModuleSummary {
  parte: number;
  modulo_numero: number;
  modulo_titulo: string;
  question_count: number;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface Filters {
  parte?: number;
  modulo_numero?: number;
  dificuldade?: Dificuldade;
}
