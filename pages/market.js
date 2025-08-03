// /pages/market.js

import { useState, useEffect } from 'react';
import itemsData from '../data/items.json';

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemPrices, setItemPrices] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = itemsData.filter((item) =>
      item.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredItems(filtered.slice(0, 20)); // Máximo 20 resultados
  };

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setLoading(true);
    setItemPrices(null);
    console.log('Consultando precios para:', item.id);

    try {
      const response = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${item.id}.json`);
      const data = await response.json();
      console.log('Datos recibidos de la API:', data);
      setItemPrices(data);
    } catch (error) {
      console.error('Error al obtener precios:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLowestSell = () => {
    if (!itemPrices) return null;
    return itemPrices.reduce((acc, curr) => {
      return curr.sell_price_min > 0 && (acc === null || curr.sell_price_min < acc.sell_price_min)
        ? curr
        : acc;
    }, null);
  };

  const getHighestBuy = () => {
    if (!itemPrices) return null;
    return itemPrices.reduce((acc, curr) => {
      return curr.buy_price_max > 0 && (acc === null || curr.buy_price_max > acc.buy_price_max)
        ? curr
        : acc;
    }, null);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>🛒 Mercado General</h1>

      <input
        type="text"
        placeholder="Buscar ítem por nombre..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ padding: '10px', width: '100%', marginBottom: '20px', fontSize: '16px' }}
      />

      {filteredItems.map((item) => (
        <div
          key={item.id}
          onClick={() => handleItemClick(item)}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            borderBottom: '1px solid #ddd',
            padding: '8px 0',
          }}
        >
          <img src={item.imageUrl} alt={item.name} width={32} height={32} style={{ marginRight: 10 }} />
          <span>{item.name}</span>
        </div>
      ))}

      {loading && (
        <div style={{ marginTop: '20px' }}>
          <img src="/albion-loader.gif" alt="Cargando..." width={60} />
          <p>Cargando datos del ítem...</p>
        </div>
      )}

      {!loading && selectedItem && itemPrices && (
        <div style={{ marginTop: '20px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '10px' }}>
          <h2>{selectedItem.name}</h2>
          <img src={selectedItem.imageUrl} alt={selectedItem.name} width={64} />
          <hr />
          <p><strong>🟢 Precio más bajo de venta:</strong></p>
          <p>
            {getLowestSell()
              ? `${getLowestSell().sell_price_min.toLocaleString()} de plata en ${getLowestSell().city}`
              : 'No disponible'}
          </p>
          <p><strong>🔴 Precio más alto de compra:</strong></p>
          <p>
            {getHighestBuy()
              ? `${getHighestBuy().buy_price_max.toLocaleString()} de plata en ${getHighestBuy().city}`
              : 'No disponible'}
          </p>
        </div>
      )}
    </div>
  );
}
