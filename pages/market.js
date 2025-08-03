// pages/market.js
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch('/items.json');
      const data = await res.json();
      setItems(data);
      console.log(`📦 Items cargados: ${data.length}`);
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const filtered = items.filter(item =>
        item.localizedNames['ES-ES']?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredItems(filtered);
      console.log(`🔍 Buscando: ${search}`);
      console.log(`📊 Resultados encontrados: ${filtered.length}`);
    }, 100);

    return () => clearTimeout(timeout);
  }, [search, items]);

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    setItemData(null);
    setLoading(true);
    const itemId = item.uniquename;

    try {
      const res = await fetch(`https://www.albion-online-data.com/api/v2/stats/prices/${itemId}.json`);
      const data = await res.json();

      // Agrupar por ciudad
      const sortedSell = [...data].filter(e => e.sell_price_min > 0).sort((a, b) => a.sell_price_min - b.sell_price_min);
      const sortedBuy = [...data].filter(e => e.buy_price_max > 0).sort((a, b) => b.buy_price_max - a.buy_price_max);

      const sell = sortedSell[0];
      const buy = sortedBuy[0];

      if (sell && buy) {
        const margin = buy.buy_price_max - sell.sell_price_min;
        setItemData({ sell, buy, margin });
      } else {
        setItemData({ error: 'No hay suficientes datos de compra/venta para este ítem.' });
      }
    } catch (error) {
      setItemData({ error: 'Error al consultar la API del mercado.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🔍 Buscar Ítem (desde items.json)</h1>
      <input
        type="text"
        placeholder="Ejemplo: Claymore, Capucha..."
        className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredItems.slice(0, 50).map(item => (
          <div
            key={item.uniquename}
            className="cursor-pointer bg-gray-900 p-2 rounded hover:scale-105 transition-transform"
            onClick={() => handleSelectItem(item)}
          >
            <img
              src={`https://render.albiononline.com/v1/item/${item.uniquename}.png`}
              alt={item.localizedNames['ES-ES']}
              className="w-full h-24 object-contain mb-2"
              onError={(e) => e.target.style.display = 'none'}
            />
            <p className="text-center text-sm">{item.localizedNames['ES-ES']}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="mt-6 text-center">
          <p className="animate-pulse text-lg">🌐 Consultando mercado en tiempo real...
          </p>
        </div>
      )}

      {selectedItem && itemData && (
        <div className="mt-8 bg-gray-800 p-4 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-2">📦 Datos de Mercado para: {selectedItem.localizedNames['ES-ES']}
          </h2>
          {itemData.error ? (
            <p className="text-red-400">{itemData.error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="font-bold text-green-400">💸 Mejor compra</h3>
                <p className="text-white">{itemData.buy.buy_price_max.toLocaleString()} plata</p>
                <p className="text-gray-400 text-sm">Ciudad: {itemData.buy.city}</p>
              </div>
              <div>
                <h3 className="font-bold text-red-400">🛒 Mejor venta</h3>
                <p className="text-white">{itemData.sell.sell_price_min.toLocaleString()} plata</p>
                <p className="text-gray-400 text-sm">Ciudad: {itemData.sell.city}</p>
              </div>
              <div>
                <h3 className="font-bold text-yellow-400">💰 Margen</h3>
                <p className="text-white">
                  {(itemData.margin).toLocaleString()} plata
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
