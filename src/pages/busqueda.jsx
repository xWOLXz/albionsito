// src/pages/busqueda.jsx
import React, { useState } from 'react';
import './busqueda.css';

function Busqueda() {
  const [itemName, setItemName] = useState('');
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async () => {
    if (!itemName.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setItemData(null);

    try {
      const res = await fetch(`https://backend2-xwolxz.onrender.com/api/item?name=${encodeURIComponent(itemName)}`);
      const data = await res.json();

      if (!res.ok || !data || !data.name) {
        throw new Error('Item no encontrado');
      }

      setItemData(data);
    } catch (err) {
      setErrorMsg('Item no encontrado o error en la API.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="busqueda-container">
      <h1 className="busqueda-title">🔎 Buscar Ítem del Mercado</h1>

      <div className="busqueda-input-group">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ejemplo: Rune Broadsword"
          className="busqueda-input"
        />
        <button onClick={handleSearch} className="busqueda-button">Buscar</button>
      </div>

      {loading && <img src="/albion-loader.gif" alt="Cargando..." className="loader" />}

      {errorMsg && <p className="error">{errorMsg}</p>}

      {itemData && (
        <div className="item-card">
          <img src={itemData.image} alt={itemData.name} className="item-image" />
          <h2 className="item-name">{itemData.name}</h2>

          <div className="price-info">
            <p><strong>Venta más baja:</strong> {itemData.sell_price_min} 🪙 en {itemData.sell_city}</p>
            <p><strong>Compra más alta:</strong> {itemData.buy_price_max} 🪙 en {itemData.buy_city}</p>
            <p><strong>Ganancia estimada:</strong> {itemData.margin} 🪙</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Busqueda;
