import { useEffect, useState } from 'react';
import { fetchModules } from '../api/questions';
import type { Dificuldade, Filters, ModuleSummary } from '../types';

const DIFICULDADES: { value: Dificuldade; label: string }[] = [
  { value: 'facil', label: 'Fácil' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'dificil', label: 'Difícil' },
];

interface Props {
  value: Filters;
  onChange: (f: Filters) => void;
}

export default function FilterPanel({ value, onChange }: Props) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);

  useEffect(() => {
    fetchModules().then(setModules).catch(console.error);
  }, []);

  const partes = [...new Set(modules.map((m) => m.parte))].sort((a, b) => a - b);
  const modulosDaParte = value.parte
    ? modules.filter((m) => m.parte === value.parte)
    : [];

  function set(patch: Partial<Filters>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Parte</label>
        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          value={value.parte ?? ''}
          onChange={(e) =>
            set({
              parte: e.target.value ? Number(e.target.value) : undefined,
              modulo_numero: undefined,
            })
          }
        >
          <option value="">Todas as partes</option>
          {partes.map((p) => (
            <option key={p} value={p}>
              Parte {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Módulo</label>
        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white disabled:opacity-50"
          value={value.modulo_numero ?? ''}
          disabled={!value.parte}
          onChange={(e) =>
            set({ modulo_numero: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">Todos os módulos</option>
          {modulosDaParte.map((m) => (
            <option key={m.modulo_numero} value={m.modulo_numero}>
              {m.modulo_numero}. {m.modulo_titulo} ({m.question_count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Dificuldade</label>
        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          value={value.dificuldade ?? ''}
          onChange={(e) =>
            set({
              dificuldade: (e.target.value as Dificuldade) || undefined,
            })
          }
        >
          <option value="">Todas</option>
          {DIFICULDADES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
