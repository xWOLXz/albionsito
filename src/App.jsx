import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://albionsito-backend.onrender.com/items';
const ITEMS_JSON_URL = '/items.json';

const ciudades = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Caerleon'];

function formatearNumero(numero) {
  return numero.toLocaleString('es-CO');
}

function App() {
  const [data, setData] = useState([]);
  const [itemsData, setItemsData] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [marketRes, itemsRes] = await Promise.all([
        fetch(API_URL),
        fetch(ITEMS_JSON_URL),
      ]);

      const market = await marketRes.json();
      const items = await itemsRes.json();

      const agrupado = {};

      market.forEach((entry) => {
        const { item_id, quality, city, sell_price_min, buy_price_max } = entry;

        const clave = `${item_id}_${quality}`;
        if (!agrupado[clave]) {
          agrupado[clave] = {
            item_id,
            quality,
            sell_price_min: sell_price_min || 0,
            sell_city: city,
            buy_price_max: buy_price_max || 0,
            buy_city: city,
          };
        } else {
          if (sell_price_min && (!agrupado[clave].sell_price_min || sell_price_min < agrupado[clave].sell_price_min)) {
            agrupado[clave].sell_price_min = sell_price_min;
            agrupado[clave].sell_city = city;
          }
          if (buy_price_max && buy_price_max > agrupado[clave].buy_price_max) {
            agrupado[clave].buy_price_max = buy_price_max;
            agrupado[clave].buy_city = city;
          }
        }
      });

      const lista = Object.values(agrupado)
        .map((item) => ({
          ...item,
          profit: item.buy_price_max - item.sell_price_min,
        }))
        .filter((item) => item.sell_price_min > 0 && item.buy_price_max > 0)
        .sort((a, b) => b.profit - a.profit);

      setItemsData(items);
      setData(lista);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getNombreItem = (itemId) => {
    return itemsData[itemId]?.name || itemId;
  };

  const getImagenItem = (itemId) => {
    return `https://render.albiononline.com/v1/item/${itemId}.png`;
  };

  const calidadTexto = ['I', 'II', 'III', 'IV', 'V'];

  const resultadosFiltrados = search.trim()
    ? data.filter((item) =>
        getNombreItem(item.item_id).toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="App">
      <h1>📦 Albionsito <span style={{ color: '#666' }}>Mercado</span></h1>

      <div className="barra-busqueda">
        <input
          type="text"
          placeholder="Buscar ítem..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={cargarDatos} title="Actualizar">
          🔄
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <img src="/albion-loader.gif" alt="Cargando..." />
        </div>
      ) : (
        <>
          {resultadosFiltrados.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Ítem</th>
                  <th>Calidad</th>
                  <th>Venta ↑</th>
                  <th>Ciudad</th>
                  <th>Compra ↓</th>
                  <th>Ciudad</th>
                  <th>Ganancia 🪙</th>
                </tr>
              </thead>
              <tbody>
                {resultadosFiltrados.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <img
                        src={getImagenItem(item.item_id)}
                        alt={item.item_id}
                        className="item-icon"
                      />{' '}
                      {getNombreItem(item.item_id)}
                    </td>
                    <td>{calidadTexto[item.quality - 1]}</td>
                    <td>{formatearNumero(item.buy_price_max)}</td>
                    <td>{item.buy_city}</td>
                    <td>{formatearNumero(item.sell_price_min)}</td>
                    <td>{item.sell_city}</td>
                    <td><b>{formatearNumero(item.profit)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default App;
