import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Market from './pages/market';
import Busqueda from './pages/busqueda';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Market />} />
        <Route path="/busqueda" element={<Busqueda />} />
      </Routes>
    </Router>
  );
}

export default App;
