import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const fetchItemsFromBackends = async () => {
    setLoading(true);
    try {
      const urls = [
        'https://albionsito-backend.onrender.com/items',
        'https://albionsito-backend2.onrender.com/items'
      ];

      const responses = await Promise.all(urls.map(url => fetch(url)));
      const allData = await Promise.all(responses.map(res => res.json()));
      const combined = [...allData[0], ...allData[1]];

      // Evitar duplicados por item_id + ciudad
      const uniqueMap = {};
      combined.forEach(entry => {
        const key = `${entry.item_id}-${entry.city}`;
        if (!uniqueMap[key]) {
          uniqueMap[key] = entry;
        }
      });

      const uniqueItems = Object.values(uniqueMap);
      setItems(uniqueItems);
      setFilteredItems(uniqueItems);

      console.log('✅ Total ítems combinados:', uniqueItems.length);
      uniqueItems.forEach((entry) => {
        console.log(
          `📦 Precio: ${entry.item_id} - ${entry.city} venta: ${entry.sell_price_min} / compra: ${entry.buy_price_max}`
        );
      });
    } catch (error) {
      console.error('❌ Error al obtener precios de los backends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (debounceTimeout) clearTimeout(debounceTimeout);

    const timeout = setTimeout(() => {
      const lower = text.toLowerCase();
      if (lower.length < 3) {
        setFilteredItems(items);
        return;
      }

      const unique = {};
      const result = items.filter((item) => {
        const match = item.localized_name?.toLowerCase().includes(lower);
        if (match && !unique[item.item_id]) {
          unique[item.item_id] = true;
          return true;
        }
        return false;
      });

      setFilteredItems(result);
      console.log(`🔍 Búsqueda: "${text}" — Coincidencias: ${result.length}`);
    }, 3000);

    setDebounceTimeout(timeout);
  };

  useEffect(() => {
    fetchItemsFromBackends();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">Market General</h1>

      <input
        type="text"
        placeholder="Buscar ítem..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
      />

      {loading ? (
        <div className="flex justify-center items-center">
          <img src="/albion-loader.gif" alt="Cargando..." width={64} height={64} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={`${item.item_id}-${item.city}`}
              className="bg-gray-900 p-4 rounded-lg shadow text-white flex items-center gap-4"
            >
              <img
                src={`https://render.albiononline.com/v1/item/${item.item_id}.png`}
                alt={item.localized_name}
                width={64}
                height={64}
                onError={(e) => {
                  e.target.src = '/placeholder.png';
                }}
              />
              <div>
                <h2 className="text-lg font-bold">{item.localized_name}</h2>
                <p className="text-sm text-gray-400">{item.item_id}</p>
                <p className="text-sm mt-1">
                  Venta: {item.sell_price_min.toLocaleString()} / Compra: {item.buy_price_max.toLocaleString()}
                </p>
                <p className="text-sm text-yellow-300">{item.city}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
