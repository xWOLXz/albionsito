import React, { useState, useEffect } from 'react';
import itemsData from '../../public/items.json';

const ciudades = ["Caerleon", "Bridgewatch", "Lymhurst", "Martlock", "Thetford", "Fort Sterling", "Brecilien"];
const backends = [
  "https://albionsito-backend.onrender.com/items",
  "https://albionsito-backend2.onrender.com/items"
];

export default function Market() {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemPrices, setItemPrices] = useState({});
  const [loading, setLoading] = useState(false);

  // Buscar ítems por nombre
  useEffect(() => {
    if (query.length > 2) {
      const results = itemsData.filter(item =>
        item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15); // Máximo 15 resultados
      setFilteredItems(results);
    } else {
      setFilteredItems([]);
    }
  }, [query]);

  // Buscar precios al hacer clic
  const fetchPrices = async (itemId) => {
    setLoading(true);
    let data = [];
    for (const url of backends) {
      try {
        const res = await fetch(`${url}?ids=${itemId}`);
        if (res.ok) {
          data = await res.json();
          break;
        }
      } catch (err) {
        console.warn('❌ Backend falló:', url);
      }
    }

    const preciosPorCiudad = {};
    data.forEach(entry => {
      if (!entry.city || entry.sell_price_min === 0) return;
      preciosPorCiudad[entry.city] = {
        venta: entry.sell_price_min,
        compra: entry.buy_price_max || 0
      };
    });

    setItemPrices(prev => ({ ...prev, [itemId]: preciosPorCiudad }));
    setLoading(false);
  };

  const calcularGanancia = (venta, compra) => {
    const ganancia = venta - compra;
    return ganancia > 0 ? `+${ganancia.toLocaleString()}` : `${ganancia.toLocaleString()}`;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Market General</h1>

      <input
        type="text"
        placeholder="Buscar ítem..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ padding: 8, width: '100%', marginBottom: 20 }}
      />

      {filteredItems.map(item => (
        <div key={item.UniqueName} style={{ marginBottom: 30, borderBottom: '1px solid #444', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
              alt={item.LocalizedNames?.['ES-ES']}
              width={50}
              height={50}
              style={{ marginRight: 10 }}
            />
            <div>
              <strong>{item.LocalizedNames?.['ES-ES'] || item.UniqueName}</strong><br />
              <button onClick={() => fetchPrices(item.UniqueName)}>Ver precios</button>
            </div>
          </div>

          {loading && <p>Cargando precios...</p>}

          {itemPrices[item.UniqueName] && (
            <div style={{ marginTop: 10 }}>
              {ciudades.map(ciudad => {
                const datos = itemPrices[item.UniqueName][ciudad];
                if (!datos) return null;
                const { venta, compra } = datos;
                return (
                  <div key={ciudad}>
                    <strong>{ciudad}</strong>: 🛒 Venta: {venta.toLocaleString()} | 💰 Compra: {compra.toLocaleString()} | 📈 Ganancia: {calcularGanancia(venta, compra)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
