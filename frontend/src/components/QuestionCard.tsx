import { useEffect, useMemo, useState } from 'react';
import type { Question } from '../types';
import { Check, X } from './Icons';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const DIFFICULTY_TAG: Record<string, { cls: string; label: string }> = {
  facil: { cls: 'tag tag-accent', label: 'Fácil' },
  intermediario: { cls: 'tag tag-warn', label: 'Intermediário' },
  dificil: { cls: 'tag tag-err', label: 'Difícil' },
};

interface Props {
  question: Question;
  onAnswer?: (correct: boolean, chosen: string) => void;
  reviewMode?: boolean;
  chosenAnswer?: string;
  index?: number;
  total?: number;
}

function seededShuffle(arr: string[], seed: number): string[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = (seed + i * 31) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function PlacaImg({ codigo }: { codigo: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className="q-placa-img q-placa-img--fallback">{codigo}</div>;
  }
  return (
    <img
      src={`/placas/${codigo}.svg`}
      alt={`Placa ${codigo}`}
      className="q-placa-img"
      onError={() => setFailed(true)}
    />
  );
}

export default function QuestionCard({
  question,
  onAnswer,
  reviewMode = false,
  chosenAnswer,
  index,
  total,
}: Props) {
  const [chosen, setChosen] = useState<string | null>(chosenAnswer ?? null);
  const [answered, setAnswered] = useState(reviewMode);

  useEffect(() => {
    setChosen(chosenAnswer ?? null);
    setAnswered(reviewMode);
    // chosenAnswer intentionally omitted — only sync on question/mode change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, reviewMode]);

  const alternatives = useMemo(() => {
    const all = [question.alternativa_correta, ...question.alternativas_incorretas];
    const seed = question.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return seededShuffle(all, seed);
  }, [question.id]);

  function handleSelect(alt: string) {
    if (answered) return;
    setChosen(alt);
    setAnswered(true);
    onAnswer?.(alt === question.alternativa_correta, alt);
  }

  function altState(alt: string): string | undefined {
    const sel = reviewMode ? chosenAnswer : chosen;
    if (!answered) return undefined;
    if (alt === question.alternativa_correta) return 'correct';
    if (alt === sel) return 'wrong';
    return 'dim';
  }

  const isCorrect = (reviewMode ? chosenAnswer : chosen) === question.alternativa_correta;
  const diff = DIFFICULTY_TAG[question.dificuldade] ?? DIFFICULTY_TAG.facil;

  const plaqueta =
    index !== undefined
      ? `${String(index + 1).padStart(2, '0')}${total !== undefined ? ' / ' + String(total).padStart(2, '0') : ''}`
      : `Nº ${String(question.numero).padStart(3, '0')}`;

  return (
    <article className="question">
      <header className="q-header">
        <div className="q-tags">
          <span className="plaqueta">{plaqueta}</span>
          <span className="tag">
            Parte {question.parte} · M{question.modulo_numero}
          </span>
          <span className={diff.cls}>{diff.label}</span>
        </div>
        <span className="tag">{question.modulo_titulo}</span>
      </header>

      <h2 className="q-enunciado">{question.enunciado}</h2>

      {question.codigo_placa && (
        <div className="q-placa">
          {question.codigo_placa.split(' e ').map((code) => (
            <PlacaImg key={code} codigo={code.trim()} />
          ))}
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
                data-state={state ?? (isSelected ? 'selected' : undefined)}
              >
                <span className="alt-letter">{LETTERS[i]}</span>
                <span className="alt-text">{alt}</span>
                <span className="alt-mark">
                  {state === 'correct' && <Check size={12} />}
                  {state === 'wrong' && <X size={12} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          <span className="feedback-glyph">
            {isCorrect ? <Check size={16} /> : <X size={14} />}
          </span>
          <div>
            <p className="feedback-title">
              {isCorrect ? 'Resposta correta' : 'Não foi dessa vez'}
            </p>
            <p className="feedback-body">{question.comentario}</p>
            {!isCorrect && (
              <p className="feedback-hint">
                Resposta correta: {question.alternativa_correta}
              </p>
            )}
          </div>
        </div>
      )}

      <footer className="q-footer">
        <span>Fonte · {question.fonte}</span>
        <span>#{question.id.split('-')[0]}{question.numero}</span>
      </footer>
    </article>
  );
}
