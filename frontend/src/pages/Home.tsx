import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterPanel from '../components/FilterPanel';
import { ArrowRight, Target, Stack } from '../components/Icons';
import { fetchModules } from '../api/questions';
import type { Filters, ModuleSummary } from '../types';

type Mode = 'individual' | 'bloco';
const BATCH_OPTIONS = [5, 10, 20, 30];

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('individual');
  const [filters, setFilters] = useState<Filters>({});
  const [batchCount, setBatchCount] = useState(10);
  const [modules, setModules] = useState<ModuleSummary[]>([]);

  useEffect(() => {
    fetchModules().then(setModules).catch(console.error);
  }, []);

  const totalQuestoes = modules.reduce((s, m) => s + m.question_count, 0);
  const totalModulos = modules.length;

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
    <div>
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="lane-mini" />
          <span className="eyebrow">Banco de questões</span>
        </div>
        <h1 className="hero-title">
          Estude no seu ritmo. <em>Vá em frente.</em>
        </h1>
        <p className="hero-sub">
          Treine para a prova teórica com questões organizadas por parte, módulo e dificuldade.
          Escolha o ritmo e o tipo de simulado abaixo.
        </p>
      </section>

      <div className="stats-strip" style={{ marginTop: 28 }}>
        <div className="stat">
          <div className="stat-label">Questões disponíveis</div>
          <div className="stat-value tnum">
            {totalQuestoes || '—'}<small>no banco</small>
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Módulos</div>
          <div className="stat-value tnum">
            {totalModulos || '—'}<small>cobertos</small>
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Aprovação mínima</div>
          <div className="stat-value tnum">
            70<span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: 'var(--ink-3)', marginLeft: 2 }}>%</span>
          </div>
        </div>
      </div>

      <div className="section-title">
        <h2>01 — Escolha o modo</h2>
        <span className="lane-line" />
      </div>

      <div className="modes">
        <button
          onClick={() => setMode('individual')}
          className={`mode ${mode === 'individual' ? 'active' : ''}`}
        >
          <span className="mode-glyph"><Target /></span>
          <div>
            <div className="mode-title">Questão por questão</div>
            <div className="mode-desc">
              Feedback imediato após cada resposta. Ideal pra estudar pelo comentário.
            </div>
          </div>
        </button>

        <button
          onClick={() => setMode('bloco')}
          className={`mode ${mode === 'bloco' ? 'active' : ''}`}
        >
          <span className="mode-glyph"><Stack /></span>
          <div>
            <div className="mode-title">Bloco de questões</div>
            <div className="mode-desc">
              Responda tudo de uma vez e veja o gabarito no final — simula a prova real.
            </div>
          </div>
        </button>
      </div>

      <div className="section-title">
        <h2>02 — Refine (opcional)</h2>
        <span className="lane-line" />
      </div>

      <div className="card">
        <FilterPanel value={filters} onChange={setFilters} />

        {mode === 'bloco' && (
          <>
            <hr className="lane" style={{ margin: '20px 0' }} />
            <div
              className="field"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div className="field-label">Quantas questões?</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', marginTop: 2 }}>
                  A prova oficial costuma ter 30.
                </div>
              </div>
              <div className="chips">
                {BATCH_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setBatchCount(n)}
                    className={`chip ${batchCount === n ? 'active' : ''}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={start}
        className="btn btn-accent btn-lg btn-block"
        style={{ marginTop: 28 }}
      >
        Começar simulado
        <ArrowRight />
      </button>
    </div>
  );
}
