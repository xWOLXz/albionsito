import { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [itemsData, setItemsData] = useState([]);
  const [allItemsInfo, setAllItemsInfo] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const [marketRes, infoRes] = await Promise.all([
          axios.get(`https://west.albion-online-data.com/api/v2/stats/Prices/${itemId}?locations=Bridgewatch,Martlock,Caerleon,Brecilien,Lymhurst,Thetford,FortSterling&qualities=1`)
          axios.get("/items.json"),
        ]);

        const raw = marketRes.data;
        const allInfo = infoRes.data;

        const processed = [];

        const grouped = {};

        raw.forEach((entry) => {
          const id = entry.item_id;
          const city = entry.city;
          const sell = entry.sell_price_min;
          const buy = entry.buy_price_max;

          if (!grouped[id]) {
            grouped[id] = {
              item_id: id,
              sell_price: sell,
              sell_city: city,
              buy_price: buy,
              buy_city: city,
            };
          } else {
            if (sell > 0 && (grouped[id].sell_price === 0 || sell < grouped[id].sell_price)) {
              grouped[id].sell_price = sell;
              grouped[id].sell_city = city;
            }

            if (buy > grouped[id].buy_price) {
              grouped[id].buy_price = buy;
              grouped[id].buy_city = city;
            }
          }
        });

        for (const id in grouped) {
          const item = grouped[id];
          item.gain = item.sell_price > 0 ? item.buy_price - item.sell_price : 0;
          processed.push(item);
        }

        processed.sort((a, b) => b.gain - a.gain);

        setItemsData(processed);
        setAllItemsInfo(allInfo);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }

      setLoading(false);
    };

    fetchItems();
  }, []);

  const filteredItems = itemsData.filter((item) => {
    const info = allItemsInfo.find((i) => i.UniqueName === item.item_id);
    const nombre = info && info.LocalizedNames && info.LocalizedNames["ES-ES"]
  ? info.LocalizedNames["ES-ES"]
  : item.item_id;
    return nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <img src="/icon.png" alt="icon" className="w-6 h-6" /> Albionsito Mercado
      </h1>

      <input
        type="text"
        placeholder="Buscar item..."
        className="border p-2 rounded mb-4 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <div className="text-center">
          <img src="/albion-loader.gif" className="w-16 h-16 mx-auto" />
          <p className="mt-2">Cargando datos del mercado...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Ítem</th>
                <th className="border px-2 py-1">Compra + alta</th>
                <th className="border px-2 py-1">Venta − baja</th>
                <th className="border px-2 py-1">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.slice(0, 30).map((item, idx) => {
                const info = allItemsInfo.find((i) => i.UniqueName === item.item_id);
                const nombre = info?.LocalizedNames?.["ES-ES"] || item.item_id;
                const img = info?.ShopImage || item.item_id;

                return (
                  <tr key={idx} className="border-t">
                    <td className="border px-2 py-1 flex items-center gap-2">
                      <img
                        src={`https://render.albiononline.com/v1/item/${img}.png`}
                        alt={item.item_id}
                        className="w-6 h-6"
                      />
                      {nombre}
                    </td>
                    <td className="border px-2 py-1">
                      {item.buy_price.toLocaleString()} <span className="text-xs text-gray-500">({item.buy_city})</span>
                    </td>
                    <td className="border px-2 py-1">
                      {item.sell_price.toLocaleString()} <span className="text-xs text-gray-500">({item.sell_city})</span>
                    </td>
                    <td className="border px-2 py-1 font-bold text-green-600">
                      {item.gain.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;
