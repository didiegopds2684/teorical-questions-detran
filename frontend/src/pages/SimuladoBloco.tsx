import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchBatch } from '../api/questions';
import QuestionCard from '../components/QuestionCard';
import type { Filters, Question } from '../types';

type Status = 'loading' | 'answering' | 'finished' | 'error';

export default function SimuladoBloco() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const filters: Filters = {
    parte: searchParams.get('parte') ? Number(searchParams.get('parte')) : undefined,
    modulo_numero: searchParams.get('modulo_numero')
      ? Number(searchParams.get('modulo_numero'))
      : undefined,
    dificuldade: (searchParams.get('dificuldade') as Filters['dificuldade']) || undefined,
  };
  const count = Number(searchParams.get('count')) || 10;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBatch(filters, count)
      .then((qs) => {
        setQuestions(qs);
        setStatus('answering');
      })
      .catch((e: Error) => {
        setErrorMsg(e.message);
        setStatus('error');
      });
  }, []);

  function handleAnswer(questionId: string, chosen: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: chosen }));
  }

  const allAnswered = questions.length > 0 && Object.keys(answers).length >= questions.length;

  const score = useMemo(() => {
    if (status !== 'finished') return null;
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.alternativa_correta) correct++;
    }
    return { correct, total: questions.length };
  }, [status]);

  function finish() {
    setStatus('finished');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (status === 'loading') {
    return <div className="text-center py-16 text-slate-400">Carregando questões...</div>;
  }

  if (status === 'error') {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium">{errorMsg}</p>
        <button onClick={() => navigate('/')} className="mt-3 text-blue-600 underline text-sm">
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar
        </button>
        <span className="text-sm text-slate-500">
          {Object.keys(answers).length}/{questions.length} respondidas
        </span>
      </div>

      {/* Placar final */}
      {status === 'finished' && score && (
        <div
          className={`rounded-2xl p-6 text-center border-2 ${
            score.correct / score.total >= 0.7
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          <p className="text-4xl font-bold">
            {score.correct}/{score.total}
          </p>
          <p className="text-lg mt-1">
            {Math.round((score.correct / score.total) * 100)}% de acertos
          </p>
          <p className="text-slate-500 mt-1">
            {score.correct / score.total >= 0.7 ? '🎉 Aprovado!' : '😓 Continue praticando'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
          >
            Novo simulado
          </button>
        </div>
      )}

      {/* Questões */}
      {questions.map((q, i) => (
        <div key={q.id}>
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            Questão {i + 1}
          </p>
          <QuestionCard
            question={q}
            reviewMode={status === 'finished'}
            chosenAnswer={answers[q.id]}
            onAnswer={status === 'answering' ? (_correct, chosen) => handleAnswer(q.id, chosen) : undefined}
          />
        </div>
      ))}

      {/* Botão finalizar */}
      {status === 'answering' && allAnswered && (
        <button
          onClick={finish}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
        >
          Ver gabarito →
        </button>
      )}

      {status === 'answering' && !allAnswered && (
        <p className="text-center text-sm text-slate-400">
          Responda todas as questões para ver o gabarito
        </p>
      )}
    </div>
  );
}
