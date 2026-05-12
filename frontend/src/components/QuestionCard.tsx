import { useMemo, useState } from 'react';
import type { Question } from '../types';
import { dificuldadeLabel } from '../api/questions';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const DIFICULDADE_COLOR = {
  facil: 'bg-green-100 text-green-800',
  intermediario: 'bg-yellow-100 text-yellow-800',
  dificil: 'bg-red-100 text-red-800',
} as const;

interface Props {
  question: Question;
  showResult?: boolean;
  onAnswer?: (correct: boolean, chosen: string) => void;
  /** quando true, exibe apenas gabarito sem permitir nova escolha */
  reviewMode?: boolean;
  chosenAnswer?: string;
}

export default function QuestionCard({
  question,
  showResult = false,
  onAnswer,
  reviewMode = false,
  chosenAnswer,
}: Props) {
  const [chosen, setChosen] = useState<string | null>(chosenAnswer ?? null);
  const [answered, setAnswered] = useState(reviewMode || showResult);

  const alternatives = useMemo(() => {
    const all = [question.alternativa_correta, ...question.alternativas_incorretas];
    return all.sort(() => Math.random() - 0.5);
  }, [question.id]);

  function handleSelect(alt: string) {
    if (answered) return;
    setChosen(alt);
    setAnswered(true);
    onAnswer?.(alt === question.alternativa_correta, alt);
  }

  function altClass(alt: string) {
    if (!answered && !reviewMode) {
      return 'border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
    }
    const isCorrect = alt === question.alternativa_correta;
    const isChosen = alt === (reviewMode ? chosenAnswer : chosen);
    if (isCorrect) return 'border-green-500 bg-green-50';
    if (isChosen && !isCorrect) return 'border-red-400 bg-red-50';
    return 'border-slate-200 opacity-60';
  }

  const correct = (reviewMode ? chosenAnswer : chosen) === question.alternativa_correta;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2 flex-wrap text-xs">
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            Parte {question.parte} · Módulo {question.modulo_numero}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full ${DIFICULDADE_COLOR[question.dificuldade]}`}
          >
            {dificuldadeLabel[question.dificuldade]}
          </span>
        </div>
        <span className="text-xs text-slate-400 shrink-0">#{question.numero}</span>
      </div>

      <p className="text-slate-800 font-medium leading-relaxed">{question.enunciado}</p>

      {question.codigo_placa && (
        <p className="text-xs text-slate-500 italic">Placa: {question.codigo_placa}</p>
      )}

      <ul className="flex flex-col gap-2">
        {alternatives.map((alt, i) => (
          <li
            key={alt}
            onClick={() => handleSelect(alt)}
            className={`flex gap-3 items-start border rounded-xl px-4 py-3 text-sm transition-all ${altClass(alt)}`}
          >
            <span className="font-bold text-slate-500 shrink-0">{LETTERS[i]}.</span>
            <span>{alt}</span>
          </li>
        ))}
      </ul>

      {(answered || reviewMode) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            correct
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <p className="font-semibold mb-1">{correct ? '✅ Correto!' : '❌ Incorreto'}</p>
          <p className="text-slate-700">{question.comentario}</p>
          {!correct && (
            <p className="mt-1 text-green-700 text-xs">
              Resposta correta: {question.alternativa_correta}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400">Fonte: {question.fonte}</p>
    </div>
  );
}
