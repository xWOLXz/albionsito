// pages/market.js
import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://albionsito-backend.onrender.com/items');
      const data = await res.json();

      // Si data es un array directo (como el JSON actual), lo asignamos directo
      const itemArray = Array.isArray(data) ? data : [];

      setItems(itemArray);
    } catch (error) {
      console.error('Error cargando items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) =>
    item.UniqueName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', background: '#111', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Market General</h1>
      <input
        type="text"
        placeholder="Buscar item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '2rem',
        }}
      />
      {loading ? (
        <p>Cargando items...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Item</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: '0.5rem' }}>{item.UniqueName}</td>
                <td style={{ padding: '0.5rem' }}>{item.LocalizedNames?.ES || 'Sin nombre'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
          }
