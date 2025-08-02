import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Market() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState('');

  const obtenerItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/items?page=${pagina}`);
      setItems(res.data.items || []);
      setTotalPaginas(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error al obtener ítems:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const obtenerPrecio = async (itemId, index) => {
    try {
      const res = await axios.get(`/api/precios?itemId=${itemId}`);
      const nuevos = [...items];
      nuevos[index].precios = res.data;
      setItems(nuevos);
    } catch (error) {
      console.error('Error al obtener precios de', itemId);
    }
  };

  useEffect(() => {
    obtenerItems();
  }, [pagina]);

  useEffect(() => {
    items.forEach((item, i) => {
      if (!item.precios) {
        obtenerPrecio(item.UniqueName, i);
      }
    });
  }, [items]);

  const itemsFiltrados = items?.filter((item) =>
    item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  return (
    <div className="p-4 text-white">
      <h1 className="text-3xl font-bold mb-4 text-center">Mercado General</h1>

      <input
        type="text"
        placeholder="Buscar item..."
        className="w-full mb-6 p-2 rounded text-black"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {loading ? (
        <p className="text-center">Cargando ítems...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {itemsFiltrados.map((item, index) => (
            <div key={item.UniqueName} className="bg-gray-900 p-3 rounded-lg text-center">
              <img
                src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                alt={item.LocalizedNames?.['ES-ES']}
                className="w-16 h-16 mx-auto"
              />
              <h2 className="text-sm font-semibold mt-2">{item.LocalizedNames?.['ES-ES']}</h2>

              {item.precios ? (
                <div className="text-xs mt-1">
                  <p>🛒 Vender: {item.precios.sell?.price.toLocaleString()} ({item.precios.sell?.city})</p>
                  <p>🪙 Comprar: {item.precios.buy?.price.toLocaleString()} ({item.precios.buy?.city})</p>
                  <p>📈 Margen: {item.precios.margen.toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2">Cargando precios…</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-6">
        <button
          className="px-4 py-1 bg-gray-700 rounded disabled:opacity-30"
          onClick={() => setPagina(p => Math.max(p - 1, 1))}
          disabled={pagina === 1}
        >
          ← Anterior
        </button>
        <span className="px-4 py-1">Página {pagina} de {totalPaginas}</span>
        <button
          className="px-4 py-1 bg-gray-700 rounded disabled:opacity-30"
          onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
          disabled={pagina === totalPaginas}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
