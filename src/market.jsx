import React, { useState, useEffect } from 'react';

const Market = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemNames, setItemNames] = useState({});

  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        const itemMap = {};
        data.forEach((item) => {
          itemMap[item.UniqueName] = item;
        });
        setItemNames(itemMap);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredItems([]);
      return;
    }

    fetch('https://albionsito-backend.onrender.com/items')
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};

        data.forEach((entry) => {
          if (!grouped[entry.item_id]) grouped[entry.item_id] = [];
          grouped[entry.item_id].push(entry);
        });

        const result = [];

        Object.entries(grouped).forEach(([item_id, entries]) => {
          const maxBuy = entries.reduce((max, e) => (e.buy_price_max > max.buy_price_max ? e : max), entries[0]);
          const minSell = entries.reduce((min, e) => (e.sell_price_min < min.sell_price_min ? e : min), entries[0]);

          const profit = minSell.sell_price_min - maxBuy.buy_price_max;
          const itemNameData = itemNames[item_id];

          if (itemNameData) {
            const name = itemNameData.LocalizedNames['ES-ES'] || item_id;
            if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
              result.push({
                item_id,
                name,
                buy_price: maxBuy.buy_price_max,
                buy_city: maxBuy.city,
                sell_price: minSell.sell_price_min,
                sell_city: minSell.city,
                profit,
                icon: itemNameData.Icon,
              });
            }
          }
        });

        result.sort((a, b) => b.profit - a.profit);
        setFilteredItems(result);
      });
  }, [searchTerm, itemNames]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛒 Market General</h1>
      <input
        type="text"
        placeholder="🔎 Buscar ítem..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: '0.5rem',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '1.5rem',
          border: '1px solid #ccc',
          borderRadius: '6px',
        }}
      />

      {filteredItems.length === 0 ? (
        <p>No se encontraron resultados.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Ícono</th>
              <th>Nombre</th>
              <th>Compra</th>
              <th>Ciudad</th>
              <th>Venta</th>
              <th>Ciudad</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.item_id}>
                <td>
                  {item.icon ? (
                    <img
                      src={`https://render.albiononline.com/v1/item/${item.icon}.png`}
                      alt={item.name}
                      width="40"
                    />
                  ) : (
                    '❌'
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.buy_price.toLocaleString()} 🟡</td>
                <td>{item.buy_city}</td>
                <td>{item.sell_price.toLocaleString()} 🟡</td>
                <td>{item.sell_city}</td>
                <td style={{ color: item.profit >= 0 ? 'green' : 'red' }}>
                  {item.profit >= 0 ? '+' : ''}
                  {item.profit.toLocaleString()} 🟡
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Market;
