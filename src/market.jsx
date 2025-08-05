import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const backendRes = await fetch('https://albionsito-backend.onrender.com/items');
      const backendData = await backendRes.json();
      console.log(`🔵 Backend: ${backendData.length} ítems recibidos`);

      const itemIds = backendData.map(item => item.item_id).join(',');
      const albionAPIRes = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices?ids=${itemIds}&locations=Caerleon,Bridgewatch,Lymhurst,Martlock,Thetford`);
      const albionAPIData = await albionAPIRes.json();
      console.log(`🟡 Albion API: ${albionAPIData.length} precios recibidos`);

      const albionMap = {};
      albionAPIData.forEach(entry => {
        if (!albionMap[entry.item_id]) {
          albionMap[entry.item_id] = {
            ...entry,
            buy_price_max: entry.buy_price_max || 0,
            sell_price_min: entry.sell_price_min || 0
          };
        }
      });

      const combinedItems = [];
      const usadosAPI = [];

      backendData.forEach(item => {
        const merged = { ...item };
        if (!merged.sell_price_min && albionMap[item.item_id]) {
          merged.sell_price_min = albionMap[item.item_id].sell_price_min || 0;
          merged.buy_price_max = albionMap[item.item_id].buy_price_max || 0;
          usadosAPI.push(item.item_id);
        }
        combinedItems.push(merged);
      });

      console.log(`✅ Combinación completa. Reemplazos desde API: ${usadosAPI.length}`);
      setItems(combinedItems);
      setFilteredItems(combinedItems);
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(() => {
      const lowerText = text.toLowerCase();
      if (lowerText.length < 3) {
        setFilteredItems(items);
        return;
      }

      const uniqueItems = {};
      const result = items.filter(item => {
        const match = item.localized_name?.toLowerCase().includes(lowerText);
        if (match && !uniqueItems[item.item_id]) {
          uniqueItems[item.item_id] = true;
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
    fetchItems();
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
          <img src="/albion-loader.gif" alt="Cargando" width={64} height={64} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.item_id} className="bg-gray-900 p-4 rounded-lg shadow text-white flex items-center gap-4">
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
                  Venta: {item.sell_price_min?.toLocaleString() || '—'} / Compra: {item.buy_price_max?.toLocaleString() || '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
