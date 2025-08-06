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

  // ✅ Cargar items.json al iniciar
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

  // ✅ Buscar ítems por nombre (mínimo 3 letras)
  useEffect(() => {
    if (query.length > 2) {
      const resultados = itemsData.filter(item =>
        item.nombre?.toLowerCase().includes(query.toLowerCase())
      )
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
        const res = await fetch(`${url}?ids=${itemId}`);
        if (res.ok) {
          data = await res.json();
          console.log(`✅ Precios cargados de: ${url}`);
          break;
        }
      } catch (err) {
        console.warn('⚠️ Error al consultar', url);
      }
    }

    const preciosPorCiudad = {};
    data.forEach(entry => {
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
