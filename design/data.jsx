// Mock data — mirrors the Question / ModuleSummary shapes in frontend/src/types.ts

const MODULES = [
  // Parte 1 — Legislação de Trânsito
  { parte: 1, modulo_numero: 1, modulo_titulo: "Princípios do CTB", question_count: 18 },
  { parte: 1, modulo_numero: 2, modulo_titulo: "Sinalização de trânsito", question_count: 32 },
  { parte: 1, modulo_numero: 3, modulo_titulo: "Normas gerais de circulação", question_count: 26 },
  { parte: 1, modulo_numero: 4, modulo_titulo: "Infrações e penalidades", question_count: 21 },
  { parte: 1, modulo_numero: 5, modulo_titulo: "Habilitação e CNH", question_count: 14 },

  // Parte 2 — Direção Defensiva
  { parte: 2, modulo_numero: 1, modulo_titulo: "Princípios da direção defensiva", question_count: 16 },
  { parte: 2, modulo_numero: 2, modulo_titulo: "Acidentes — causas e prevenção", question_count: 19 },
  { parte: 2, modulo_numero: 3, modulo_titulo: "Condições adversas", question_count: 12 },

  // Parte 3 — Primeiros socorros, meio ambiente e cidadania
  { parte: 3, modulo_numero: 1, modulo_titulo: "Primeiros socorros", question_count: 14 },
  { parte: 3, modulo_numero: 2, modulo_titulo: "Meio ambiente e cidadania", question_count: 10 },

  // Parte 4 — Mecânica básica
  { parte: 4, modulo_numero: 1, modulo_titulo: "Manutenção preventiva", question_count: 9 },
  { parte: 4, modulo_numero: 2, modulo_titulo: "Veículo: itens de segurança", question_count: 11 },
];

const PARTE_TITLES = {
  1: "Legislação de trânsito",
  2: "Direção defensiva",
  3: "Primeiros socorros, meio ambiente e cidadania",
  4: "Mecânica básica",
};

