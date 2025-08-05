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

  // Filtrar ítems por nombre en español
  useEffect(() => {
    if (search.trim().length < 3) {
      setFilteredItems([]);
      return;
    }

    const resultados = itemsData.filter((item) => {
      const nombreES = item.nombre?.toLowerCase() || '';
      return nombreES.includes(search.toLowerCase());
    });

    setFilteredItems(resultados);
  }, [search, itemsData]);

  // Obtener precios desde el backend
  useEffect(() => {
    if (filteredItems.length === 0) {
      setBackendData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const ids = filteredItems.map((item) => item.id).join(',');
        const res = await fetch(`https://albionsito-backend.onrender.com/items?ids=${ids}`);
        const data = await res.json();
        setBackendData(data);
      } catch (error) {
        console.error('❌ Error al obtener precios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filteredItems]);

  // Combinar datos filtrados con sus precios
  const itemsConPrecios = filteredItems.flatMap((item) => {
    return backendData
      .filter((entry) => entry.item_id === item.id)
      .map((entry) => ({
        id: item.id,
        nombre: item.nombre,
        imagen: item.imagen || '/no-img.png',
        ciudad: entry.city,
        buy_price: entry.buy_price_max,
        sell_price: entry.sell_price_min,
      }));
  });

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

      {loading && <p>🔄 Cargando precios...</p>}

      {!loading && itemsConPrecios.length === 0 && search.length >= 3 && (
        <p>No se encontraron resultados.</p>
      )}

      {itemsConPrecios.length > 0 && (
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Ícono</th>
              <th>Nombre</th>
              <th>Compra (max)</th>
              <th>Venta (min)</th>
              <th>Ciudad</th>
            </tr>
          </thead>
          <tbody>
            {itemsConPrecios.map((item, index) => (
              <tr key={`${item.id}-${item.ciudad}-${index}`}>
                <td>
                  <img
                    src={item.imagen}
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
                <td>{item.buy_price.toLocaleString()} 🪙</td>
                <td>{item.sell_price.toLocaleString()} 🪙</td>
                <td>{item.ciudad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Market;
