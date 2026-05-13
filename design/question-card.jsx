// QuestionCard — displays a single question with alternatives, optional
// feedback, and review mode for batch (bloco) gabarito.

const LETTERS = ["A", "B", "C", "D", "E"];

const DIFFICULTY_TAG = {
  facil:          { cls: "tag tag-accent",    label: "Fácil" },
  intermediario:  { cls: "tag tag-warn",      label: "Intermediário" },
  dificil:        { cls: "tag tag-err",       label: "Difícil" },
};

function QuestionCard({ question, onAnswer, reviewMode = false, chosenAnswer, index = null, total = null }) {
  const [chosen, setChosen] = React.useState(chosenAnswer ?? null);
  const [answered, setAnswered] = React.useState(reviewMode);

  React.useEffect(() => {
    setChosen(chosenAnswer ?? null);
    setAnswered(reviewMode);
  }, [question.id, reviewMode]);

  // Shuffle alternatives stable per question
  const alternatives = React.useMemo(() => {
    const all = [question.alternativa_correta, ...question.alternativas_incorretas];
    // simple seeded shuffle by id length for stability across re-renders
    const seed = question.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const arr = [...all];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (seed + i * 31) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [question.id]);

  function handleSelect(alt) {
    if (answered) return;
    setChosen(alt);
    setAnswered(true);
    onAnswer?.(alt === question.alternativa_correta, alt);
  }

  function altState(alt) {
    const sel = reviewMode ? chosenAnswer : chosen;
    if (!answered) return null;
    const isCorrect = alt === question.alternativa_correta;
    const isChosen = alt === sel;
    if (isCorrect) return "correct";
    if (isChosen && !isCorrect) return "wrong";
    return "dim";
  }

  const correct = (reviewMode ? chosenAnswer : chosen) === question.alternativa_correta;
  const diff = DIFFICULTY_TAG[question.dificuldade] || DIFFICULTY_TAG.facil;

  return (
    <article className="question">
      <header className="q-header">
        <div className="q-tags">
          <span className="plaqueta">
            {index !== null
              ? `${String(index + 1).padStart(2, "0")}${total ? " / " + String(total).padStart(2, "0") : ""}`
              : `Nº ${String(question.numero).padStart(3, "0")}`}
          </span>
          <span className="tag">Parte {question.parte} · M{question.modulo_numero}</span>
          <span className={diff.cls}>{diff.label}</span>
        </div>
        <span className="tag">{question.modulo_titulo}</span>
      </header>

      <h2 className="q-enunciado">{question.enunciado}</h2>

      {question.codigo_placa && (
        <div className="q-placa">
          <div className="q-placa-img">placa</div>
          <div className="q-placa-info">
            <span className="q-placa-label">Placa referida</span>
            <span className="q-placa-code">{question.codigo_placa}</span>
          </div>
        </div>
      )}

      <ul className="alts" role="radiogroup" aria-label="Alternativas">
        {alternatives.map((alt, i) => {
          const state = altState(alt);
          const sel = reviewMode ? chosenAnswer : chosen;
          const isSelected = !answered && alt === sel;
          return (
            <li key={alt}>
              <button
                type="button"
                role="radio"
                aria-checked={alt === sel}
                disabled={answered}
                onClick={() => handleSelect(alt)}
                className="alt"
                data-state={state || (isSelected ? "selected" : "")}
              >
                <span className="alt-letter">{LETTERS[i]}</span>
                <span className="alt-text">{alt}</span>
                <span className="alt-mark">
                  {state === "correct" && <Icon.Check size={12} />}
                  {state === "wrong" && <Icon.X size={12} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div className={`feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}>
          <span className="feedback-glyph">
            {correct ? <Icon.Check size={16} /> : <Icon.X size={14} />}
          </span>
          <div>
            <p className="feedback-title">{correct ? "Resposta correta" : "Não foi dessa vez"}</p>
            <p className="feedback-body">{question.comentario}</p>
            {!correct && (
              <p className="feedback-hint">
                Resposta correta: {question.alternativa_correta}
              </p>
            )}
          </div>
        </div>
      )}

      <footer className="q-footer">
        <span>Fonte · {question.fonte}</span>
        <span>#{question.id.split("-")[0]}{question.numero}</span>
      </footer>
    </article>
  );
}

window.QuestionCard = QuestionCard;
