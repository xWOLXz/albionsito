import { useState, useEffect } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('https://albionsito-backend.onrender.com/items')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          console.error('Formato de datos inesperado:', data);
        }
      })
      .catch((error) => console.error('Error cargando los items:', error));
  }, []);

  const formatName = (eid) => {
    return eid
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filteredItems = items.filter((item) =>
    item.eid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Market General</h1>
      <input
        type="text"
        placeholder="Buscar item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '0.5rem',
          marginBottom: '1rem',
          width: '100%',
          maxWidth: '400px',
          borderRadius: '6px',
        }}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Imagen</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.eid}>
              <td style={{ padding: '0.5rem' }}>
                <img
                  src={`https://render.albiononline.com/v1/item/${item.eid}.png`}
                  alt={item.eid}
                  style={{ width: '40px', height: '40px' }}
                  onError={(e) => (e.target.style.display = 'none')}
                />
              </td>
              <td style={{ padding: '0.5rem' }}>{formatName(item.eid)}</td>
              <td style={{ padding: '0.5rem' }}>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
