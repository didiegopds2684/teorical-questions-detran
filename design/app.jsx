// Main app — tiny hash router + tweaks integration.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "forest",
  "theme": "light",
  "density": "comfortable",
  "fontScale": 100
}/*EDITMODE-END*/;

const PALETTE_OPTIONS = [
  ["#3d6b54", "#1c1a16", "#f6f3ec"], // forest
  ["#a86036", "#1c1a16", "#f6f3ec"], // clay
  ["#3f4ab2", "#1c1a16", "#f6f3ec"], // indigo
  ["#1c1a16", "#56524a", "#f6f3ec"], // ink (mono)
];
const PALETTE_VALUES = ["forest", "clay", "indigo", "ink"];
const PALETTE_LABELS = { forest: "Floresta", clay: "Argila", indigo: "Índigo", ink: "Tinta" };

function useRoute() {
  const parse = () => {
    const raw = (location.hash || "#/").slice(1);
    const [path, query = ""] = raw.split("?");
    return { path: path || "/", query };
  };
  const [r, setR] = React.useState(parse);
  React.useEffect(() => {
    const onHash = () => setR(parse());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (to) => { location.hash = to; window.scrollTo({ top: 0 }); };
  return [r, navigate];
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, navigate] = useRoute();

  // Apply tweaks to <html>
  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-palette", t.palette);
    html.setAttribute("data-theme", t.theme);
    html.setAttribute("data-density", t.density);
    html.setAttribute("data-fontscale", String(t.fontScale));
  }, [t.palette, t.theme, t.density, t.fontScale]);

  const paletteIdx = PALETTE_VALUES.indexOf(t.palette);
  const paletteValue = PALETTE_OPTIONS[paletteIdx >= 0 ? paletteIdx : 0];

  function renderPage() {
    if (route.path === "/") return <Home navigate={navigate} />;
    if (route.path === "/modulos") return <ModulesPage navigate={navigate} />;
    if (route.path === "/simulado") return <SimuladoIndividual navigate={navigate} query={route.query} />;
    if (route.path === "/simulado/bloco") return <SimuladoBloco navigate={navigate} query={route.query} />;
    return <Home navigate={navigate} />;
  }

  return (
    <>
      <Layout route={route.path} onNavigate={navigate}>
        {renderPage()}
      </Layout>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema" />
        <TweakRadio
          label="Modo"
          value={t.theme}
          options={["light", "dark"]}
          optionLabels={["Claro", "Escuro"]}
          onChange={(v) => setTweak("theme", v)}
        />
        <TweakColor
          label="Paleta"
          value={paletteValue}
          options={PALETTE_OPTIONS}
          onChange={(v) => {
            const idx = PALETTE_OPTIONS.findIndex((p) => p[0] === v[0]);
            setTweak("palette", PALETTE_VALUES[idx >= 0 ? idx : 0]);
          }}
        />
        <div style={{ fontSize: 10, color: "rgba(41,38,27,.55)", marginTop: -4, letterSpacing: ".02em" }}>
          {PALETTE_LABELS[t.palette]}
        </div>

        <TweakSection label="Conforto de leitura" />
        <TweakRadio
          label="Densidade"
          value={t.density}
          options={["compact", "comfortable", "spacious"]}
          optionLabels={["Compacto", "Confortável", "Amplo"]}
          onChange={(v) => setTweak("density", v)}
        />
        <TweakSlider
          label="Tamanho da fonte"
          value={t.fontScale}
          min={100} max={125} step={12.5}
          unit="%"
          onChange={(v) => setTweak("fontScale", v)}
        />
      </TweaksPanel>
    </>
  );
}

// Tweak control extension — TweakRadio with optional `optionLabels` (the
// starter expects label === value; we want pretty labels distinct from values).
// We wrap with a render override using the starter's component when labels match,
// else fall back to a simple inline segmented control.
const __TweakRadioBase = window.TweakRadio;
window.TweakRadio = function TweakRadio(props) {
  if (!props.optionLabels) return __TweakRadioBase(props);
  // build composite — render as a segmented control matching starter aesthetic
  const { label, value, options, optionLabels, onChange } = props;
  return (
    <div className="twk-row twk-row-h">
      <span style={{ color: "rgba(41,38,27,.72)", fontWeight: 500 }}>{label}</span>
      <div style={{
        display: "inline-flex",
        background: "rgba(0,0,0,.06)",
        borderRadius: 8,
        padding: 2,
        gap: 2,
      }}>
        {options.map((o, i) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            style={{
              padding: "4px 9px",
              borderRadius: 6,
              border: 0,
              background: o === value ? "rgba(255,255,255,.95)" : "transparent",
              color: o === value ? "#29261b" : "rgba(41,38,27,.62)",
              fontSize: 11,
              fontWeight: o === value ? 600 : 500,
              cursor: "pointer",
              boxShadow: o === value ? "0 1px 2px rgba(0,0,0,.08)" : "none",
              transition: "background .15s, color .15s",
            }}
          >
            {optionLabels[i]}
          </button>
        ))}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
