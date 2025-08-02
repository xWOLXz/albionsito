import React, { useState, useEffect } from 'react';

const Market = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [precios, setPrecios] = useState(null);

  // 1. Carga básica de ítems solo para búsqueda
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/items?page=1');
        const data = await res.json();
        setItems(data.items);
        setFilteredItems(data.items);
      } catch (err) {
        console.error('Error al cargar ítems:', err);
      }
    };
    fetchItems();
  }, []);

  // 2. Filtrar mientras escribe
  useEffect(() => {
    const results = items.filter(item =>
      item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(results);
  }, [searchTerm, items]);

  // 3. Cargar precios al hacer clic en un ítem
  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setLoading(true);
    try {
      const res = await fetch(`/api/precios?id=${item.UniqueName}`);
      const data = await res.json();
      setPrecios(data);
    } catch (err) {
      console.error('Error al cargar precios del ítem:', err);
    }
    setLoading(false);
  };

  // 4. Obtener nombre español
  const getName = (item) => item.LocalizedNames?.['ES-ES'] || item.LocalizedNames?.['EN-US'] || 'Sin nombre';

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '20px' }}>Mercado General</h1>

      <input
        type="text"
        placeholder="Buscar ítem..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginBottom: '30px',
        }}
      />

      {!selectedItem ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.UniqueName}
              style={{
                background: '#222',
                padding: '10px',
                borderRadius: '10px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleItemClick(item)}
            >
              <img
                src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
                alt={getName(item)}
                style={{ width: '80px', height: '80px' }}
              />
              <div style={{ color: 'white', marginTop: '10px' }}>{getName(item)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'white' }}>
          <button
            onClick={() => {
              setSelectedItem(null);
              setPrecios(null);
            }}
            style={{
              marginBottom: '20px',
              background: '#444',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            ← Volver al listado
          </button>

          <h2 style={{ fontSize: '1.5rem' }}>{getName(selectedItem)}</h2>
          <img
            src={`https://render.albiononline.com/v1/item/${selectedItem.UniqueName}.png`}
            alt={getName(selectedItem)}
            style={{ width: '100px', height: '100px', marginBottom: '20px' }}
          />

          {loading ? (
            <p>Cargando precios...</p>
          ) : precios ? (
            <div style={{ fontSize: '18px' }}>
              <p>🟢 <b>Compra más alta:</b> {precios.buyPrice} ({precios.buyCity})</p>
              <p>🔴 <b>Venta más baja:</b> {precios.sellPrice} ({precios.sellCity})</p>
              <p>💰 <b>Margen:</b> {precios.margin}</p>
            </div>
          ) : (
            <p>No se encontraron precios.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Market;
