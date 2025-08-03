// pages/market.js
import { useState, useEffect } from 'react';

export default function Market() {
  const [allItems, setAllItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar ítems desde el backend (una sola vez)
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/api/items/all');
        const data = await res.json();
        setAllItems(data);
      } catch (err) {
        console.error('❌ Error cargando ítems:', err);
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  // Filtro con debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      const resultado = allItems.filter(i =>
        i.nombre.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(resultado.slice(0, 100)); // Limita a 100 resultados
    }, 300); // espera 300ms antes de filtrar
    return () => clearTimeout(delay);
  }, [search, allItems]);

  return (
    <div style={{ padding: '1rem', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Market General</h1>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar ítem..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '100%',
            maxWidth: '400px'
          }}
        />
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Cargando ítems...</p>}

      {!loading && filtered.length === 0 && search.length > 0 && (
        <p style={{ textAlign: 'center' }}>No se encontraron ítems.</p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        padding: '1rem'
      }}>
        {filtered.map(item => (
          <a
            key={item.item_id}
            href={`/market/${item.item_id}`}
            style={{
              background: '#1a1a1a',
              padding: '0.5rem',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              textAlign: 'center',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <img
              src={`https://render.albiononline.com/v1/item/${item.item_id}.png`}
              alt={item.nombre}
              style={{ width: '64px', height: '64px', marginBottom: '0.5rem' }}
              onError={(e) => e.target.style.display = 'none'}
            />
            <div style={{ fontSize: '0.95rem' }}>{item.nombre}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
