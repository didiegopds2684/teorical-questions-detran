import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Modules from './pages/Modules';
import SimuladoBloco from './pages/SimuladoBloco';
import SimuladoIndividual from './pages/SimuladoIndividual';
import { Sliders } from './components/Icons';

type Palette = 'forest' | 'clay' | 'indigo' | 'ink';
type Density = 'compact' | 'comfortable' | 'spacious';
type FontScale = 100 | 112 | 125;

const PALETTE_OPTS: { value: Palette; label: string; color: string }[] = [
  { value: 'forest', label: 'Floresta', color: '#3d6b54' },
  { value: 'clay', label: 'Argila', color: '#a86036' },
  { value: 'indigo', label: 'Índigo', color: '#3f4ab2' },
  { value: 'ink', label: 'Tinta', color: '#29261b' },
];

const DENSITY_OPTS: [Density, string][] = [
  ['compact', 'Compacto'],
  ['comfortable', 'Confortável'],
  ['spacious', 'Amplo'],
];

const FONT_OPTS: [FontScale, string][] = [[100, '100%'], [112, '112%'], [125, '125%']];

function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [palette, setPalette] = useState<Palette>(
    () => (localStorage.getItem('palette') as Palette) || 'forest',
  );
  const [density, setDensity] = useState<Density>(
    () => (localStorage.getItem('density') as Density) || 'comfortable',
  );
  const [fontScale, setFontScale] = useState<FontScale>(
    () => (Number(localStorage.getItem('fontScale') || 100) as FontScale),
  );

  useEffect(() => {
    const html = document.documentElement;
    const theme = dark ? 'dark' : 'light';
    html.dataset.theme = theme;
    html.dataset.palette = palette;
    html.dataset.density = density;
    html.dataset.fontscale = String(fontScale);
    localStorage.setItem('theme', theme);
    localStorage.setItem('palette', palette);
    localStorage.setItem('density', density);
    localStorage.setItem('fontScale', String(fontScale));
  }, [dark, palette, density, fontScale]);

  return (
    <>
      <button
        className="icon-btn"
        style={{
          position: 'fixed',
          bottom: 18,
          right: 18,
          zIndex: 1000,
          background: 'var(--surface-elev)',
          border: '1px solid var(--line-strong)',
          boxShadow: 'var(--shadow)',
        }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Personalizar aparência"
        title="Personalizar aparência"
      >
        <Sliders size={16} />
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 66,
            right: 18,
            zIndex: 1000,
            background: 'color-mix(in oklab, var(--surface-elev) 92%, transparent)',
            backdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-lg)',
            padding: '16px 18px',
            minWidth: 248,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--ink)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
            }}
          >
            Aparência
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>Modo escuro</span>
            <button
              onClick={() => setDark((d) => !d)}
              style={{
                position: 'relative',
                width: 36,
                height: 20,
                padding: 0,
                border: 'none',
                borderRadius: 999,
                background: dark ? 'var(--accent)' : 'var(--ink-4)',
                cursor: 'pointer',
                transition: 'background .15s',
                flexShrink: 0,
              }}
              role="switch"
              aria-checked={dark}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: dark ? 17 : 3,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'left .15s',
                  boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }}
              />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 500 }}>Paleta</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {PALETTE_OPTS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPalette(p.value)}
                  title={p.label}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: 'none',
                    background: p.color,
                    cursor: 'pointer',
                    outline: palette === p.value ? '2.5px solid var(--ink)' : '2px solid transparent',
                    outlineOffset: 2,
                    transition: 'outline .15s',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 500 }}>Densidade</span>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--surface-2)',
                borderRadius: 8,
                padding: 2,
                gap: 2,
              }}
            >
              {DENSITY_OPTS.map(([d, label]) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: 0,
                    fontSize: 11,
                    cursor: 'pointer',
                    background: d === density ? 'var(--surface-elev)' : 'transparent',
                    color: d === density ? 'var(--ink)' : 'var(--ink-3)',
                    fontWeight: d === density ? 600 : 500,
                    boxShadow: d === density ? 'var(--shadow-sm)' : 'none',
                    transition: 'background .15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 500 }}>Fonte</span>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--surface-2)',
                borderRadius: 8,
                padding: 2,
                gap: 2,
              }}
            >
              {FONT_OPTS.map(([f, label]) => (
                <button
                  key={f}
                  onClick={() => setFontScale(f)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 0,
                    fontSize: 11,
                    cursor: 'pointer',
                    background: f === fontScale ? 'var(--surface-elev)' : 'transparent',
                    color: f === fontScale ? 'var(--ink)' : 'var(--ink-3)',
                    fontWeight: f === fontScale ? 600 : 500,
                    boxShadow: f === fontScale ? 'var(--shadow-sm)' : 'none',
                    transition: 'background .15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/modulos" element={<Layout><Modules /></Layout>} />
        <Route path="/simulado" element={<Layout><SimuladoIndividual /></Layout>} />
        <Route path="/simulado/bloco" element={<Layout><SimuladoBloco /></Layout>} />
      </Routes>
      <TweaksPanel />
    </BrowserRouter>
  );
}
