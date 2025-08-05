import React, { useEffect, useState } from 'react';

function Market() {
  const [search, setSearch] = useState('');
  const [itemsData, setItemsData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [backendData, setBackendData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar items.json
  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ items.json cargado:', data.length, 'ítems');
        setItemsData(data);
      })
      .catch((error) => console.error('❌ Error cargando items.json:', error));
  }, []);

  // Filtrar por nombre en español
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

  // Traer precios de la API por item_id
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

      {!loading && backendData.length === 0 && search.length >= 3 && (
        <p>No se encontraron resultados.</p>
      )}

      {backendData.length > 0 && (
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Ícono</th>
              <th>Nombre</th>
              <th>Precio de Compra (Max)</th>
              <th>Precio de Venta (Min)</th>
              <th>Ciudad</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const precios = backendData.filter((entry) => entry.item_id === item.id);
              return precios.map((entry, i) => (
                <tr key={`${item.id}-${entry.city}-${i}`}>
                  <td>
                    <img
                      src={item.imagen || '/no-img.png'}
                      alt={item.nombre}
                      width="40"
                      height="40"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/no-img.png';
                      }}
                    />
                  </td>
                  <td>{item.nombre}</td>
                  <td>{entry.buy_price_max.toLocaleString()} 🪙</td>
                  <td>{entry.sell_price_min.toLocaleString()} 🪙</td>
                  <td>{entry.city}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Market;
