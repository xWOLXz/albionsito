// Reemplaza este archivo completo como market.jsx
import React, { useEffect, useState } from 'react';
import './market.css'; // Opcional para estilos si usas

const ciudades = ["Caerleon", "Bridgewatch", "Lymhurst", "Martlock", "Thetford", "Fort Sterling", "Brecilien"];
const backends = [
  'https://albionsito-backend.onrender.com/items',
  'https://albionsito-backend2.onrender.com/items'
];

function obtenerMejorPrecio(datosFiltrados, tipo, ciudad) {
  const precios = datosFiltrados
    .filter((i) => i.city === ciudad && i[tipo] > 0)
    .map((i) => i[tipo]);
  return precios.length > 0 ? (tipo === 'sell_price_min' ? Math.min(...precios) : Math.max(...precios)) : 0;
}

export default function Market() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);

  const fetchData = async () => {
    setCargando(true);
    for (const url of backends) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const filtrados = data.filter(i =>
            i.sell_price_min > 0 || i.buy_price_max > 0
          );
          const agrupados = {};
          filtrados.forEach(i => {
            const clave = i.item_id;
            if (!agrupados[clave]) agrupados[clave] = [];
            agrupados[clave].push(i);
          });

          const itemsProcesados = Object.entries(agrupados).map(([item_id, registros]) => {
            const mejoresPrecios = ciudades.map(ciudad => ({
              ciudad,
              venta: obtenerMejorPrecio(registros, 'sell_price_min', ciudad),
              compra: obtenerMejorPrecio(registros, 'buy_price_max', ciudad)
            }));
            const mejorVenta = mejoresPrecios.reduce((a, b) => a.venta > b.venta ? a : b);
            const mejorCompra = mejoresPrecios.reduce((a, b) => a.compra > b.compra ? a : b);
            const ganancia = mejorVenta.venta - mejorCompra.compra;

            return {
              item_id,
              nombre: item_id.replace(/_/g, ' ').replace('T', 'Tier '),
              imagen: `https://render.albiononline.com/v1/item/${item_id}.png`,
              venta: mejorVenta.venta,
              ciudadVenta: mejorVenta.ciudad,
              compra: mejorCompra.compra,
              ciudadCompra: mejorCompra.ciudad,
              ganancia
            };
          });

          const itemsOrdenados = itemsProcesados
            .filter(i => i.ganancia > 0)
            .sort((a, b) => b.ganancia - a.ganancia)
            .slice(0, 30);

          setItems(itemsOrdenados);
          break; // rompe si uno funciona
        }
      } catch (error) {
        console.warn(`⚠️ Falló la URL: ${url}`);
      }
    }
    setCargando(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resultados = items.filter(i =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="market-container">
      <h1>📊 Top ítems comerciales</h1>
      <input
        type="text"
        placeholder="Buscar ítem..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="buscador"
      />
      <button onClick={fetchData} className="actualizar">🔄</button>
      {cargando ? (
        <p>Cargando datos...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ítem</th>
              <th>Venta 📤</th>
              <th>Compra 📥</th>
              <th>Ganancia 💰</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((item) => (
              <tr key={item.item_id}>
                <td>
                  <img src={item.imagen} alt={item.nombre} width="32" />
                  <br />
                  {item.nombre}
                </td>
                <td>
                  {item.venta.toLocaleString()} <br />
                  <small>{item.ciudadVenta}</small>
                </td>
                <td>
                  {item.compra.toLocaleString()} <br />
                  <small>{item.ciudadCompra}</small>
                </td>
                <td>{item.ganancia.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
