import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchModules, PARTE_TITLES } from '../api/questions';
import { ArrowRight } from '../components/Icons';
import type { ModuleSummary } from '../types';

function mockProgress(m: ModuleSummary) {
  return (m.parte * 17 + m.modulo_numero * 41) % 100;
}

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

  if (loading) return <div className="center-state">Carregando módulos...</div>;
  if (error) return <div className="center-state" style={{ color: 'var(--err-ink)' }}>{error}</div>;

  const partes = [...new Set(modules.map((m) => m.parte))].sort((a, b) => a - b);

  function startModule(m: ModuleSummary) {
    const params = new URLSearchParams({
      parte: String(m.parte),
      modulo_numero: String(m.modulo_numero),
    });
    navigate(`/simulado?${params.toString()}`);
  }

  return (
    <div>
      <div className="page-intro">
        <div className="lane-stripe">
          <span /><span /><span />
        </div>
        <h1>Módulos</h1>
        <p>
          Escolha um módulo específico para focar seus estudos.
          O simulado será individual com filtro aplicado.
        </p>
      </div>

      {partes.map((parte) => {
        const parteModules = modules.filter((m) => m.parte === parte);
        return (
          <section key={parte} className="parte-section">
            <div className="parte-header">
              <h2>
                <em>Parte {String(parte).padStart(2, '0')}</em>
                {PARTE_TITLES[parte] ?? ''}
              </h2>
              <span className="eyebrow">{parteModules.length} módulos</span>
            </div>

            <div>
              {parteModules.map((m) => {
                const pct = mockProgress(m);
                return (
                  <button
                    key={m.modulo_numero}
                    className="module-row"
                    onClick={() => startModule(m)}
                  >
                    <span className="module-num">
                      {String(m.modulo_numero).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="module-title">{m.modulo_titulo}</div>
                      <div className="module-meta">
                        {m.question_count} questões
                      </div>
                    </div>
                    <div className="module-progress">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: pct + '%' }} />
                      </div>
                      <span className="module-arrow">
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
