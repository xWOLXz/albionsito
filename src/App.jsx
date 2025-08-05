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
          axios.get(
            "https://albionsito-backend.onrender.com/items"
          ),
          axios.get("/items.json")
        ]);

        const raw = marketRes.data;
        const allInfo = infoRes.data;

        const grouped = {};

        for (const item of raw) {
          const id = item.item_id;
          if (!grouped[id]) {
            grouped[id] = {
              item_id: id,
              sell_price: item.sell_price_min || 0,
              sell_city: item.city,
              buy_price: item.buy_price_max || 0,
              buy_city: item.city,
            };
          } else {
            if (
              item.sell_price_min &&
              (grouped[id].sell_price === 0 ||
                item.sell_price_min < grouped[id].sell_price)
            ) {
              grouped[id].sell_price = item.sell_price_min;
              grouped[id].sell_city = item.city;
            }

            if (
              item.buy_price_max &&
              item.buy_price_max > grouped[id].buy_price
            ) {
              grouped[id].buy_price = item.buy_price_max;
              grouped[id].buy_city = item.city;
            }
          }
        }

        const processed = Object.values(grouped)
          .map((item) => {
            const itemInfo = allInfo.find((i) => i.UniqueName === item.item_id);
            return {
              ...item,
              name: itemInfo ? itemInfo.LocalizedNames["ES-ES"] : item.item_id,
              image: itemInfo
                ? `https://render.albiononline.com/v1/item/${item.item_id}.png`
                : null,
              profit:
                item.sell_price && item.buy_price
                  ? item.buy_price - item.sell_price
                  : 0,
            };
          })
          .filter((item) => item.profit > 0)
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 30);

        setItemsData(processed);
        setAllItemsInfo(allInfo);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = itemsData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <img src="/icon.png" alt="icon" style={{ height: "40px" }} />
      <h1>Albionsito Mercado</h1>

      <input
        type="text"
        placeholder="Buscar ítem..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: "0.5rem", marginBottom: "1rem", width: "100%" }}
      />

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <table width="100%" border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Ícono</th>
              <th>Nombre</th>
              <th>Compra (↑)</th>
              <th>Ciudad</th>
              <th>Venta (↓)</th>
              <th>Ciudad</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.item_id}>
                <td>
                  {item.image ? (
                    <img src={item.image} alt={item.name} width="40" />
                  ) : (
                    "❌"
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.buy_price.toLocaleString()} 🪙</td>
                <td>{item.buy_city}</td>
                <td>{item.sell_price.toLocaleString()} 🪙</td>
                <td>{item.sell_city}</td>
                <td style={{ fontWeight: "bold", color: "green" }}>
                  +{item.profit.toLocaleString()} 🪙
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
