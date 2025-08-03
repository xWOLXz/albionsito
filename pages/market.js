  );
}
import { useEffect, useState } from 'react';
import styles from '../styles/Market.module.css';

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carga inicial
  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        const itemsWithImages = data.map((item) => ({
          ...item,
          imagen: item.imagen || `https://render.albiononline.com/v1/item/${item.id}.png`,
        }));
        setItems(itemsWithImages);
        setFilteredItems(itemsWithImages);
      });
  }, []);

  // Filtro
  useEffect(() => {
    const filtered = items.filter((item) =>
      item.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [search, items]);

  const fetchMarketData = async (itemId) => {
    setLoading(true);
    setMarketData([]);
    try {
      const res = await fetch(
        `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}?locations=Caerleon,Bridgewatch,Martlock,Lymhurst,Thetford,FortSterling,Brecilien`
      );
      const data = await res.json();
      console.log("Datos recibidos de la API:", data);
      setMarketData(data);
    } catch (error) {
      console.error("Error al obtener datos del mercado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    fetchMarketData(item.id);
  };

  const formatCurrency = (num) => {
    if (!num || isNaN(num)) return 0;
    return Number(num).toLocaleString();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mercado de Albion Online</h1>

      <input
        type="text"
        className={styles.searchInput}
        placeholder="Buscar ítem..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={styles.grid}>
        {filteredItems.map((item) => (
          <div key={item.id} className={styles.card} onClick={() => handleSelectItem(item)}>
            <img
              src={item.imagen}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/no-img.png';
              }}
              alt={item.nombre}
            />
            <p>{item.nombre}</p>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className={styles.resultado}>
          <h2>📦 Precios para: {selectedItem.nombre}</h2>
          {loading ? (
            <p>Cargando datos...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ciudad</th>
                  <th>💰 Precio Venta Mín.</th>
                  <th>🪙 Precio Compra Máx.</th>
                  <th>📈 Margen</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((data, index) => {
                  const venta = data.sell_price_min || 0;
                  const compra = data.buy_price_max || 0;
                  const margen = venta - compra;
                  return (
                    <tr key={index}>
                      <td>{data.city}</td>
                      <td>{formatCurrency(venta)}</td>
                      <td>{formatCurrency(compra)}</td>
                      <td>{formatCurrency(margen)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
