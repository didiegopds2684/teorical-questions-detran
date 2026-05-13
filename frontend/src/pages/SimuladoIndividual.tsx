import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchRandom } from '../api/questions';
import QuestionCard from '../components/QuestionCard';
import { ArrowLeft, ArrowRight } from '../components/Icons';
import type { Filters, Question } from '../types';

export default function SimuladoIndividual() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const filters: Filters = {
    parte: searchParams.get('parte') ? Number(searchParams.get('parte')) : undefined,
    modulo_numero: searchParams.get('modulo_numero')
      ? Number(searchParams.get('modulo_numero'))
      : undefined,
    dificuldade: (searchParams.get('dificuldade') as Filters['dificuldade']) || undefined,
  };

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const loadNext = useCallback(() => {
    setLoading(true);
    setError('');
    setAnswered(false);
    fetchRandom(filters)
      .then(setQuestion)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    loadNext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAnswer(correct: boolean) {
    setAnswered(true);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : null;

  return (
    <div>
      <div className="sim-bar">
        <div className="sim-bar-left">
          <button className="btn btn-ghost" onClick={() => navigate('/')} aria-label="Voltar">
            <ArrowLeft size={14} /> Voltar
          </button>
          <div className="sim-bar-info">
            <span className="label">Modo</span>
            <span className="value">Questão por questão</span>
          </div>
        </div>
        <span className={`score-bubble ${score.total === 0 ? 'empty' : ''}`}>
          {score.total === 0
            ? 'Aguardando'
            : `${score.correct}/${score.total} · ${accuracy}%`}
        </span>
      </div>

      {loading && <div className="center-state">Carregando questão...</div>}

      {error && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--err-ink)', fontWeight: 500 }}>{error}</p>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/')}
            style={{ marginTop: 12 }}
          >
            Ajustar filtros
          </button>
        </div>
      )}

      {question && !loading && (
        <QuestionCard question={question} onAnswer={handleAnswer} />
      )}

      {answered && !loading && (
        <button
          onClick={loadNext}
          className="btn btn-accent btn-lg btn-block"
          style={{ marginTop: 20 }}
        >
          Próxima questão
          <ArrowRight />
        </button>
      )}
    </div>
  );
}
