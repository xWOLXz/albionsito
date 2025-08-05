import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MARKET_API = 'https://albionsito-backend.onrender.com/items';
const ITEMS_JSON = '/items.json';

const formatGold = (value) => {
  return value.toLocaleString('es-CO');
};

const MarketGeneral = () => {
  const [marketData, setMarketData] = useState([]);
  const [itemsInfo, setItemsInfo] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketRes, itemsRes] = await Promise.all([
          axios.get(MARKET_API),
          axios.get(ITEMS_JSON),
        ]);

        const groupedItems = {};

        // Agrupar por item_id para encontrar el mejor precio de compra y venta
        marketRes.data.forEach((entry) => {
          const { item_id, city, buy_price_min, sell_price_max } = entry;
          if (!groupedItems[item_id]) {
            groupedItems[item_id] = {
              item_id,
              buy: { price: buy_price_min, city },
              sell: { price: sell_price_max, city },
            };
          } else {
            if (buy_price_min > 0 && buy_price_min < groupedItems[item_id].buy.price) {
              groupedItems[item_id].buy = { price: buy_price_min, city };
            }
            if (sell_price_max > groupedItems[item_id].sell.price) {
              groupedItems[item_id].sell = { price: sell_price_max, city };
            }
          }
        });

        // Transformar a array y calcular ganancia
        const finalItems = Object.values(groupedItems)
          .filter((item) => item.buy.price > 0 && item.sell.price > 0)
          .map((item) => {
            const info = itemsRes.data[item.item_id] || {};
            const name = info.name || item.item_id;
            const icon = info.icon || null;
            const profit = item.sell.price - item.buy.price;
            return {
              ...item,
              name,
              icon,
              profit,
            };
          })
          .sort((a, b) => b.profit - a.profit); // ordenar por ganancia

        setItemsInfo(itemsRes.data);
        setMarketData(finalItems);
      } catch (error) {
        console.error('Error cargando los datos del mercado:', error);
      }
    };

    fetchData();
  }, []);

  const filteredItems = marketData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4 text-white">🛒 Market General</h1>
      <input
        type="text"
        placeholder="🔍 Buscar ítem..."
        className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredItems.length === 0 ? (
        <p className="text-white text-center mt-4">No se encontraron resultados.</p>
      ) : (
        <table className="w-full table-auto border border-gray-700 text-sm bg-white rounded overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">Ícono</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Compra (↑)</th>
              <th className="p-2">Ciudad</th>
              <th className="p-2">Venta (↓)</th>
              <th className="p-2">Ciudad</th>
              <th className="p-2">Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.item_id} className="text-center border-t border-gray-300">
                <td className="p-2">
                  {item.icon ? (
                    <img
                      src={`https://render.albiononline.com/v1/item/${item.icon}`}
                      alt={item.name}
                      className="w-8 h-8 inline-block"
                    />
                  ) : (
                    '❌'
                  )}
                </td>
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-yellow-600 font-semibold">
                  {formatGold(item.buy.price)} 🪙
                </td>
                <td className="p-2">{item.buy.city}</td>
                <td className="p-2 text-yellow-600 font-semibold">
                  {formatGold(item.sell.price)} 🪙
                </td>
                <td className="p-2">{item.sell.city}</td>
                <td className={`p-2 font-bold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.profit >= 0 ? '+' : ''}
                  {formatGold(item.profit)} 🪙
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MarketGeneral;
