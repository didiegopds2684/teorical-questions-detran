import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchModules } from '../api/questions';
import type { ModuleSummary } from '../types';

export default function Modules() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModules()
      .then(setModules)
      .catch(() => setError('Falha ao carregar módulos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500 text-center py-16">Carregando...</p>;
  if (error) return <p className="text-red-500 text-center py-16">{error}</p>;

  const partes = [...new Set(modules.map((m) => m.parte))].sort((a, b) => a - b);

  function startModule(m: ModuleSummary) {
    const params = new URLSearchParams({
      parte: String(m.parte),
      modulo_numero: String(m.modulo_numero),
    });
    navigate(`/simulado?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Módulos</h1>
        <p className="text-slate-500 mt-1">Escolha um módulo para iniciar um simulado</p>
      </div>

      {partes.map((parte) => (
        <div key={parte}>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Parte {parte}
          </h2>
          <div className="flex flex-col gap-2">
            {modules
              .filter((m) => m.parte === parte)
              .map((m) => (
                <button
                  key={m.modulo_numero}
                  onClick={() => startModule(m)}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                >
                  <div>
                    <span className="font-medium text-slate-800">
                      Módulo {m.modulo_numero} — {m.modulo_titulo}
                    </span>
                  </div>
                  <span className="text-sm text-slate-400 shrink-0 ml-4">
                    {m.question_count} questões →
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
