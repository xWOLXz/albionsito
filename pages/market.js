import React, { useEffect, useState } from 'react';

const Market = () => {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/items');
        const data = await res.json();

        const categorias = data?.items?.shopcategories || {};
        const arraysDeCategorias = Object.values(categorias);

        // Plano, extrayendo @id y @value correctamente
        const todosLosItems = arraysDeCategorias.flatMap(arr =>
          Array.isArray(arr) ? arr : [arr]
        ).map(item => ({
          id: item['@id'],
          value: item['@value']
        }));

        setItems(todosLosItems);
      } catch (error) {
        console.error('Error cargando los ítems:', error);
      }
    };

    fetchItems();
  }, []);

  const itemsFiltrados = items.filter(item =>
    item.id?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>Market General</h1>
      <input
        type="text"
        placeholder="Buscar ítem..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          padding: '0.5rem',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '1rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #555', textAlign: 'left', padding: '0.5rem' }}>Item</th>
            <th style={{ borderBottom: '1px solid #555', textAlign: 'left', padding: '0.5rem' }}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {itemsFiltrados.map((item, index) => (
            <tr key={index}>
              <td style={{ borderBottom: '1px solid #333', padding: '0.5rem' }}>{item.id}</td>
              <td style={{ borderBottom: '1px solid #333', padding: '0.5rem' }}>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Market;
