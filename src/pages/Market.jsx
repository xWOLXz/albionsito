import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND1 = "https://albionsito-backend.onrender.com";
const BACKEND2 = "https://albionsito-backend2.onrender.com";

export default function Market({ item }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Pedir datos a los dos backends en paralelo
        const [res1, res2] = await Promise.all([
          axios.get(`${BACKEND1}/api/prices/${item}`),
          axios.get(`${BACKEND2}/api/prices/${item}`),
        ]);

        // Combinar y limpiar datos
        const allData = [...res1.data, ...res2.data]
          .map((d) => ({
            city: d.city,
            buy_price: d.buy_price,
            sell_price: d.sell_price,
            date: new Date(d.date),
          }))
          // Ordenar por fecha más reciente
          .sort((a, b) => b.date - a.date);

        // Filtrar duplicados por ciudad y quedarnos con los últimos 5
        const filtered = [];
        const seenCities = new Set();

        for (const entry of allData) {
          const key = entry.city;
          if (!seenCities.has(key)) {
            seenCities.add(key);
            filtered.push(entry);
          }
          if (filtered.length >= 5) break;
        }

        setPrices(filtered);
      } catch (error) {
        console.error("Error obteniendo precios:", error);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // actualizar cada 30s
    return () => clearInterval(interval);
  }, [item]);

  if (loading) return <p>Cargando precios...</p>;

  return (
    <div>
      <h2>Últimos precios para: {item}</h2>
      <table>
        <thead>
          <tr>
            <th>Ciudad</th>
            <th>Compra</th>
            <th>Venta</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((p, idx) => (
            <tr key={idx}>
              <td>{p.city}</td>
              <td>{p.buy_price.toLocaleString()}</td>
              <td>{p.sell_price.toLocaleString()}</td>
              <td>{p.date.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
