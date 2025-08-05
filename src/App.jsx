import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

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
          axios.get("https://albionsito-backend.onrender.com/items"),
          axios.get("/items.json"),
        ]);
        const raw = marketRes.data;
        const allInfo = infoRes.data;

        setAllItemsInfo(allInfo);

        const grouped = {};

        raw.forEach((item) => {
          const id = item.item_id;

          if (!grouped[id]) {
            grouped[id] = {
              item_id: id,
              buy_price: 0,
              buy_city: "",
              sell_price: 0,
              sell_city: "",
            };
          }

          const buy = item.buy_price_max || 0;
          const sell = item.sell_price_min || 0;

          if (buy > grouped[id].buy_price) {
            grouped[id].buy_price = buy;
            grouped[id].buy_city = item.city;
          }

          if ((grouped[id].sell_price === 0 || sell < grouped[id].sell_price) && sell !== 0) {
            grouped[id].sell_price = sell;
            grouped[id].sell_city = item.city;
          }
        });

        const processed = Object.values(grouped).map((item) => {
          const info = allInfo.find((i) => i.UniqueName === item.item_id);
          const profit = item.buy_price && item.sell_price
            ? item.buy_price - item.sell_price
            : 0;

          return {
            ...item,
            name: info ? info.LocalizedNames["ES-ES"] : item.item_id,
            image: info ? info.UniqueName : null,
            profit,
          };
        });

        setItemsData(processed);
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
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src="/icon.png" alt="icon" width={40} />
        <h1>Albionsito Mercado</h1>
      </header>

      <input
        type="text"
        placeholder="🔍 Buscar ítem..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          margin: "20px 0",
          border: "2px solid orange",
          fontSize: "16px",
        }}
      />

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
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
                    <img
                      src={`https://render.albiononline.com/v1/item/${item.image}.png`}
                      alt={item.name}
                      width={40}
                    />
                  ) : (
                    "❌"
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.buy_price.toLocaleString()} 🪙</td>
                <td>{item.buy_city}</td>
                <td>{item.sell_price.toLocaleString()} 🪙</td>
                <td>{item.sell_city}</td>
                <td
                  style={{
                    color: item.profit >= 0 ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {item.profit.toLocaleString()} 🪙
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
