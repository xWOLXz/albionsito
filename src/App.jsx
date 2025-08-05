// src/App.jsx
import React, { useEffect, useState } from "react";
import "./index.css";

const API_URL = "https://albionsito-backend.onrender.com/items";
const ITEMS_JSON = "/items.json";

function App() {
  const [itemsData, setItemsData] = useState([]);
  const [allItemsInfo, setAllItemsInfo] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [pricesRes, infoRes] = await Promise.all([
          fetch(API_URL),
          fetch(ITEMS_JSON),
        ]);

        const prices = await pricesRes.json();
        const infos = await infoRes.json();

        setAllItemsInfo(infos);

        // Agrupar los precios por item_id y calidad
        const grouped = {};
        prices.forEach((entry) => {
          const key = `${entry.item_id}-${entry.quality}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(entry);
        });

        // Procesar para obtener info con mayor ganancia
        const processed = Object.keys(grouped).map((key) => {
          const [item_id, quality] = key.split("-");
          const entries = grouped[key];

          let maxSell = { price: 0, city: "" };
          let minBuy = { price: Infinity, city: "" };

          entries.forEach((e) => {
            if (e.sell_price_min > maxSell.price) {
              maxSell = { price: e.sell_price_min, city: e.city };
            }
            if (e.buy_price_max < minBuy.price) {
              minBuy = { price: e.buy_price_max, city: e.city };
            }
          });

          const gain = maxSell.price - minBuy.price;
          return {
            item_id,
            quality,
            sell_price: maxSell.price,
            sell_city: maxSell.city,
            buy_price: minBuy.price,
            buy_city: minBuy.city,
            gain,
          };
        });

        // Ordenar por ganancia
        processed.sort((a, b) => b.gain - a.gain);
        setItemsData(processed);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = itemsData.filter((item) => {
    const info = allItemsInfo.find((i) => i.UniqueName === item.item_id);
    const name = info?.LocalizedNames?.["ES-ES"]?.toLowerCase() || "";
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <img src="/icon.png" alt="icon" className="w-6 h-6" /> Albionsito Mercado
      </h1>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar ítem..."
          className="border p-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center">
          <img src="/albion-loader.gif" alt="Cargando..." className="w-16 h-16" />
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Ítem</th>
              <th className="p-2">Calidad</th>
              <th className="p-2">Venta</th>
              <th className="p-2">Ciudad</th>
              <th className="p-2">Compra</th>
              <th className="p-2">Ciudad</th>
              <th className="p-2">Ganancia 🪙</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => {
              const info = allItemsInfo.find((i) => i.UniqueName === item.item_id);
              const nombre = info?.LocalizedNames?."ES-ES" || item.item_id;
              const img = info?.ShopImage || item.item_id;
              return (
                <tr key={idx} className="text-center border-b">
                  <td className="p-2 flex items-center gap-2">
                    <img
                      src={`https://render.albiononline.com/v1/item/${img}.png`}
                      alt={nombre}
                      className="w-10 h-10"
                    />
                    {nombre}
                  </td>
                  <td>{item.quality}</td>
                  <td>{item.sell_price.toLocaleString()}</td>
                  <td>{item.sell_city}</td>
                  <td>{item.buy_price.toLocaleString()}</td>
                  <td>{item.buy_city}</td>
                  <td className="font-bold text-right pr-4">
                    {item.gain.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
