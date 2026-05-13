import { Link, NavLink } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const nav = [
    { to: '/', label: 'Início' },
    { to: '/modulos', label: 'Módulos' },
  ];

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">D</span>
            <span className="brand-name">
              Direta <em>simulado para autoescola</em>
            </span>
          </Link>
          <nav className="nav">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">Banco de questões — preparação para CNH · v1.0</footer>
    </div>
  );
}
