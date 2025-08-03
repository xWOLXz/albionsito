// pages/market.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Market() {
  const [allItems, setAllItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [precios, setPrecios] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar todos los nombres de ítems al iniciar
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('https://albionsito-backend.onrender.com/items?page=1');
        const totalPages = res.data.totalPages;

        let all = [];
        for (let i = 1; i <= totalPages; i++) {
          const resPage = await axios.get(`https://albionsito-backend.onrender.com/items?page=${i}`);
          all = [...all, ...resPage.data.items];
        }

        setAllItems(all);
      } catch (err) {
        console.error('Error cargando items:', err.message);
      }
    };

    fetchItems();
  }, []);

  // Buscar ítems por nombre
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredItems([]);
      return;
    }

    const results = allItems.filter(item =>
      item.LocalizedNames['ES-ES'].toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredItems(results);
  }, [searchTerm, allItems]);

  // Cargar precios cuando selecciona un ítem
  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setPrecios(null);
    setLoading(true);
    try {
      const res = await axios.get(`https://albionsito-backend.onrender.com/precios?itemId=${item.UniqueName}`);
      setPrecios(res.data);
    } catch (err) {
      console.error('Error cargando precios:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ textAlign: 'center' }}>🔍 Market General</h1>

      <input
        type="text"
        placeholder="Buscar ítem..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}
      />

      {filteredItems.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredItems.map(item => (
            <li
              key={item.UniqueName}
              onClick={() => handleItemClick(item)}
              style={{ cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid #ddd' }}
            >
              <img
                src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                alt={item.LocalizedNames['ES-ES']}
                width={32}
                height={32}
                style={{ verticalAlign: 'middle', marginRight: '1rem' }}
              />
              {item.LocalizedNames['ES-ES']}
            </li>
          ))}
        </ul>
      )}

      {selectedItem && (
        <div style={{ marginTop: '2rem' }}>
          <h2>🛒 {selectedItem.LocalizedNames['ES-ES']}</h2>
          <img
            src={`https://render.albiononline.com/v1/item/${selectedItem.UniqueName}.png`}
            alt={selectedItem.LocalizedNames['ES-ES']}
            width={64}
            height={64}
          />
          {loading ? (
            <p>Cargando precios...</p>
          ) : precios ? (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Precio de venta más bajo:</strong> {precios.sell.price.toLocaleString()} en {precios.sell.city}</p>
              <p><strong>Precio de compra más alto:</strong> {precios.buy.price.toLocaleString()} en {precios.buy.city}</p>
              <p><strong>Margen de ganancia:</strong> {precios.margen.toLocaleString()}</p>
            </div>
          ) : (
            <p>No hay precios disponibles.</p>
          )}
        </div>
      )}
    </div>
  );
}
