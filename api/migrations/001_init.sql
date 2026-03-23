CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  parte INTEGER NOT NULL,
  modulo_numero INTEGER NOT NULL,
  modulo_titulo TEXT NOT NULL,
  numero INTEGER NOT NULL,
  dificuldade TEXT NOT NULL CHECK (dificuldade IN ('facil', 'intermediario', 'dificil')),
  enunciado TEXT NOT NULL,
  codigo_placa TEXT,
  alternativa_correta TEXT NOT NULL,
  comentario TEXT NOT NULL,
  alternativas_incorretas TEXT[] NOT NULL,
  fonte TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_parte ON questions (parte);
CREATE INDEX IF NOT EXISTS idx_questions_modulo ON questions (modulo_numero);
CREATE INDEX IF NOT EXISTS idx_questions_dificuldade ON questions (dificuldade);
