import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Market() {
  const [allItems, setAllItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [precios, setPrecios] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Al cargar la página, traer todos los ítems (una sola vez)
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/items/all');
        const data = await res.json();
        setAllItems(data);
      } catch (err) {
        console.error('Error cargando ítems:', err.message);
      }
    };
    fetchAllItems();
  }, []);

  // 🔍 Filtrar en tiempo real mientras el usuario escribe
  useEffect(() => {
    if (search.length === 0) {
      setFiltered([]);
      setSelectedItem(null);
      setPrecios(null);
      return;
    }

    const results = allItems.filter(item =>
      item.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results.slice(0, 20)); // máximo 20 sugerencias
  }, [search, allItems]);

  // 📦 Obtener precios de un ítem
  const fetchPrecios = async (itemId) => {
    try {
      setLoading(true);
      const res = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${itemId}`);
      const data = await res.json();
      setPrecios(data);
      setLoading(false);
    } catch (err) {
      console.error('Error obteniendo precios:', err.message);
      setPrecios(null);
      setLoading(false);
    }
  };

  // 👉 Cuando seleccionan un ítem
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearch(item.nombre);
    setFiltered([]);
    fetchPrecios(item.item_id);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Mercado de Albion Online</h1>

      <div className="max-w-xl mx-auto relative">
        <input
          className="w-full p-3 rounded text-black"
          type="text"
          placeholder="Buscar ítem por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.length > 0 && (
          <ul className="absolute z-10 bg-white text-black w-full max-h-60 overflow-y-auto border border-gray-300 mt-1 rounded shadow-lg">
            {filtered.map((item, idx) => (
              <li
                key={idx}
                className="p-2 hover:bg-gray-200 cursor-pointer text-sm"
                onClick={() => handleSelectItem(item)}
              >
                {item.nombre}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && (
        <div className="text-center mt-6 text-yellow-300">🔄 Cargando precios...</div>
      )}

      {selectedItem && precios && (
        <div className="mt-6 max-w-xl mx-auto bg-gray-800 rounded p-4 shadow">
          <div className="flex items-center space-x-4">
            <Image
              src={`https://render.albiononline.com/v1/item/${selectedItem.item_id}.png`}
              alt={selectedItem.nombre}
              width={64}
              height={64}
              className="rounded"
            />
            <h2 className="text-xl font-semibold">{selectedItem.nombre}</h2>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>📦 Venta más barata:</strong>{' '}
              {precios.sell.price > 0 ? `${precios.sell.price.toLocaleString()} en ${precios.sell.city}` : 'No disponible'}
            </p>
            <p>
              <strong>🛒 Compra más cara:</strong>{' '}
              {precios.buy.price > 0 ? `${precios.buy.price.toLocaleString()} en ${precios.buy.city}` : 'No disponible'}
            </p>
            <p>
              <strong>💰 Margen de ganancia:</strong>{' '}
              {precios.margen ? `${precios.margen.toLocaleString()} de plata` : 'No disponible'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
