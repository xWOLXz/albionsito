import { useEffect, useState } from 'react';
import Image from 'next/image';

const API_BACKEND = 'https://albionsito-backend.onrender.com';

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(API_BACKEND + '/items')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Error cargando items API:', err));
  }, []);

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFiltered([]);
      return;
    }
    setFiltered(
      items.filter(it => (it.name || '').toLowerCase().includes(term))
    );
  }, [search, items]);

  const handleSelect = async (it) => {
    setSelected(it);
    setLoading(true);
    try {
      const res = await fetch(`${API_BACKEND}/prices/${it.id}`);
      const data = await res.json();
      setPrices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error obteniendo precios:', e);
      setPrices([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row p-4 bg-gray-900 text-white min-h-screen">
      {/* Buscador */}
      <div className="md:w-1/3 p-2">
        <h1 className="text-2xl font-bold mb-4">🔍 Buscar ítem</h1>
        <input
          className="w-full p-2 mb-4 rounded text-black"
          type="text"
          placeholder="Escribe un ítem..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="max-h-[70vh] overflow-auto grid grid-cols-2 gap-2">
          {filtered.map(it => (
            <div
              key={it.id}
              className="cursor-pointer hover:bg-gray-700 p-2 rounded flex items-center"
              onClick={() => handleSelect(it)}
            >
              <Image
                src={it.icon}
                width={48}
                height={48}
                alt={it.name}
                onError={e => {
                  e.target.src = '/no-img.png';
                }}
                className="rounded"
              />
              <span className="ml-2">{it.name}</span>
            </div>
          ))}
          {filtered.length === 0 && search && (
            <p className="text-gray-400">No se encontraron resultados</p>
          )}
        </div>
      </div>

      {/* Panel precios */}
      <div className="md:w-2/3 p-2">
        {selected ? (
          <div>
            <h2 className="text-xl font-bold mb-2">📋 {selected.name}</h2>
            {loading ? (
              <p>Cargando precios...</p>
            ) : prices.length > 0 ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {prices.map((entry, idx) => (
                  <div key={idx} className="bg-gray-800 p-3 rounded-lg">
                    <p className="font-semibold">{entry.city}</p>
                    <p className="text-green-400">
                      🛒 Venta: {entry.sell_price_min || '—'} 🪙
                    </p>
                    <p className="text-yellow-400">
                      📥 Compra: {entry.buy_price_max || '—'} 🪙
                    </p>
                    <p className="text-blue-400">
                      Margen: {entry.sell_price_min && entry.buy_price_max
                        ? `${(entry.sell_price_min - entry.buy_price_max).toLocaleString()} 🪙`
                        : '—'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500">No hay datos disponibles.</p>
            )}
          </div>
        ) : (
          <p>Selecciona un ítem para ver precios.</p>
        )}
      </div>
    </div>
  );
        }
