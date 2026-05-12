import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Modules from './pages/Modules';
import SimuladoBloco from './pages/SimuladoBloco';
import SimuladoIndividual from './pages/SimuladoIndividual';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/modulos"
          element={
            <Layout>
              <Modules />
            </Layout>
          }
        />
        <Route
          path="/simulado"
          element={
            <Layout>
              <SimuladoIndividual />
            </Layout>
          }
        />
        <Route
          path="/simulado/bloco"
          element={
            <Layout>
              <SimuladoBloco />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
