import { useEffect, useState } from 'react';
import Image from 'next/image';
import items from '../public/items.json';

const API_BACKEND = 'https://albionsito-backend.onrender.com';

export default function Market() {
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    if (search.length === 0) {
      setFilteredItems([]);
      return;
    }

    const results = items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredItems(results);
  }, [search]);

  const getItemImage = (item) => {
    if (item.icon) return item.icon;
    return `https://render.albiononline.com/v1/item/${item.id}.png`;
  };

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    setLoadingPrices(true);

    try {
      const res = await fetch(`${API_BACKEND}/prices/${item.id}`);
      const data = await res.json();
      setPrices(data);
    } catch (err) {
      console.error('Error al cargar precios:', err);
      setPrices([]);
    }

    setLoadingPrices(false);
  };

  const getCityName = (city) => {
    switch (city) {
      case 'Bridgewatch': return 'Bridgewatch 🏜️';
      case 'Martlock': return 'Martlock ❄️';
      case 'Thetford': return 'Thetford ☠️';
      case 'Fort Sterling': return 'Fort Sterling 🏰';
      case 'Lymhurst': return 'Lymhurst 🌳';
      case 'Caerleon': return 'Caerleon 🔥';
      case 'Brecilien': return 'Brecilien 📍';
      default: return city;
    }
  };

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">Buscar Ítem</h1>

      <input
        type="text"
        placeholder="Espada, hacha, capa, montura..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 text-black rounded"
      />

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleSelectItem(item)}
            className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700"
          >
            <div className="flex items-center space-x-4">
              <Image
                src={getItemImage(item)}
                alt={item.name}
                width={64}
                height={64}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/no-img.png';
                }}
                className="rounded w-16 h-16 object-contain"
              />
              <span className="text-xl">{item.name}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-2">💰 Precios de: {selectedItem.name}</h2>
          {loadingPrices ? (
            <p>Cargando precios...</p>
          ) : prices.length === 0 ? (
            <p>No hay datos disponibles.</p>
          ) : (
            prices.map((entry, idx) => (
              <div key={idx} className="bg-gray-900 p-3 mb-2 rounded">
                <p className="text-yellow-400">{getCityName(entry.city)}</p>
                <p>🛒 Venta: {entry.sell_price_min > 0 ? `${entry.sell_price_min.toLocaleString()} 🪙` : 'Sin datos'}</p>
                <p>🧺 Compra: {entry.buy_price_max > 0 ? `${entry.buy_price_max.toLocaleString()} 🪙` : 'Sin datos'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
            }
