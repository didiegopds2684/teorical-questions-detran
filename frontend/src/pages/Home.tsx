import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterPanel from '../components/FilterPanel';
import type { Filters } from '../types';

type Mode = 'individual' | 'bloco';

const BATCH_OPTIONS = [5, 10, 20, 30];

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('individual');
  const [filters, setFilters] = useState<Filters>({});
  const [batchCount, setBatchCount] = useState(10);

  function start() {
    const params = new URLSearchParams();
    if (filters.parte) params.set('parte', String(filters.parte));
    if (filters.modulo_numero) params.set('modulo_numero', String(filters.modulo_numero));
    if (filters.dificuldade) params.set('dificuldade', filters.dificuldade);
    if (mode === 'bloco') params.set('count', String(batchCount));

    const route = mode === 'individual' ? '/simulado' : '/simulado/bloco';
    navigate(`${route}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Simulado Detran</h1>
        <p className="text-slate-500 mt-2">Escolha o modo e os filtros para começar</p>
      </div>

      {/* Modo */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMode('individual')}
          className={`rounded-2xl border-2 p-5 text-left transition-all ${
            mode === 'individual'
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="text-2xl mb-2">🎯</div>
          <div className="font-semibold text-slate-800">Questão por questão</div>
          <div className="text-sm text-slate-500 mt-1">
            Veja o resultado imediatamente após cada resposta
          </div>
        </button>

        <button
          onClick={() => setMode('bloco')}
          className={`rounded-2xl border-2 p-5 text-left transition-all ${
            mode === 'bloco'
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="text-2xl mb-2">📋</div>
          <div className="font-semibold text-slate-800">Bloco de questões</div>
          <div className="text-sm text-slate-500 mt-1">
            Responda todas e veja o gabarito no final
          </div>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
          Filtros
        </h2>
        <FilterPanel value={filters} onChange={setFilters} />

        {mode === 'bloco' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Número de questões
            </label>
            <div className="flex gap-2">
              {BATCH_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setBatchCount(n)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    batchCount === n
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={start}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
      >
        Começar simulado
      </button>
    </div>
  );
}
