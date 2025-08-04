import { useEffect, useState } from 'react';
import './App.css';

const TIERS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];

export default function App() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedTier, setSelectedTier] = useState('T4');

  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        console.log('✅ Cargado items.json:', data.length, 'ítems');
      })
      .catch((err) => {
        console.error('❌ Error cargando items.json:', err);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems([]);
      return;
    }

    const resultados = items.filter((item) => {
      const nombreCoincide = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const sinEncantamiento = !item.id.includes('@');
      return nombreCoincide && sinEncantamiento;
    });

    setFilteredItems(resultados);
    console.log(`🔎 Buscando: "${searchTerm}" => ${resultados.length} resultado(s)`);
  }, [searchTerm, items]);

  const getTierItems = (tier) => {
    return filteredItems.filter((item) => item.id.includes(tier));
  };

  const getIcono = (item) => {
    if (item.imagen) return item.imagen;
    return `https://albionsito-backend.onrender.com/icono/${item.id}`;
  };

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">📦 Market Albionsito</h1>

      <input
        type="text"
        placeholder="Buscar ítem base... (ej: Espada Claymore)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 rounded-md text-black"
      />

      {filteredItems.length > 0 && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {TIERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  selectedTier === tier
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-purple-800'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {getTierItems(selectedTier).map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 p-3 rounded-lg shadow flex flex-col items-center"
              >
                <img
                  src={getIcono(item)}
                  alt={item.nombre}
                  className="w-16 h-16 object-contain mb-2"
                  onError={(e) => {
                    e.target.src = '/no-img.png';
                  }}
                />
                <p className="text-sm text-center">{item.nombre}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {searchTerm && filteredItems.length === 0 && (
        <p className="text-gray-400">No se encontraron ítems base para "{searchTerm}"</p>
      )}
    </div>
  );
}
