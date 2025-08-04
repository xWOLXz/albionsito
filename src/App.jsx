import React, { useEffect, useState } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 🔁 Obtener ítems del backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/items');
        const data = await res.json();
        console.log('✔ items base cargados:', data.length);
        setItems(data);
      } catch (err) {
        console.error('❌ Error al cargar ítems:', err);
      }
    };

    fetchItems();
  }, []);

  // Filtrar ítems únicos por item_id
  const uniqueItems = Array.from(
    new Map(items.map(item => [item.item_id, item])).values()
  );

  const filteredItems = uniqueItems.filter(item =>
    item.item_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const prices = items.filter(item => item.item_id === selectedItem);

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Mercado</h1>
      <input
        type="text"
        placeholder="Buscar ítem..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredItems.map((item) => (
          <li
            key={item.item_id}
            onClick={() => setSelectedItem(item.item_id)}
            style={{ cursor: 'pointer', color: item.item_id === selectedItem ? 'blue' : 'black' }}
          >
            {item.item_id}
          </li>
        ))}
      </ul>

      {selectedItem && (
        <>
          <h2>Resultados para: {selectedItem}</h2>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Ciudad</th>
                <th>Calidad</th>
                <th>Venta ↓</th>
                <th>Compra ↑</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p, i) => (
                <tr key={i}>
                  <td>{p.city}</td>
                  <td>{p.quality}</td>
                  <td>{p.sell_price_min}</td>
                  <td>{p.buy_price_max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
