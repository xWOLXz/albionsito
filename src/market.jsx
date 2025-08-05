import React, { useEffect, useState } from 'react';

const CIUDADES = [
  { name: 'Caerleon', color: 'black' },
  { name: 'Fort Sterling', color: 'white' },
  { name: 'Lymhurst', color: 'green' },
  { name: 'Bridgewatch', color: 'orange' },
  { name: 'Martlock', color: 'blue' },
  { name: 'Thetford', color: 'purple' },
  { name: 'Brecilien', color: 'gray' },
];

function Market() {
  const [search, setSearch] = useState('');
  const [itemsData, setItemsData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [backendData, setBackendData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ items.json cargado:', data.length, 'ítems');
        setItemsData(data);
      })
      .catch((error) => console.error('❌ Error cargando items.json:', error));
  }, []);

  useEffect(() => {
    console.log('🔍 Búsqueda:', search);

    if (search.trim().length < 3) {
      console.log('⛔ Búsqueda muy corta (<3 caracteres)');
      setFilteredItems([]);
      return;
    }

    const resultados = itemsData.filter((item) => {
      const nombreES = item.nombre?.toLowerCase() || '';
      const coincide = nombreES.includes(search.toLowerCase());

      if (coincide) {
        console.log('✅ Coincide:', nombreES);
      }

      return coincide;
    });

    console.log(`📦 Ítems filtrados: ${resultados.length}`);
    setFilteredItems(resultados);
  }, [search, itemsData]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      setBackendData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const ids = filteredItems.map((item) => item.id).join(',');
        console.log('🌐 Solicitando precios para IDs:', ids);
        const res = await fetch(`https://albionsito-backend.onrender.com/items?ids=${ids}`);
        const data = await res.json();
        console.log('✅ Precios recibidos:', data.length);
        setBackendData(data);
      } catch (error) {
        console.error('❌ Error al obtener precios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filteredItems]);

  function procesarPreciosPorCiudad(itemId) {
  const porCiudad = {};

  CIUDADES.forEach(({ name }) => {
    porCiudad[name] = {
      ventas: [],
      compras: [],
    };
  });

  // ⚠️ Usamos startsWith para incluir encantados como @1, @2, etc.
  const datosItem = backendData.filter((entry) =>
    entry.item_id.startsWith(itemId)
  );

  console.log(`📦 Procesando: ${itemId} - Coincidencias: ${datosItem.length}`);

  datosItem.forEach((entry) => {
    console.log(
      '🧾', entry.item_id,
      'en', entry.city,
      '-> venta:', entry.sell_price_min,
      'compra:', entry.buy_price_max
    );

    if (entry.sell_price_min > 0) {
      porCiudad[entry.city]?.ventas.push(entry.sell_price_min);
    }

    if (entry.buy_price_max > 0) {
      porCiudad[entry.city]?.compras.push(entry.buy_price_max);
    }
  });

  // Ordenar los precios dentro de cada ciudad
  for (const ciudad in porCiudad) {
    porCiudad[ciudad].ventas.sort((a, b) => a - b); // menor a mayor
    porCiudad[ciudad].compras.sort((a, b) => b - a); // mayor a menor
  }

  return porCiudad;
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>🛒 Market General</h1>

      <input
        type="text"
        placeholder="🔍 Buscar ítem..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '16px',
          margin: '10px 0',
          width: '100%',
          maxWidth: '400px',
        }}
      />

      {loading && <p>Cargando precios...</p>}

      {!loading && filteredItems.length === 0 && search.length >= 3 && (
        <p>No se encontraron resultados.</p>
      )}

      {!loading && filteredItems.length > 0 && (
        <div>
          {filteredItems.map((item) => {
            const precios = procesarPreciosPorCiudad(item.id);
            return (
              <div key={item.id} style={{ marginBottom: '2rem' }}>
                <h3>
                  <img
                    src={item.imagen || item.icon || '/no-img.png'}
                    alt={item.nombre}
                    width="32"
                    height="32"
                    style={{ verticalAlign: 'middle', marginRight: '8px' }}
                  />
                  {item.nombre}
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      {CIUDADES.map((c) => (
                        <th key={c.name} style={{ color: c.color }}>{c.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {CIUDADES.map((c) => (
                        <td key={c.name} style={{ verticalAlign: 'top', padding: '8px', border: '1px solid #ccc' }}>
                          <strong>Venta (↓):</strong><br />
                          {precios[c.name].ventas.length > 0
                            ? precios[c.name].ventas.map((p, i) => <div key={`v-${i}`}>{p.toLocaleString()} 🪙</div>)
                            : <span style={{ opacity: 0.5 }}>—</span>}
                          <hr />
                          <strong>Compra (↑):</strong><br />
                          {precios[c.name].compras.length > 0
                            ? precios[c.name].compras.map((p, i) => <div key={`c-${i}`}>{p.toLocaleString()} 🪙</div>)
                            : <span style={{ opacity: 0.5 }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Market;
