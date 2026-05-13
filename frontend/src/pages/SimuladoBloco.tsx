import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchBatch } from '../api/questions';
import QuestionCard from '../components/QuestionCard';
import { ArrowLeft, ArrowRight } from '../components/Icons';
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAnswer(questionId: string, chosen: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: chosen }));
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount >= questions.length;

  const score = useMemo(() => {
    if (status !== 'finished') return null;
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.alternativa_correta) correct++;
    }
    return { correct, total: questions.length };
  }, [status, questions, answers]);

  function finish() {
    setStatus('finished');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (status === 'loading') {
    return <div className="center-state">Carregando questões...</div>;
  }

  if (status === 'error') {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--err-ink)', fontWeight: 500 }}>{errorMsg}</p>
        <button
          className="btn btn-outline"
          onClick={() => navigate('/')}
          style={{ marginTop: 12 }}
        >
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
          <button className="btn btn-ghost" onClick={() => navigate('/')} aria-label="Voltar">
            <ArrowLeft size={14} /> Voltar
          </button>
          <div className="sim-bar-info">
            <span className="label">Modo · Bloco</span>
            <span className="value tnum">
              {answeredCount}/{questions.length} respondidas
            </span>
          </div>
        </div>
        <div className="progress-bar">
          <div style={{ width: pct + '%' }} />
        </div>
      </div>

      {status === 'finished' && score && (() => {
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
              <span className={`result-status ${approved ? 'approved' : 'failed'}`}>
                <span
                  style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}
                />
                {approved ? 'Aprovado no critério' : 'Continue praticando'}
              </span>
              <p className="result-msg">
                {approved
                  ? 'Você ficou acima dos 70%. Está no caminho — repita módulos com mais erros para fixar.'
                  : 'Faltou pouco. Revise o gabarito abaixo, foque nos módulos onde errou mais e tente de novo.'}
              </p>
              <div className="breakdown" aria-hidden="true">
                <div className="ok" style={{ width: okPct + '%' }} />
                <div className="ko" style={{ width: koPct + '%' }} />
              </div>
              <div className="result-actions">
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  Novo simulado <ArrowRight />
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                  Ver gabarito
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            total={questions.length}
            reviewMode={status === 'finished'}
            chosenAnswer={answers[q.id]}
            onAnswer={
              status === 'answering'
                ? (_correct, chosen) => handleAnswer(q.id, chosen)
                : undefined
            }
          />
        ))}
      </div>

      {status === 'answering' && allAnswered && (
        <div className="float-action">
          <button onClick={finish} className="btn btn-accent btn-lg btn-block">
            Ver gabarito <ArrowRight />
          </button>
        </div>
      )}

      {status === 'answering' && !allAnswered && (
        <p className="center-state" style={{ padding: '24px 16px' }}>
          Responda todas as questões para ver o gabarito ({questions.length - answeredCount} restantes).
        </p>
      )}
    </div>
  );
}
