// Pages — Home, Modules, SimuladoIndividual, SimuladoBloco
// All rendered inside <Layout> via the tiny hash-router in app.jsx.

const BATCH_OPTIONS = [5, 10, 20, 30];

// =========================== Home ============================================

function Home({ navigate }) {
  const [mode, setMode] = React.useState("individual");
  const [filters, setFilters] = React.useState({});
  const [batchCount, setBatchCount] = React.useState(10);

  function start() {
    const params = new URLSearchParams();
    if (filters.parte) params.set("parte", String(filters.parte));
    if (filters.modulo_numero) params.set("modulo_numero", String(filters.modulo_numero));
    if (filters.dificuldade) params.set("dificuldade", filters.dificuldade);
    if (mode === "bloco") params.set("count", String(batchCount));
    navigate((mode === "individual" ? "/simulado" : "/simulado/bloco") + "?" + params.toString());
  }

  const totalQuestoes = window.MODULES.reduce((s, m) => s + m.question_count, 0);
  const totalModulos = window.MODULES.length;

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="lane-mini"></span>
          <span className="eyebrow">Banco de questões</span>
        </div>
        <h1 className="hero-title">Estude no seu ritmo. <em>Vá em frente.</em></h1>
        <p className="hero-sub">
          Treine para a prova teórica com questões organizadas por parte, módulo e dificuldade.
          Escolha o ritmo e o tipo de simulado abaixo.
        </p>
      </section>

      {/* Stats */}
      <div className="stats-strip" style={{ marginTop: 28 }}>
        <div className="stat">
          <div className="stat-label">Questões disponíveis</div>
          <div className="stat-value tnum">{totalQuestoes}<small>no banco</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">Módulos</div>
          <div className="stat-value tnum">{totalModulos}<small>cobertos</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">Última sessão</div>
          <div className="stat-value tnum">82<span className="pct-sign">%</span></div>
        </div>
      </div>

      {/* Modo */}
      <div className="section-title">
        <h2>01 — Escolha o modo</h2>
        <span className="lane-line"></span>
      </div>
      <div className="modes">
        <button onClick={() => setMode("individual")} className={`mode ${mode === "individual" ? "active" : ""}`}>
          <span className="mode-glyph"><Icon.Target /></span>
          <div>
            <div className="mode-title">Questão por questão</div>
            <div className="mode-desc">Feedback imediato após cada resposta. Ideal pra estudar pelo comentário.</div>
          </div>
        </button>
        <button onClick={() => setMode("bloco")} className={`mode ${mode === "bloco" ? "active" : ""}`}>
          <span className="mode-glyph"><Icon.Stack /></span>
          <div>
            <div className="mode-title">Bloco de questões</div>
            <div className="mode-desc">Responda tudo de uma vez e veja o gabarito no final — simula a prova real.</div>
          </div>
        </button>
      </div>

      {/* Filtros */}
      <div className="section-title">
        <h2>02 — Refine (opcional)</h2>
        <span className="lane-line"></span>
      </div>
      <div className="card">
        <FilterPanel value={filters} onChange={setFilters} />
        {mode === "bloco" && (
          <>
            <hr className="lane" style={{ margin: "20px 0" }} />
            <div className="field" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="field-label">Quantas questões?</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-3)", marginTop: 2 }}>
                  A prova oficial costuma ter 30.
                </div>
              </div>
              <div className="chips">
                {BATCH_OPTIONS.map((n) => (
                  <button key={n} onClick={() => setBatchCount(n)} className={`chip ${batchCount === n ? "active" : ""}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <button onClick={start} className="btn btn-accent btn-lg btn-block" style={{ marginTop: 28 }}>
        Começar simulado
        <Icon.ArrowRight />
      </button>
    </div>
  );
}

// =========================== Modules =========================================

function ModulesPage({ navigate }) {
  const [modules, setModules] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    window.fetchModules().then((m) => {
      setModules(m);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="center-state">Carregando módulos...</div>;

  const partes = [...new Set(modules.map((m) => m.parte))].sort((a, b) => a - b);

  function startModule(m) {
    const params = new URLSearchParams({
      parte: String(m.parte),
      modulo_numero: String(m.modulo_numero),
    });
    navigate("/simulado?" + params.toString());
  }

  // mock progress per module (deterministic by parte+modulo so it doesn't jump)
  function mockProgress(m) {
    return ((m.parte * 17 + m.modulo_numero * 41) % 100);
  }

  return (
    <div>
      <div className="page-intro">
        <div className="lane-stripe"><span></span><span></span><span></span></div>
        <h1>Módulos</h1>
        <p>Escolha um módulo específico para focar seus estudos. O simulado será individual com filtro aplicado.</p>
      </div>

      {partes.map((parte) => (
        <section key={parte} className="parte-section">
          <div className="parte-header">
            <h2>
              <em>Parte {String(parte).padStart(2, "0")}</em>
              {window.PARTE_TITLES[parte]}
            </h2>
            <span className="eyebrow">
              {modules.filter((m) => m.parte === parte).length} módulos
            </span>
          </div>
          <div>
            {modules.filter((m) => m.parte === parte).map((m) => {
              const pct = mockProgress(m);
              return (
                <button key={m.modulo_numero} className="module-row" onClick={() => startModule(m)}>
                  <span className="module-num">{String(m.modulo_numero).padStart(2, "0")}</span>
                  <div>
                    <div className="module-title">{m.modulo_titulo}</div>
                    <div className="module-meta">{m.question_count} questões · último: {pct}%</div>
                  </div>
                  <div className="module-progress">
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: pct + "%" }}></div>
                    </div>
                    <span className="module-arrow"><Icon.ArrowRight size={12} /></span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// =========================== SimuladoIndividual ==============================

function parseFilters(qs) {
  const sp = new URLSearchParams(qs);
  return {
    parte: sp.get("parte") ? Number(sp.get("parte")) : undefined,
    modulo_numero: sp.get("modulo_numero") ? Number(sp.get("modulo_numero")) : undefined,
    dificuldade: sp.get("dificuldade") || undefined,
    count: sp.get("count") ? Number(sp.get("count")) : 10,
  };
}

function SimuladoIndividual({ navigate, query }) {
  const filters = parseFilters(query);
  const [question, setQuestion] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [answered, setAnswered] = React.useState(false);
  const [score, setScore] = React.useState({ correct: 0, total: 0 });

  const loadNext = React.useCallback(() => {
    setLoading(true); setError(""); setAnswered(false);
    window.fetchRandom(filters)
      .then(setQuestion)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query]);

  React.useEffect(() => { loadNext(); }, []);

  function handleAnswer(correct) {
    setAnswered(true);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : null;

  return (
    <div>
      <div className="sim-bar">
        <div className="sim-bar-left">
          <button className="btn btn-ghost" onClick={() => navigate("/")} aria-label="Voltar">
            <Icon.ArrowLeft size={14} /> Voltar
          </button>
          <div className="sim-bar-info">
            <span className="label">Modo</span>
            <span className="value">Questão por questão</span>
          </div>
        </div>
        <span className={`score-bubble ${score.total === 0 ? "empty" : ""}`}>
          {score.total === 0 ? "Aguardando" : `${score.correct}/${score.total} · ${accuracy}%`}
        </span>
      </div>

      {loading && <div className="center-state">Carregando questão...</div>}

      {error && (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--err-ink)", fontWeight: 500 }}>{error}</p>
          <button className="btn btn-outline" onClick={() => navigate("/")} style={{ marginTop: 12 }}>
            Ajustar filtros
          </button>
        </div>
      )}

      {question && !loading && (
        <QuestionCard question={question} onAnswer={handleAnswer} />
      )}

      {answered && !loading && (
        <button onClick={loadNext} className="btn btn-accent btn-lg btn-block" style={{ marginTop: 20 }}>
          Próxima questão
          <Icon.ArrowRight />
        </button>
      )}
    </div>
  );
}

// =========================== SimuladoBloco ===================================

function SimuladoBloco({ navigate, query }) {
  const filters = parseFilters(query);
  const count = filters.count;
  const [questions, setQuestions] = React.useState([]);
  const [answers, setAnswers] = React.useState({});
  const [status, setStatus] = React.useState("loading");
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    window.fetchBatch(filters, count)
      .then((qs) => { setQuestions(qs); setStatus("answering"); })
      .catch((e) => { setErrorMsg(e.message); setStatus("error"); });
  }, []);

  function handleAnswer(qid, chosen) {
    setAnswers((prev) => ({ ...prev, [qid]: chosen }));
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount >= questions.length;
  const score = React.useMemo(() => {
    if (status !== "finished") return null;
    let correct = 0;
    for (const q of questions) if (answers[q.id] === q.alternativa_correta) correct++;
    return { correct, total: questions.length };
  }, [status, questions, answers]);

  function finish() {
    setStatus("finished");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (status === "loading") return <div className="center-state">Carregando questões...</div>;
  if (status === "error") {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p style={{ color: "var(--err-ink)", fontWeight: 500 }}>{errorMsg}</p>
        <button className="btn btn-outline" onClick={() => navigate("/")} style={{ marginTop: 12 }}>
          Voltar ao início
        </button>
      </div>
    );
  }

  const pct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div>
      <div className="sim-bar">
        <div className="sim-bar-left">
          <button className="btn btn-ghost" onClick={() => navigate("/")} aria-label="Voltar">
            <Icon.ArrowLeft size={14} /> Voltar
          </button>
          <div className="sim-bar-info">
            <span className="label">Modo · Bloco</span>
            <span className="value tnum">{answeredCount}/{questions.length} respondidas</span>
          </div>
        </div>
        <div className="progress-bar">
          <div style={{ width: pct + "%" }}></div>
        </div>
      </div>

      {status === "finished" && score && (() => {
        const pctScore = Math.round((score.correct / score.total) * 100);
        const approved = score.correct / score.total >= 0.7;
        const okPct = (score.correct / score.total) * 100;
        const koPct = 100 - okPct;
        return (
          <div className="result">
            <div className="result-score">
              <div className="result-pct tnum">
                {pctScore}<span className="pct-sign">%</span>
              </div>
              <div className="result-frac">{score.correct} de {score.total} acertos</div>
            </div>
            <div className="result-content">
              <span className={`result-status ${approved ? "approved" : "failed"}`}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>
                {approved ? "Aprovado no critério" : "Continue praticando"}
              </span>
              <p className="result-msg">
                {approved
                  ? "Você ficou acima dos 70%. Está no caminho — repita módulos com mais erros para fixar."
                  : "Faltou pouco. Revise o gabarito abaixo, foque nos módulos onde errou mais e tente de novo."}
              </p>
              <div className="breakdown" aria-hidden="true">
                <div className="ok" style={{ width: okPct + "%" }}></div>
                <div className="ko" style={{ width: koPct + "%" }}></div>
              </div>
              <div className="result-actions">
                <button className="btn btn-primary" onClick={() => navigate("/")}>
                  Novo simulado
                  <Icon.ArrowRight />
                </button>
                <button className="btn btn-outline" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
                  Ver gabarito
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            total={questions.length}
            reviewMode={status === "finished"}
            chosenAnswer={answers[q.id]}
            onAnswer={status === "answering" ? (_correct, chosen) => handleAnswer(q.id, chosen) : undefined}
          />
        ))}
      </div>

      {status === "answering" && allAnswered && (
        <div className="float-action">
          <button onClick={finish} className="btn btn-accent btn-lg btn-block">
            Ver gabarito
            <Icon.ArrowRight />
          </button>
        </div>
      )}
      {status === "answering" && !allAnswered && (
        <p className="center-state" style={{ padding: "24px 16px" }}>
          Responda todas as questões para ver o gabarito ({questions.length - answeredCount} restantes).
        </p>
      )}
    </div>
  );
}

window.Home = Home;
window.ModulesPage = ModulesPage;
window.SimuladoIndividual = SimuladoIndividual;
window.SimuladoBloco = SimuladoBloco;
