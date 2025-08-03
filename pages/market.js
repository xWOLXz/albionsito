import { useState } from 'react';
import itemsData from '../utils/items.json';
import Image from 'next/image';

export default function Market() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);

  const cities = ['Caerleon', 'Martlock', 'Bridgewatch', 'Thetford', 'Fort Sterling', 'Lymhurst'];

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      const results = itemsData.filter(
        (item) =>
          item?.LocalizedNames?.['ES-ES'] &&
          item.LocalizedNames['ES-ES'].toLowerCase().includes(term.toLowerCase())
      );
      setFilteredItems(results.slice(0, 10));
    } else {
      setFilteredItems([]);
    }
  };

  const fetchMarketData = async (itemId) => {
    try {
      setLoading(true);
      const locations = cities.join(',');
      const response = await fetch(
        `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${locations}&qualities=1`
      );
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setMarketData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setFilteredItems([]);
    setSearchTerm(item.LocalizedNames['ES-ES']);
    fetchMarketData(item.UniqueName);
  };

  const getLowestSell = () => {
    if (!marketData) return null;
    return marketData.reduce((min, item) => {
      return item.sell_price_min > 0 && item.sell_price_min < min.sell_price_min ? item : min;
    }, { sell_price_min: Infinity });
  };

  const getHighestBuy = () => {
    if (!marketData) return null;
    return marketData.reduce((max, item) => {
      return item.buy_price_max > max.buy_price_max ? item : max;
    }, { buy_price_max: 0 });
  };

  const lowestSell = getLowestSell();
  const highestBuy = getHighestBuy();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">📦 Mercado General - Albion</h1>

      <div className="max-w-xl mx-auto relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar ítem..."
          className="w-full px-4 py-2 rounded bg-gray-800 text-white"
        />
        {filteredItems.length > 0 && (
          <ul className="absolute z-10 bg-gray-800 w-full mt-1 rounded shadow-lg max-h-64 overflow-y-auto">
            {filteredItems.map((item) => (
              <li
                key={item.UniqueName}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <img
                  src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                  alt={item.LocalizedNames['ES-ES']}
                  className="w-6 h-6"
                />
                {item.LocalizedNames['ES-ES']}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && (
        <div className="flex justify-center mt-8">
          <Image src="/albion-loader.gif" alt="Cargando..." width={64} height={64} />
        </div>
      )}

      {selectedItem && marketData && !loading && (
        <div className="mt-8 bg-gray-800 p-4 rounded shadow max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={`https://render.albiononline.com/v1/item/${selectedItem.UniqueName}.png`}
              alt={selectedItem.LocalizedNames['ES-ES']}
              className="w-12 h-12"
            />
            <h2 className="text-xl font-semibold">{selectedItem.LocalizedNames['ES-ES']}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-bold">💰 Precio más bajo (Venta)</h3>
              <p>{lowestSell?.sell_price_min.toLocaleString()} <span className="text-sm text-gray-400">plata</span></p>
              <p className="text-sm text-gray-400">📍 {lowestSell?.city}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-bold">🪙 Precio más alto (Compra)</h3>
              <p>{highestBuy?.buy_price_max.toLocaleString()} <span className="text-sm text-gray-400">plata</span></p>
              <p className="text-sm text-gray-400">📍 {highestBuy?.city}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-bold">📈 Ganancia Potencial</h3>
              <p>
                {highestBuy && lowestSell
                  ? (highestBuy.buy_price_max - lowestSell.sell_price_min).toLocaleString()
                  : '0'}{' '}
                <span className="text-sm text-gray-400">plata</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
                }
