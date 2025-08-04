import { useEffect, useState } from 'react';
import styles from '../styles/Market.module.css';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [precios, setPrecios] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Cargar items desde /public/items.json
  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        console.log('✅ Items cargados:', data.length);
      })
      .catch((error) => {
        console.error('❌ Error cargando items.json:', error);
      });
  }, []);

  // 🔎 Filtro en vivo con debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredItems([]);
        return;
      }

      const resultados = items.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredItems(resultados);
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, items]);

  // 📦 Al seleccionar item, traer precios desde API oficial Albion 2D
  const handleClick = (item) => {
    setSelectedItem(item);
    setLoading(true);
    setPrecios(null);

    fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${item.id}.json`)
      .then((res) => res.json())
      .then((data) => {
        const porCiudad = {};
        data.forEach((entry) => {
          const ciudad = entry.city;
          if (!porCiudad[ciudad]) porCiudad[ciudad] = {};
          porCiudad[ciudad] = {
            sell: entry.sell_price_min,
            buy: entry.buy_price_max,
          };
        });
        setPrecios(porCiudad);
        console.log('📊 Precios por ciudad:', porCiudad);
      })
      .catch((err) => {
        console.error('❌ Error al obtener precios:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      {/* 🔍 Buscador */}
      <div className={styles.searchPanel}>
        <h1>📦 Buscador de Ítems</h1>
        <input
          type="text"
          placeholder="Ej: espada, hacha, montura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={styles.itemCard}
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                onError={(e) => (e.target.src = '/no-img.png')}
              />
              <p>{item.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 📈 Resultados */}
      <div className={styles.resultPanel}>
        {selectedItem && (
          <div className={styles.resultBox}>
            <h2>💰 Resultados para: {selectedItem.nombre}</h2>
            {loading && <p>⏳ Cargando precios...</p>}
            {!loading && precios && (
              <table className={styles.priceTable}>
                <thead>
                  <tr>
                    <th>Ciudad</th>
                    <th>🟢 Compra</th>
                    <th>🔴 Venta</th>
                    <th>📈 Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    'Bridgewatch',
                    'Caerleon',
                    'Fort Sterling',
                    'Lymhurst',
                    'Martlock',
                    'Thetford',
                    'Brecilien',
                  ].map((ciudad) => {
                    const datos = precios[ciudad] || {};
                    const buy = datos.buy || 0;
                    const sell = datos.sell || 0;
                    const ganancia = sell && buy ? sell - buy : 0;
                    return (
                      <tr key={ciudad}>
                        <td>{ciudad}</td>
                        <td>{buy > 0 ? `${buy.toLocaleString()} 🪙` : '❌'}</td>
                        <td>{sell > 0 ? `${sell.toLocaleString()} 🪙` : '❌'}</td>
                        <td>{ganancia > 0 ? `${ganancia.toLocaleString()} 🟢` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
