import React, { useEffect, useState } from "react";
import "./App.css";

const backendURL = "https://albionsito-backend.onrender.com";
const itemsJSONUrl = "/items.json";

export default function App() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(itemsJSONUrl)
      .then((res) => res.json())
      .then(setItems)
      .catch(() => {
        fetch(`${backendURL}/items`)
          .then((res) => res.json())
          .then(setItems)
          .catch(() => setItems([]));
      });
  }, []);

  useEffect(() => {
    const filtered = items.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [search, items]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setLoading(true);
    fetch(`${backendURL}/prices/${item.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPrices(data);
        setLoading(false);
      })
      .catch(() => setPrices([]));
  };

  return (
    <div style={{ display: "flex", padding: "1rem" }}>
      {/* Columna izquierda */}
      <div style={{ width: "30%", paddingRight: "1rem" }}>
        <h1>
          <img
            src="/favicon.ico"
            alt="Albionsito"
            style={{ width: 32, verticalAlign: "middle", marginRight: 10 }}
          />
          Mercado
        </h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ítem..."
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
          {filteredItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <img
                  src={`https://render.albiononline.com/v1/item/${item.id}.png`}
                  alt={item.name}
                  style={{ width: 30, height: 30, marginRight: 10 }}
                />
                {item.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Columna derecha */}
      <div style={{ width: "70%" }}>
        {selectedItem ? (
          <>
            <h2>
              Resultados para:{" "}
              <img
                src={`https://render.albiononline.com/v1/item/${selectedItem.id}.png`}
                alt={selectedItem.name}
                style={{ width: 30, verticalAlign: "middle", marginRight: 10 }}
              />
              {selectedItem.name}
            </h2>
            {loading ? (
              <p>Cargando precios...</p>
            ) : (
              <table border="1" cellPadding="6">
                <thead>
                  <tr>
                    <th>Ciudad</th>
                    <th>Calidad</th>
                    <th>Venta ↑</th>
                    <th>Compra ↑</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p, i) => (
                    <tr key={i}>
                      <td>{p.city}</td>
                      <td>{p.quality}</td>
                      <td>{p.sell_price_min}</td>
                      <td>{p.buy_price_max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p>Selecciona un item para ver precios.</p>
        )}
      </div>
    </div>
  );
}
