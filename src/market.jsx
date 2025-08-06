import { useEffect, useState } from 'react';

const ciudades = ["Caerleon", "Bridgewatch", "Lymhurst", "Martlock", "Thetford", "Fort Sterling", "Brecilien"];

const backends = [
  "https://albionsito-backend.onrender.com/items",
  "https://albionsito-backend2.onrender.com/items"
];

const checkPricesAPI = "https://west.albion-online-data.com/api/v2/stats/prices";

export default function Market() {
  const [query, setQuery] = useState('');
  const [itemsData, setItemsData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemPrices, setItemPrices] = useState({});
  const [loadingItemId, setLoadingItemId] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        setItemsData(data);
        console.log('✅ items.json cargado:', data.length);
      } catch (err) {
        console.error('❌ Error cargando items.json', err);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const resultados = itemsData.filter(item =>
        item.nombre?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(resultados);
    } else {
      setFilteredItems([]);
    }
  }, [query, itemsData]);

  const fetchPrices = async (itemId) => {
    setLoadingItemId(itemId);
    let precios = [];

    // Probar los backends personalizados
    for (const url of backends) {
      try {
        const res = await fetch(`${url}?ids=${itemId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            precios = data;
            console.log(`✅ Datos de ${url}`);
            break;
          }
        }
      } catch (err) {
        console.warn(`⚠️ Error en backend ${url}`);
      }
    }

    // Si no hubo datos válidos, usar CheckPrices
    if (precios.length === 0) {
      try {
        const ciudadParam = ciudades.join(',');
        const res = await fetch(`${checkPricesAPI}/${itemId}.json?locations=${ciudadParam}`);
        if (res.ok) {
          precios = await res.json();
          console.log("✅ Datos desde CheckPrices");
        }
      } catch (err) {
        console.warn("⚠️ Error usando CheckPrices");
      }
    }

    // Agrupar por ciudad
    const preciosPorCiudad = {};
    precios.forEach(entry => {
      if (!entry.city) return;
      preciosPorCiudad[entry.city] = {
        venta: entry.sell_price_min || 0,
        compra: entry.buy_price_max || 0
      };
    });

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
              <button onClick={() => fetchPrices(item.id)}>
                {loadingItemId === item.id ? '⏳ Cargando...' : 'Ver precios'}
              </button>
            </div>
          </div>

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
