import { useEffect, useState } from 'react';
import styles from '../styles/Market.module.css';

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/items?page=${page}`);
      const data = await res.json();
      const enriched = await Promise.all(
        data.items.map(async (item) => {
          const priceRes = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${item.UniqueName}`);
          const price = await priceRes.json();
          return { ...item, price };
        })
      );
      setItems(enriched);
    } catch (error) {
      console.error('❌ Error cargando ítems:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [page]);

  const filteredItems = items.filter(item =>
    item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1>🛒 Market General</h1>

      <input
        className={styles.search}
        type="text"
        placeholder="🔍 Buscar ítem..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className={styles.loading}>Cargando...</p>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <div key={item.UniqueName} className={styles.card}>
              <img
                src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                alt={item.LocalizedNames['ES-ES']}
              />
              <h3>{item.LocalizedNames['ES-ES']}</h3>
              <p>🟢 Compra: {item.price.buy.price.toLocaleString()} ({item.price.buy.city})</p>
              <p>🔴 Venta: {item.price.sell.price.toLocaleString()} ({item.price.sell.city})</p>
              <p>💰 Margen: {item.price.margen.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className={styles.pagination}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          ← Anterior
        </button>
        <span>Página {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
      </div>
    </div>
  );
}
