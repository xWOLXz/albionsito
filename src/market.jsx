import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Market = () => {
  const [itemsInfo, setItemsInfo] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar items.json con todos los ítems (nombres e IDs en español)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        setItemsInfo(data);
      } catch (error) {
        console.error('Error al cargar items.json:', error);
      }
    };

    fetchItems();
  }, []);

  // Filtro según búsqueda
  const filteredItems = itemsInfo.filter((item) =>
    item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Consultar precios al hacer clic
  const fetchMarketData = async (itemId) => {
    setLoading(true);
    try {
      const url = `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=Thetford,Bridgewatch,Martlock,Lymhurst,FortSterling,Caerleon`;
      const res = await axios.get(url);
      const data = res.data;

      let minSell = null;
      let maxBuy = null;

      data.forEach((entry) => {
        if (entry.sell_price_min > 0) {
          if (!minSell || entry.sell_price_min < minSell.price) {
            minSell = {
              city: entry.city,
              price: entry.sell_price_min,
            };
          }
        }

        if (entry.buy_price_max > 0) {
          if (!maxBuy || entry.buy_price_max > maxBuy.price) {
            maxBuy = {
              city: entry.city,
              price: entry.buy_price_max,
            };
          }
        }
      });

      const profit =
        minSell && maxBuy ? maxBuy.price - minSell.price : 'Sin datos';

      setMarketData({
        minSell,
        maxBuy,
        profit,
      });
    } catch (error) {
      console.error('Error al obtener datos de mercado:', error);
      setMarketData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setMarketData(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4 text-white">🛒 Market General</h1>

      <input
        type="text"
        placeholder="Buscar ítem..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 rounded mb-4"
      />

      {searchTerm && (
        <ul className="bg-gray-800 rounded p-2 mb-4 max-h-60 overflow-y-auto">
          {filteredItems.slice(0, 20).map((item) => (
            <li
              key={item.UniqueName}
              className="cursor-pointer hover:bg-gray-600 p-1 text-white"
              onClick={() => handleSelectItem(item)}
            >
              {item.LocalizedNames?.['ES-ES']} ({item.UniqueName})
            </li>
          ))}
          {filteredItems.length === 0 && <li className="text-white">Sin resultados</li>}
        </ul>
      )}

      {selectedItem && (
        <div className="bg-gray-900 p-4 rounded shadow text-white">
          <h2 className="text-2xl font-bold mb-2">
            {selectedItem.LocalizedNames?.['ES-ES']}
          </h2>
          <img
            src={`https://render.albiononline.com/v1/item/${selectedItem.UniqueName}.png`}
            alt={selectedItem.UniqueName}
            className="w-20 h-20 mb-4"
          />
          <button
            onClick={() => fetchMarketData(selectedItem.UniqueName)}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-800"
          >
            Consultar Precios
          </button>

          {loading && <p className="mt-4 text-yellow-400">Consultando datos...</p>}

          {marketData && (
            <div className="mt-4">
              <p>📉 <strong>Precio de venta más bajo:</strong>{' '}
                {marketData.minSell ? `${marketData.minSell.price} (en ${marketData.minSell.city})` : 'Sin datos'}
              </p>
              <p>📈 <strong>Precio de compra más alto:</strong>{' '}
                {marketData.maxBuy ? `${marketData.maxBuy.price} (en ${marketData.maxBuy.city})` : 'Sin datos'}
              </p>
              <p>💰 <strong>Margen estimado:</strong>{' '}
                {typeof marketData.profit === 'number' ? `${marketData.profit} de ganancia` : 'Sin datos'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Market;
