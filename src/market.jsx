import React, { useEffect, useState } from 'react';

function Market() {
  const [search, setSearch] = useState('');
  const [itemsData, setItemsData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [backendData, setBackendData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar items.json una vez al iniciar
  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ items.json cargado:', data.length, 'ítems');
        setItemsData(data);
      })
      .catch((error) => console.error('❌ Error cargando items.json:', error));
  }, []);

  // Filtrar ítems al escribir en el buscador
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

  // Traer precios del backend solo de los ítems filtrados
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

  // Procesar datos para tabla
  const procesarDatos = () => {
    const resultado = filteredItems.map((item) => {
      const relacionados = backendData.filter((entry) => entry.item_id === item.id);

      let mejorCompra = null;
      let mejorVenta = null;

      relacionados.forEach((entry) => {
        if (
          entry.buy_price_max > 0 &&
          (!mejorCompra || entry.buy_price_max > mejorCompra.price)
        ) {
          mejorCompra = {
            price: entry.buy_price_max,
            city: entry.city,
          };
        }

        if (
          entry.sell_price_min > 0 &&
          (!mejorVenta || entry.sell_price_min < mejorVenta.price)
        ) {
          mejorVenta = {
            price: entry.sell_price_min,
            city: entry.city,
          };
        }
      });

      const ganancia =
        mejorCompra && mejorVenta
          ? mejorCompra.price - mejorVenta.price
          : null;

      if (ganancia !== null) {
        console.log(`📊 ${item.nombre} — Compra: ${mejorVenta?.price}, Venta: ${mejorCompra?.price}, Ganancia: ${ganancia}`);
      }

      return {
        id: item.id,
        name: item.nombre || item.id,
        icon: item.imagen || item.icon || item.id + '.png',
        compra: mejorVenta,
        venta: mejorCompra,
        ganancia,
      };
    });

    const filtrado = resultado.filter((item) => item.ganancia !== null);
    console.log('✅ Ítems finales a mostrar:', filtrado.length);
    return filtrado;
  };

  const itemsFinales = procesarDatos();

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

      {!loading && itemsFinales.length === 0 && search.length >= 3 && (
        <p>No se encontraron resultados.</p>
      )}

      {itemsFinales.length > 0 && (
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Ícono</th>
              <th>Nombre</th>
              <th>Compra (↓)</th>
              <th>Ciudad</th>
              <th>Venta (↑)</th>
              <th>Ciudad</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {itemsFinales.map((item) => (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.icon}
                    alt={item.name}
                    width="40"
                    height="40"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/no-img.png';
                    }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.compra?.price.toLocaleString()} 🪙</td>
                <td>{item.compra?.city}</td>
                <td>{item.venta?.price.toLocaleString()} 🪙</td>
                <td>{item.venta?.city}</td>
                <td>
                  {item.ganancia > 0 ? `+${item.ganancia.toLocaleString()} 🪙` : '0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Market;
