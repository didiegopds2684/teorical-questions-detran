// Shared icons (inline SVG, sized & colored via currentColor).

const Icon = {
  ArrowRight: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  ),
  ArrowLeft: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  ),
  Check: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 6" />
    </svg>
  ),
  X: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  Target: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  Stack: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
    </svg>
  ),
  Sliders: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="10" cy="6" r="2" fill="var(--surface)" />
      <circle cx="16" cy="12" r="2" fill="var(--surface)" />
      <circle cx="8" cy="18" r="2" fill="var(--surface)" />
    </svg>
  ),
  Book: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
      <path d="M4 17h16" />
    </svg>
  ),
};

window.Icon = Icon;

// ------------------------------- Layout -----------------------------------

function Layout({ route, onNavigate, children }) {
  const nav = [
    { to: "/", label: "Início" },
    { to: "/modulos", label: "Módulos" },
  ];

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#/" onClick={(e) => { e.preventDefault(); onNavigate("/"); }}>
            <span className="brand-mark">D</span>
            <span className="brand-name">Direta <em>simulado para autoescola</em></span>
          </a>
          <nav className="nav">
            {nav.map((n) => (
              <a key={n.to}
                href={`#${n.to}`}
                onClick={(e) => { e.preventDefault(); onNavigate(n.to); }}
                className={route === n.to ? "active" : ""}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">Banco de questões — preparação para CNH · v1.0</footer>
    </div>
  );
}

// ------------------------------- FilterPanel ------------------------------

const DIFICULDADES = [
  { value: "facil", label: "Fácil" },
  { value: "intermediario", label: "Intermediário" },
  { value: "dificil", label: "Difícil" },
];

function FilterPanel({ value, onChange }) {
  const [modules, setModules] = React.useState([]);

  React.useEffect(() => {
    window.fetchModules().then(setModules);
  }, []);

  const partes = [...new Set(modules.map((m) => m.parte))].sort((a, b) => a - b);
  const modulosDaParte = value.parte ? modules.filter((m) => m.parte === value.parte) : [];

  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="filters">
      <div className="field">
        <label className="field-label">Parte</label>
        <div className="select-wrap">
          <select
            value={value.parte ?? ""}
            onChange={(e) => set({
              parte: e.target.value ? Number(e.target.value) : undefined,
              modulo_numero: undefined,
            })}
          >
            <option value="">Todas as partes</option>
            {partes.map((p) => (
              <option key={p} value={p}>Parte {p} — {window.PARTE_TITLES[p]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Módulo</label>
        <div className="select-wrap">
          <select
            disabled={!value.parte}
            value={value.modulo_numero ?? ""}
            onChange={(e) => set({ modulo_numero: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">Todos os módulos</option>
            {modulosDaParte.map((m) => (
              <option key={m.modulo_numero} value={m.modulo_numero}>
                {m.modulo_numero}. {m.modulo_titulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Dificuldade</label>
        <div className="select-wrap">
          <select
            value={value.dificuldade ?? ""}
            onChange={(e) => set({ dificuldade: e.target.value || undefined })}
          >
            <option value="">Todas</option>
            {DIFICULDADES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

window.Layout = Layout;
window.FilterPanel = FilterPanel;
