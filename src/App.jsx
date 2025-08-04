import React, { useEffect, useState } from "react";
import "./App.css";

const API_ITEMS = "https://albionsito-backend.onrender.com/items";
const ITEMS_JSON = "/items.json"; // desde public/

const calidadTexto = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
};

function App() {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtrado, setFiltrado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombres, setNombres] = useState({});

  const cargarItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ITEMS);
      const data = await res.json();
      setDatos(data);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarNombres = async () => {
    try {
      const res = await fetch(ITEMS_JSON);
      const data = await res.json();
      const nombresMap = {};
      data.forEach((item) => {
        nombresMap[item.id] = item.name;
      });
      setNombres(nombresMap);
    } catch (err) {
      console.error("Error cargando nombres:", err);
    }
  };

  useEffect(() => {
    cargarItems();
    cargarNombres();
  }, []);

  useEffect(() => {
    const agrupados = {};
    datos.forEach((item) => {
      const key = `${item.item_id}-${item.quality}`;
      if (!agrupados[key]) {
        agrupados[key] = {
          item_id: item.item_id,
          quality: item.quality,
          mejorVenta: item,
          mejorCompra: item,
        };
      } else {
        if (item.sell_price_max > agrupados[key].mejorVenta.sell_price_max) {
          agrupados[key].mejorVenta = item;
        }
        if (
          item.buy_price_min > 0 &&
          (agrupados[key].mejorCompra.buy_price_min === 0 ||
            item.buy_price_min < agrupados[key].mejorCompra.buy_price_min)
        ) {
          agrupados[key].mejorCompra = item;
        }
      }
    });

    const resultado = Object.values(agrupados).map((grupo) => {
      const margen =
        grupo.mejorVenta.sell_price_max - grupo.mejorCompra.buy_price_min;
      return {
        item_id: grupo.item_id,
        quality: grupo.quality,
        ciudadVenta: grupo.mejorVenta.city,
        venta: grupo.mejorVenta.sell_price_max,
        ciudadCompra: grupo.mejorCompra.city,
        compra: grupo.mejorCompra.buy_price_min,
        margen,
      };
    });

    const filtrado = resultado
      .filter((item) =>
        item.item_id.toLowerCase().includes(busqueda.toLowerCase())
      )
      .sort((a, b) => b.margen - a.margen);

    setFiltrado(filtrado);
  }, [datos, busqueda]);

  return (
    <div className="App">
      <h1>📦 Albionsito <span style={{ color: "#888" }}>Mercado</span></h1>
      <input
        type="text"
        placeholder="Buscar ítem..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: "10px", padding: "6px", fontSize: "16px" }}
      />
      <button onClick={cargarItems} title="Actualizar">
        🔄
      </button>

      {loading ? (
        <div style={{ marginTop: "20px" }}>
          <img src="/albion-loader.gif" alt="Cargando..." width="120" />
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ítem</th>
              <th>Calidad</th>
              <th>Venta ↑</th>
              <th>Ciudad</th>
              <th>Compra ↓</th>
              <th>Ciudad</th>
              <th>Ganancia 💰</th>
            </tr>
          </thead>
          <tbody>
            {filtrado.map((item, index) => (
              <tr key={index}>
                <td style={{ textAlign: "left" }}>
                  <img
                    src={`https://render.albiononline.com/v1/item/${item.item_id}.png`}
                    alt={item.item_id}
                    width="30"
                    style={{ verticalAlign: "middle", marginRight: "6px" }}
                  />
                  {nombres[item.item_id] || item.item_id}
                </td>
                <td>{calidadTexto[item.quality]}</td>
                <td>{item.venta.toLocaleString()}</td>
                <td>{item.ciudadVenta}</td>
                <td>{item.compra.toLocaleString()}</td>
                <td>{item.ciudadCompra}</td>
                <td style={{ fontWeight: "bold" }}>
                  {item.margen.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
