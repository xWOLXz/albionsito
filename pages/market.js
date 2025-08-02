import { useState, useEffect } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://albionsito-backend.onrender.com/items');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Error cargando ítems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) =>
    item.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-center">Market General</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar ítem..."
          className="p-2 border border-gray-400 rounded w-full max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={fetchItems}
          className="ml-4 p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
          title="Actualizar"
        >
          🔄
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <img src="/albion-loader.gif" alt="Cargando..." className="w-16 h-16" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 p-3 rounded shadow flex flex-col items-center text-center"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-14 h-14 mb-2"
                loading="lazy"
              />
              <span className="text-sm text-white">{item.nombre}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
                  }
