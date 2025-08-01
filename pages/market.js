// pages/market.js
import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();

        // Adaptar según la estructura real del archivo
        let flatItems = [];

        if (Array.isArray(data)) {
          flatItems = data;
        } else if (data.shopcategories && Array.isArray(data.shopcategories)) {
          data.shopcategories.forEach((cat) => {
            if (cat.subcategories) {
              cat.subcategories.forEach((sub) => {
                if (sub.items) {
                  flatItems.push(...sub.items);
                }
              });
            }
          });
        } else {
          console.error("Estructura de items.json no reconocida.");
        }

        setItems(flatItems);
      } catch (error) {
        console.error('Error al cargar items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter((item) =>
    item.localizedNames?.['ES-ES']?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Albionsito Market</h1>
      <input
        type="text"
        placeholder="Buscar item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
      />
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <img src="/albion-loader.gif" alt="Cargando..." />
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Ítem</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.uniquename}>
                <td style={{ padding: '0.5rem' }}>{item.localizedNames?.['ES-ES'] || item.uniquename}</td>
                <td style={{ padding: '0.5rem' }}>{item.itemValue || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
