import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  const nav = [
    { to: '/', label: 'Início' },
    { to: '/modulos', label: 'Módulos' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg tracking-tight">
            🚗 Simulado Detran
          </Link>
          <nav className="flex gap-4 text-sm font-medium">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={
                  pathname === n.to
                    ? 'underline underline-offset-4'
                    : 'opacity-80 hover:opacity-100'
                }
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="text-center text-xs text-slate-400 py-4">
        Banco Nacional de Questões — Detran
      </footer>
    </div>
  );
}
