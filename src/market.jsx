import { useEffect, useState } from 'react';

const ciudades = ["Caerleon", "Bridgewatch", "Lymhurst", "Martlock", "Thetford", "Fort Sterling", "Brecilien"];
const backends = [
  "https://albionsito-backend.onrender.com/items",
  "https://albionsito-backend2.onrender.com/items"
];

export default function Market() {
  const [query, setQuery] = useState('');
  const [itemsData, setItemsData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemPrices, setItemPrices] = useState({});
  const [loadingItemId, setLoadingItemId] = useState(null);

  // ✅ Cargar items.json
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        console.log('✅ items.json cargado:', data.length);
        setItemsData(data);
      } catch (err) {
        console.error('❌ Error cargando items.json:', err);
      }
    };
    fetchItems();
  }, []);

  // ✅ Buscar ítems por nombre
  useEffect(() => {
    if (query.length > 2) {
      const resultados = itemsData.filter(item =>
        item?.nombre?.toLowerCase().includes(query.toLowerCase())
      );
      console.log('🔍 Resultados filtrados:', resultados.length);
      setFilteredItems(resultados);
    } else {
      setFilteredItems([]);
    }
  }, [query, itemsData]);

  // ✅ Consultar precios desde los backends
  const fetchPrices = async (itemId) => {
    setLoadingItemId(itemId);
    let data = [];

    for (const url of backends) {
      try {
        console.log(`🌐 Consultando: ${url}?ids=${itemId}`);
        const res = await fetch(`${url}?ids=${itemId}`);
        if (res.ok) {
          const resData = await res.json();
          if (Array.isArray(resData) && resData.length > 0) {
            data = resData;
            console.log(`✅ Datos recibidos de ${url}:`, data);
            break;
          } else {
            console.warn(`⚠️ ${url} respondió sin datos válidos`);
          }
        } else {
          console.warn(`⚠️ ${url} respondió con error:`, res.status);
        }
      } catch (err) {
        console.error(`❌ Error al consultar ${url}:`, err);
      }
    }

    const preciosPorCiudad = {};

    if (Array.isArray(data)) {
      data.forEach(entry => {
        if (!entry.city) return;
        if (!preciosPorCiudad[entry.city]) {
          preciosPorCiudad[entry.city] = {
            venta: entry.sell_price_min || 0,
            compra: entry.buy_price_max || 0
          };
        }
      });
    }

    console.log(`📊 Precios para ${itemId}:`, preciosPorCiudad);
    setItemPrices(prev => ({ ...prev, [itemId]: preciosPorCiudad }));
    setLoadingItemId(null);
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
        <div key={item.id} style={{ marginBottom: 30, borderBottom: '1px solid #444', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={item.imagen}
              alt={item.nombre}
              width={50}
              height={50}
              style={{ marginRight: 10 }}
            />
            <div>
              <strong>{item.nombre}</strong><br />
              <button onClick={() => fetchPrices(item.id)}>Ver precios</button>
            </div>
          </div>

          {loadingItemId === item.id && <p>⏳ Cargando precios...</p>}

          {itemPrices[item.id] && (
            <div style={{ marginTop: 10 }}>
              {ciudades.map(ciudad => {
                const datos = itemPrices[item.id][ciudad];
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
