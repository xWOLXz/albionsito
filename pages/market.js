import { useState, useEffect } from 'react';
import axios from 'axios';

const cities = [
  'Bridgewatch',
  'Martlock',
  'Fort Sterling',
  'Lymhurst',
  'Thetford',
  'Caerleon',
  'Brecilien',
];

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/items');
      setItems(res.data.items);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los ítems:', error);
      setLoading(false);
    }
  };

  const fetchPrices = async (itemId) => {
    try {
      const response = await axios.get(
        `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${cities.join(',')}&qualities=1`
      );
      return response.data;
    } catch (err) {
      console.error('Error al cargar precios:', err);
      return [];
    }
  };

  const [pricesMap, setPricesMap] = useState({});

  useEffect(() => {
    const loadPrices = async () => {
      const chunks = [];
      for (let i = 0; i < items.length; i += 20) {
        chunks.push(items.slice(i, i + 20));
      }

      const allPrices = {};
      for (const chunk of chunks) {
        const promises = chunk.map(async (item) => {
          const prices = await fetchPrices(item.UniqueName);
          allPrices[item.UniqueName] = prices;
        });
        await Promise.all(promises);
      }
      setPricesMap(allPrices);
    };

    if (items.length > 0) {
      loadPrices();
    }
  }, [items]);

  const filteredItems = items.filter((item) =>
    item.LocalizedNames['ES-ES']
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const formatPrice = (value) => {
    return value ? value.toLocaleString('es-ES') + ' ᛤ' : 'No disponible';
  };

  const getBestPrices = (itemId) => {
    const prices = pricesMap[itemId];
    if (!prices || prices.length === 0) return null;

    let minSell = null;
    let maxBuy = null;

    for (const entry of prices) {
      if (entry.sell_price_min > 0) {
        if (!minSell || entry.sell_price_min < minSell.price)
          minSell = {
            price: entry.sell_price_min,
            city: entry.city,
          };
      }
      if (entry.buy_price_max > 0) {
        if (!maxBuy || entry.buy_price_max > maxBuy.price)
          maxBuy = {
            price: entry.buy_price_max,
            city: entry.city,
          };
      }
    }

    return { minSell, maxBuy };
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4 text-center">Mercado General</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Buscar item..."
          className="px-4 py-2 w-full max-w-md text-black rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center">Cargando ítems...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredItems.map((item) => {
            const best = getBestPrices(item.UniqueName);

            return (
              <div
                key={item.UniqueName}
                className="bg-zinc-900 rounded-xl p-4 flex flex-col items-center shadow-md"
              >
                <img
                  src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                  alt={item.LocalizedNames['ES-ES']}
                  className="w-16 h-16 mb-2"
                />
                <h2 className="text-sm font-semibold text-center mb-2">
                  {item.LocalizedNames['ES-ES']}
                </h2>

                {best ? (
                  <>
                    <p className="text-xs text-green-400 text-center">
                      Venta: {formatPrice(best.minSell?.price)} en{' '}
                      {best.minSell?.city}
                    </p>
                    <p className="text-xs text-blue-400 text-center">
                      Compra: {formatPrice(best.maxBuy?.price)} en{' '}
                      {best.maxBuy?.city}
                    </p>
                    {best.minSell?.price && best.maxBuy?.price ? (
                      <p className="text-xs text-yellow-300 text-center">
                        Ganancia: {formatPrice(best.maxBuy.price - best.minSell.price)}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 text-center">Sin margen</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400 text-center">Cargando precios...</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
