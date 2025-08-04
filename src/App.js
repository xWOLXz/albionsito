import { useEffect, useState } from 'react';
import './styles/Market.module.css';

export default function App() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState({});
  const [activeTier, setActiveTier] = useState('.0');

  // 🔄 Cargar ítems base desde public/items.json
  useEffect(() => {
    fetch('/items.json')
      .then(res => res.json())
      .then(data => {
        setItems(data.filter(i => i.id.match(/T\d+_.+_LEVEL0$/))); // Solo base tier
      })
      .catch(err => console.error('❌ Error cargando items:', err));
  }, []);

  // 🔍 Buscar ítems por nombre
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredItems([]);
      } else {
        const term = searchTerm.toLowerCase();
        setFilteredItems(items.filter(i => i.nombre.toLowerCase().includes(term)));
      }
    }, 200);
    return () => clearTimeout(delay);
  }, [searchTerm, items]);

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setActiveTier('.0');

    const tiers = ['.0', '.1', '.2', '.3', '.4'];
    const tierData = {};

    for (const tier of tiers) {
      const itemId = item.id.replace('LEVEL0', `LEVEL${tier.slice(1)}`);
      try {
        const res = await fetch(`https://albionsito-backend.onrender.com/precios/${itemId}`);
        const data = await res.json();
        tierData[tier] = data;
      } catch {
        tierData[tier] = [];
      }
    }

    setMarketData(tierData);
  };

  return (
    <div className="flex h-screen text-white bg-black">
      {/* IZQUIERDA: Buscador + Ítems */}
      <div className="w-1/3 p-4 overflow-y-auto border-r border-gray-700 bg-gray-900">
        <h1 className="text-xl font-bold mb-3">📦 Market</h1>
        <input
          type="text"
          placeholder="Buscar ítem..."
          className="w-full p-2 mb-4 text-black rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="cursor-pointer p-2 rounded hover:bg-gray-800"
            >
              <img
                src={item.imagen}
                onError={(e) => {
                  e.target.src = `https://albionsito-backend.onrender.com/icono/${item.id}`;
                  e.target.onerror = () => (e.target.src = '/no-img.png');
                }}
                alt={item.nombre}
                className="w-12 h-12 object-contain mx-auto"
              />
              <p className="text-xs text-center mt-1">{item.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DERECHA: Resultados */}
      <div className="w-2/3 p-6 overflow-y-auto bg-gray-950">
        {selectedItem ? (
          <>
            <h2 className="text-2xl font-bold mb-2">{selectedItem.nombre}</h2>
            <p className="text-sm text-gray-400 mb-4">ID: {selectedItem.id}</p>

            {/* PESTAÑAS POR TIER */}
            <div className="flex gap-2 mb-4">
              {Object.keys(marketData).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`px-3 py-1 rounded ${
                    activeTier === tier ? 'bg-yellow-500 text-black' : 'bg-gray-700'
                  }`}
                >
                  Tier {tier}
                </button>
              ))}
            </div>

            {/* DATOS DE MERCADO */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(marketData[activeTier] || []).map((entry) => (
                <div key={entry.city} className="bg-gray-800 p-3 rounded shadow text-sm">
                  <h3 className="font-bold mb-1">{entry.city}</h3>
                  <p>🛒 Venta: {entry.sell_price_min?.toLocaleString() || '❌'}</p>
                  <p>💰 Compra: {entry.buy_price_max?.toLocaleString() || '❌'}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500">Selecciona un ítem para ver precios.</p>
        )}
      </div>
    </div>
  );
        }
