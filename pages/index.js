// pages/index.js

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/items.json');
      const data = await res.json();

      // Extraer todos los items dentro de items.items.shopcategories[*].shopsubcategory[*].shopsubcategory2[*]
      const allItems = [];

      data.items.shopcategories.forEach(category => {
        category.shopsubcategory?.forEach(sub => {
          sub.shopsubcategory2?.forEach(sub2 => {
            allItems.push({
              id: sub2['@id'],
              name: sub2['@id'].replace(/_/g, ' '),
              value: sub2['@value']
            });
          });
        });
      });

      setItems(allItems);
      setFilteredItems(allItems);
    } catch (error) {
      console.error('Error al cargar items:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredItems(
      items.filter(item => item.name.toLowerCase().includes(value))
    );
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <h1>Albionsito Market</h1>
      <input
        type="text"
        placeholder="Buscar ítem..."
        value={search}
        onChange={handleSearch}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />

      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <Image
            src="/albion-loader.gif"
            alt="Cargando..."
            width={80}
            height={80}
          />
          <p>Cargando ítems...</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ítem</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
