// /pages/market.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Market() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await axios.get('https://albionsito-backend.onrender.com/items?page=1');
        setItems(res.data.items || []);
        setBackendError(false);
      } catch (err) {
        console.error('❌ Error cargando ítems:', err.message);
        setBackendError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>📦 Market General</h1>

      {loading && <p>⏳ Cargando datos del mercado...</p>}

      {backendError && (
        <p style={{ color: 'red' }}>
          ❌ No se pudo conectar al backend. Intenta más tarde.
        </p>
      )}

      {!loading && !backendError && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {items.map((item) => (
            <div
              key={item.UniqueName}
              style={{ background: '#222', padding: '10px', borderRadius: '10px', textAlign: 'center' }}
            >
              <img
                src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                alt={item.LocalizedNames['ES-ES']}
                width={64}
                height={64}
              />
              <p>{item.LocalizedNames['ES-ES']}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
