import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchRandom } from '../api/questions';
import QuestionCard from '../components/QuestionCard';
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
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    loadNext();
  }, []);

  function handleAnswer(correct: boolean) {
    setAnswered(true);
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header com placar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Voltar
        </button>
        <div className="text-sm text-slate-600">
          {score.total > 0 && (
            <span>
              Acertos:{' '}
              <strong className="text-green-600">
                {score.correct}/{score.total}
              </strong>
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-slate-400">Carregando questão...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
          <p className="font-medium">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-sm underline"
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-base transition-colors"
        >
          Próxima questão →
        </button>
      )}
    </div>
  );
}
