// pages/busqueda.jsx
import { useState } from 'react';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

export default function Busqueda() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const buscarItems = async () => {
    if (!termino.trim()) return;
    setCargando(true);
    setResultados([]);
    setError(null);

    try {
      const res = await fetch(`https://albionsito-backend2.vercel.app/api/item?name=${encodeURIComponent(termino)}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error(data.error || 'Error inesperado');
      }

      setResultados(data);
    } catch (err) {
      setError(err.message || 'Error al buscar ítems.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-center mb-4">🔍 Buscar Ítems</h1>

      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Ejemplo: Caballo, Bolsa, Hacha..."
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarItems()}
          className="border rounded-l px-4 py-2 w-full max-w-md"
        />
        <button
          onClick={buscarItems}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {cargando && <Loader />}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {resultados.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {resultados.map((item) => (
            <ItemCard key={item.uniqueName} item={item} />
          ))}
        </div>
      )}

      {!cargando && resultados.length === 0 && termino && !error && (
        <p className="text-center text-gray-500">Sin resultados para "{termino}"</p>
      )}
    </div>
  );
}
