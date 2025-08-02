// pages/market.js
import { useEffect, useState } from 'react';
import axios from 'axios';

const ciudades = [
  'Bridgewatch',
  'Martlock',
  'Fort Sterling',
  'Thetford',
  'Lymhurst',
  'Caerleon',
  'Brecilien'
];

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        let allItems = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await axios.get(`https://albionsito-backend.onrender.com/items?page=${page}`);
          const data = res.data;
          allItems = [...allItems, ...data.items];
          page++;
          hasMore = page <= data.totalPages;
        }

        const itemsWithPrices = await Promise.all(
          allItems.map(async (item) => {
            const prices = {};

            await Promise.all(
              ciudades.map(async (ciudad) => {
                try {
                  const res = await axios.get(
                    `https://west.albion-online-data.com/api/v2/stats/view/${item.UniqueName}.json?locations=${ciudad}`
                  );
                  const data = res.data;
                  const lowestSell = data.find((entry) => entry.sell_price_min > 0);
                  const highestBuy = data.find((entry) => entry.buy_price_max > 0);

                  prices[ciudad] = {
                    sell: lowestSell ? lowestSell.sell_price_min : null,
                    buy: highestBuy ? highestBuy.buy_price_max : null,
                  };
                } catch (err) {
                  prices[ciudad] = { sell: null, buy: null };
                }
              })
            );

            return {
              ...item,
              prices,
            };
          })
        );

        setItems(itemsWithPrices);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar items:', error.message);
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  const filteredItems = items.filter((item) =>
    item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 text-white min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-4 text-center">Mercado General</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Buscar item..."
          className="p-2 rounded text-black w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center text-white">Cargando datos...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div key={item.UniqueName} className="bg-gray-800 rounded p-3 shadow text-center">
              <img
                src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                alt={item.LocalizedNames?.['ES-ES'] || item.UniqueName}
                className="w-16 h-16 mx-auto mb-2"
              />
              <h2 className="text-sm font-semibold mb-2">{item.LocalizedNames?.['ES-ES'] || item.UniqueName}</h2>
              {ciudades.map((ciudad) => {
                const data = item.prices[ciudad];
                if (data.sell || data.buy) {
                  return (
                    <div key={ciudad} className="text-xs text-left mb-1">
                      <strong>{ciudad}:</strong>{' '}
                      {data.sell ? `🟢 Venta: ${data.sell.toLocaleString()}` : ''}{' '}
                      {data.buy ? `🔴 Compra: ${data.buy.toLocaleString()}` : ''}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
