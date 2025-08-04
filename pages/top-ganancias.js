import { useEffect, useState } from 'react';
import Image from 'next/image';
import items from '../public/items.json';

const API = 'https://albionsito-backend.onrender.com';

export default function TopGanancias() {
  const [itemsData, setItemsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getItemImage = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item && item.icon) return item.icon;
    return `https://render.albiononline.com/v1/item/${itemId}.png`;
  };

  const getItemName = (itemId) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : itemId;
  };

  const getCityEmoji = (city) => {
    switch (city) {
      case 'Bridgewatch': return '🏜️ Bridgewatch';
      case 'Martlock': return '❄️ Martlock';
      case 'Thetford': return '☠️ Thetford';
      case 'Fort Sterling': return '🏰 Fort Sterling';
      case 'Lymhurst': return '🌳 Lymhurst';
      case 'Caerleon': return '🔥 Caerleon';
      case 'Brecilien': return '📍 Brecilien';
      default: return city;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/top`);
        const data = await res.json();
        setItemsData(data.slice(0, 30));
      } catch (err) {
        console.error('Error al cargar top:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">🔥 Top 30 Ganancias</h1>
      {loading ? (
        <p className="text-center">Cargando ítems más rentables...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2">Ícono</th>
                <th className="p-2">Ítem</th>
                <th className="p-2">Compra</th>
                <th className="p-2">Venta</th>
                <th className="p-2">Margen</th>
              </tr>
            </thead>
            <tbody>
              {itemsData.map((entry, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-900">
                  <td className="p-2">
                    <Image
                      src={getItemImage(entry.item_id)}
                      alt={entry.item_id}
                      width={48}
                      height={48}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/no-img.png';
                      }}
                      className="rounded w-12 h-12 object-contain"
                    />
                  </td>
                  <td className="p-2">{getItemName(entry.item_id)}</td>
                  <td className="p-2 text-green-400">
                    {entry.buy_price.toLocaleString()} 🪙
                    <br />
                    <small>{getCityEmoji(entry.buy_city)}</small>
                  </td>
                  <td className="p-2 text-yellow-300">
                    {entry.sell_price.toLocaleString()} 🪙
                    <br />
                    <small>{getCityEmoji(entry.sell_city)}</small>
                  </td>
                  <td className="p-2 text-blue-400 font-semibold">
                    +{entry.margin.toLocaleString()} 🪙
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
                        }
