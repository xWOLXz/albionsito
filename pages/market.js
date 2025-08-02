// 📁 pages/market.js
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/items?page=${page}`);
      const data = await res.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error al obtener ítems:', err);
    }
    setLoading(false);
  };

  const fetchDetails = async (itemId) => {
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${itemId}`);
      const data = await res.json();
      setSelectedItem({ ...data, itemId });
    } catch (err) {
      console.error('Error al obtener detalles:', err);
    }
  };

  const filtered = items.filter(item =>
    item.LocalizedNames['ES-ES'].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 text-white">
      <h1 className="text-3xl font-bold mb-4 text-center">Mercado General</h1>

      <input
        type="text"
        placeholder="Buscar ítem..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 rounded-md text-black mb-4"
      />

      {loading ? (
        <p className="text-center">⏳ Cargando ítems...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.UniqueName}
              className="bg-gray-800 p-4 rounded-md hover:bg-gray-700 cursor-pointer"
              onClick={() => fetchDetails(item.UniqueName)}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                  alt={item.LocalizedNames['ES-ES']}
                  width={40}
                  height={40}
                />
                <span>{item.LocalizedNames['ES-ES']}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          className="bg-gray-700 px-4 py-2 rounded disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          ⬅️ Anterior
        </button>
        <button
          className="bg-gray-700 px-4 py-2 rounded disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Siguiente ➡️
        </button>
      </div>

      {selectedItem && (
        <div className="mt-8 p-4 border border-gray-600 rounded-md bg-gray-900">
          <h2 className="text-xl font-semibold mb-2">Detalles del ítem</h2>
          <p><strong>Ítem:</strong> {selectedItem.itemId}</p>
          <p><strong>Precio Venta:</strong> {selectedItem.sell.price} en {selectedItem.sell.city}</p>
          <p><strong>Precio Compra:</strong> {selectedItem.buy.price} en {selectedItem.buy.city}</p>
          <p><strong>Margen de Ganancia:</strong> {selectedItem.margen} 🪙</p>
        </div>
      )}
    </div>
  );
}
