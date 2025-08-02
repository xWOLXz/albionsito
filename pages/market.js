import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function MarketPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [error, setError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/items?page=1');
        const data = await res.json();

        if (data && Array.isArray(data.items)) {
          setItems(data.items);
          setFilteredItems(data.items);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('❌ Error cargando items:', err.message);
        setError(true);
      }
    };

    fetchAllItems();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredItems(items);
      return;
    }

    const filtro = search.toLowerCase();
    const resultados = items.filter(item =>
      item.LocalizedNames['ES-ES'].toLowerCase().includes(filtro)
    );
    setFilteredItems(resultados);
  }, [search, items]);

  const verDetalles = (itemId) => {
    router.push(`/market/${itemId}`);
  };

  if (error) {
    return (
      <div style={{ color: 'white', textAlign: 'center', paddingTop: 40 }}>
        ❌ Error al cargar datos del backend.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center text-white mb-4">Mercado General</h1>
      <input
        type="text"
        placeholder="🔍 Buscar item..."
        className="w-full mb-4 px-3 py-2 rounded bg-black text-white border border-yellow-400"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems && filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div
              key={item.UniqueName}
              className="bg-zinc-900 rounded-xl p-4 cursor-pointer hover:scale-105 transition"
              onClick={() => verDetalles(item.UniqueName)}
            >
              <img
                src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                alt={item.LocalizedNames['ES-ES']}
                className="w-16 h-16 mx-auto mb-2"
              />
              <h2 className="text-center text-white text-sm">{item.LocalizedNames['ES-ES']}</h2>
            </div>
          ))
        ) : (
          <p className="text-white text-center col-span-full">No se encontraron ítems.</p>
        )}
      </div>
    </div>
  );
}