// Realistic-ish questions inspired by the type of content covered. Generic — no
// branding, no specific exam content reproduction.
const QUESTIONS = [
  {
    id: "q-001",
    parte: 1, modulo_numero: 2, modulo_titulo: "Sinalização de trânsito",
    numero: 12, dificuldade: "facil",
    enunciado: "Uma placa com fundo amarelo, forma de losango e bordas pretas tem qual função na via?",
    codigo_placa: "A-13a",
    alternativa_correta: "Advertir o condutor sobre uma condição perigosa à frente.",
    alternativas_incorretas: [
      "Regulamentar a velocidade máxima permitida.",
      "Indicar serviços auxiliares disponíveis.",
      "Sinalizar obras temporárias na pista.",
    ],
    comentario: "Placas de advertência usam fundo amarelo e forma de losango para alertar o condutor sobre situações que exigem atenção.",
    fonte: "CTB Art. 87 / CONTRAN",
  },
  {
    id: "q-002",
    parte: 1, modulo_numero: 3, modulo_titulo: "Normas gerais de circulação",
    numero: 5, dificuldade: "intermediario",
    enunciado: "Em uma via de mão dupla sem sinalização específica, quem deve ter preferência ao realizar uma conversão à esquerda?",
    codigo_placa: null,
    alternativa_correta: "O veículo que vem em sentido contrário, que segue em frente.",
    alternativas_incorretas: [
      "O veículo que está realizando a conversão.",
      "Sempre o veículo de maior porte.",
      "O veículo mais próximo do cruzamento.",
    ],
    comentario: "O condutor que vai realizar conversão à esquerda deve aguardar a passagem dos veículos em sentido contrário que seguem em frente.",
    fonte: "CTB Art. 38",
  },
  {
    id: "q-003",
    parte: 2, modulo_numero: 1, modulo_titulo: "Princípios da direção defensiva",
    numero: 3, dificuldade: "facil",
    enunciado: "Qual o principal objetivo da direção defensiva?",
    codigo_placa: null,
    alternativa_correta: "Evitar acidentes apesar das ações incorretas de terceiros e das condições adversas.",
    alternativas_incorretas: [
      "Ganhar tempo durante o trajeto.",
      "Demonstrar habilidade de manobra.",
      "Reduzir o consumo de combustível.",
    ],
    comentario: "Direção defensiva é dirigir de modo a evitar acidentes, mesmo diante de erros de outros condutores e condições adversas.",
    fonte: "DENATRAN — Direção Defensiva",
  },
  {
    id: "q-004",
    parte: 3, modulo_numero: 1, modulo_titulo: "Primeiros socorros",
    numero: 8, dificuldade: "dificil",
    enunciado: "Ao chegar ao local de um acidente, qual é a primeira ação que um condutor deve tomar antes de prestar socorro?",
    codigo_placa: null,
    alternativa_correta: "Sinalizar a via para evitar novos acidentes e acionar o socorro especializado.",
    alternativas_incorretas: [
      "Mover imediatamente as vítimas para o acostamento.",
      "Iniciar massagem cardíaca em todas as vítimas.",
      "Registrar fotos para o boletim de ocorrência.",
    ],
    comentario: "A sinalização do local e o acionamento do socorro são prioritários — mover vítimas pode agravar lesões na coluna.",
    fonte: "Manual de Primeiros Socorros — DENATRAN",
  },
  {
    id: "q-005",
    parte: 1, modulo_numero: 4, modulo_titulo: "Infrações e penalidades",
    numero: 14, dificuldade: "intermediario",
    enunciado: "Dirigir sob a influência de álcool, com concentração superior à permitida, é classificada como qual tipo de infração?",
    codigo_placa: null,
    alternativa_correta: "Infração gravíssima, com multa multiplicada e suspensão do direito de dirigir.",
    alternativas_incorretas: [
      "Infração média, sem suspensão.",
      "Infração grave, apenas com multa simples.",
      "Infração leve, com advertência por escrito.",
    ],
    comentario: "Conduzir sob efeito de álcool acima do permitido é infração gravíssima (CTB Art. 165), com multa multiplicada por dez e suspensão da CNH.",
    fonte: "CTB Art. 165",
  },
  {
    id: "q-006",
    parte: 1, modulo_numero: 2, modulo_titulo: "Sinalização de trânsito",
    numero: 21, dificuldade: "facil",
    enunciado: "Uma placa octogonal vermelha com a inscrição em branco indica:",
    codigo_placa: "R-1",
    alternativa_correta: "Parada obrigatória — o condutor deve parar completamente antes de prosseguir.",
    alternativas_incorretas: [
      "Dê a preferência — reduzir e seguir se possível.",
      "Proibido virar à direita.",
      "Sentido obrigatório em frente.",
    ],
    comentario: "A placa R-1 é a única octogonal e impõe a parada obrigatória do veículo antes da via transversal.",
    fonte: "CONTRAN — Manual de Sinalização Vertical",
  },
  {
    id: "q-007",
    parte: 2, modulo_numero: 3, modulo_titulo: "Condições adversas",
    numero: 6, dificuldade: "intermediario",
    enunciado: "Durante chuva forte, qual a conduta correta para manter a segurança?",
    codigo_placa: null,
    alternativa_correta: "Reduzir a velocidade, aumentar a distância de seguimento e acender os faróis baixos.",
    alternativas_incorretas: [
      "Acionar o pisca-alerta enquanto trafega.",
      "Manter a velocidade e usar farol alto.",
      "Frear com força para evitar aquaplanagem.",
    ],
    comentario: "Em chuva, a aderência diminui — reduzir velocidade, manter distância e usar farol baixo é a combinação recomendada. Pisca-alerta em movimento é proibido.",
    fonte: "DENATRAN — Direção Defensiva",
  },
  {
    id: "q-008",
    parte: 4, modulo_numero: 1, modulo_titulo: "Manutenção preventiva",
    numero: 4, dificuldade: "facil",
    enunciado: "Qual item deve ser verificado regularmente para garantir aderência do veículo na pista?",
    codigo_placa: null,
    alternativa_correta: "A profundidade dos sulcos dos pneus e a calibragem.",
    alternativas_incorretas: [
      "O nível do limpador de para-brisa.",
      "A cor da tinta do veículo.",
      "O alinhamento do retrovisor interno.",
    ],
    comentario: "Pneus em boas condições — com sulco mínimo de 1,6 mm e calibragem adequada — são essenciais para a aderência e a frenagem.",
    fonte: "Resolução CONTRAN 558/80",
  },
];

// Helpers — mirror frontend/src/api/questions.ts API surface
const dificuldadeLabel = {
  facil: "Fácil",
  intermediario: "Intermediário",
  dificil: "Difícil",
};

function applyFilters(qs, filters) {
  return qs.filter((q) => {
    if (filters.parte && q.parte !== filters.parte) return false;
    if (filters.modulo_numero && q.modulo_numero !== filters.modulo_numero) return false;
    if (filters.dificuldade && q.dificuldade !== filters.dificuldade) return false;
    return true;
  });
}

function fetchModules() {
  return Promise.resolve(MODULES);
}
function fetchRandom(filters) {
  const pool = applyFilters(QUESTIONS, filters);
  if (!pool.length) return Promise.reject(new Error("Nenhuma questão encontrada para esses filtros."));
  const q = pool[Math.floor(Math.random() * pool.length)];
  return Promise.resolve(q);
}
function fetchBatch(filters, count) {
  const pool = applyFilters(QUESTIONS, filters);
  if (!pool.length) return Promise.reject(new Error("Nenhuma questão encontrada para esses filtros."));
  // shuffle + cycle to fill `count`
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const out = [];
  let i = 0;
  while (out.length < count) {
    out.push({ ...shuffled[i % shuffled.length], id: `${shuffled[i % shuffled.length].id}-${out.length}` });
    i++;
  }
  return Promise.resolve(out);
}

Object.assign(window, {
  MODULES, QUESTIONS, PARTE_TITLES,
  dificuldadeLabel, applyFilters,
  fetchModules, fetchRandom, fetchBatch,
});
