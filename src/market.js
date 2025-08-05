import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Market = () => {
  const [itemsData, setItemsData] = useState([]);
  const [allItemsInfo, setAllItemsInfo] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar items.json (nombres e íconos)
  useEffect(() => {
    const fetchItemsInfo = async () => {
      try {
        const response = await fetch('/items.json');
        const data = await response.json();
        setAllItemsInfo(data);
      } catch (error) {
        console.error('Error cargando items.json:', error);
      }
    };

    fetchItemsInfo();
  }, []);

  // Buscar precios solo al escribir
  useEffect(() => {
    const fetchMarketData = async () => {
      if (searchTerm.trim() === '') {
        setItemsData([]);
        return;
      }

      setLoading(true);

      const matchedItem = allItemsInfo.find((item) => {
        const nombre = item?.LocalizedNames?.['ES-ES']?.toLowerCase() || '';
        return nombre.includes(searchTerm.toLowerCase());
      });

      if (!matchedItem) {
        setItemsData([]);
        setLoading(false);
        return;
      }

      const itemId = matchedItem.UniqueName;

      try {
        const response = await axios.get(
          `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}?locations=Caerleon,Bridgewatch,Martlock,FortSterling,Lymhurst,Thetford`
        );
        const filtered = response.data.filter((item) => item.sell_price_min > 0 || item.buy_price_max > 0);
        setItemsData(filtered);
      } catch (error) {
        console.error('Error al obtener datos del market:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchMarketData, 700);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, allItemsInfo]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4 text-white">🛒 Market General</h1>
      <input
        type="text"
        placeholder="Buscar ítem en español..."
        className="w-full p-3 rounded-xl text-black mb-6"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && (
        <div className="text-center text-white mb-4">
          <img src="/albion-loader.gif" alt="Cargando..." className="mx-auto w-12" />
          <p>Cargando precios...</p>
        </div>
      )}

      {!loading && itemsData.length > 0 && (
        <div className="space-y-4">
          {itemsData.map((item, index) => {
            const info = allItemsInfo.find((i) => i.UniqueName === item.item_id);
            const nombre = info?.LocalizedNames?.['ES-ES'] || item.item_id;
            const imagen = info?.ShopImage || item.item_id;

            return (
              <div
                key={index}
                className="bg-zinc-800 p-4 rounded-xl flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`https://render.albiononline.com/v1/item/${imagen}.png`}
                    alt={nombre}
                    className="w-14 h-14"
                  />
                  <span className="text-white font-semibold">{nombre}</span>
                </div>
                <div className="text-right text-white">
                  <p>🛒 Mín Venta: {item.sell_price_min.toLocaleString()} 🏙 {item.city}</p>
                  <p>💰 Máx Compra: {item.buy_price_max.toLocaleString()} 🏙 {item.city}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && searchTerm.trim() !== '' && itemsData.length === 0 && (
        <p className="text-center text-gray-400">No se encontraron resultados.</p>
      )}
    </div>
  );
};

export default Market;
