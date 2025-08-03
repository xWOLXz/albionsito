// albionsito-app/pages/market/index.js

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Market() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/api/items/all');
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error('❌ Error cargando ítems:', err);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (search.trim().length === 0) {
      setFilteredItems([]);
      setSelectedItem(null);
      return;
    }
    const lower = search.toLowerCase();
    const matches = items.filter(item =>
      item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(lower)
    );
    setFilteredItems(matches.slice(0, 10));
  }, [search, items]);

  const handleSelect = async (item) => {
    setSelectedItem(item);
    setFilteredItems([]);
    setSearch(item.LocalizedNames['ES-ES']);
    setLoading(true);
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/api/precios?itemId=${item.UniqueName}`);
      const data = await res.json();
      setPrices(data);
    } catch (err) {
      console.error('❌ Error cargando precios:', err);
      setPrices(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Market General | Albionsito</title>
      </Head>

      <main className="min-h-screen bg-black text-white px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🛒 Buscador de Ítems
        </h1>

        <input
          type="text"
          className="w-full p-3 rounded text-black"
          placeholder="Espada, Hacha, Arco, T4_FIRESTAFF, etc."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {filteredItems.length > 0 && (
          <ul className="bg-white text-black rounded mt-2 max-h-60 overflow-y-auto">
            {filteredItems.map(item => (
              <li
                key={item.UniqueName}
                className="px-4 py-2 border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(item)}
              >
                {item.LocalizedNames['ES-ES']} ({item.UniqueName})
              </li>
            ))}
          </ul>
        )}

        {selectedItem && (
          <div className="mt-8 p-4 border border-gray-700 rounded">
            <h2 className="text-xl font-semibold mb-4">
              {selectedItem.LocalizedNames['ES-ES']}
            </h2>
            <img
              src={`https://render.albiononline.com/v1/item/${selectedItem.UniqueName}.png`}
              alt={selectedItem.UniqueName}
              className="w-20 h-20 mb-4"
            />

            {loading ? (
              <p className="text-yellow-400">Cargando precios...</p>
            ) : prices ? (
              <div>
                <p>
                  🟢 <strong>Precio de venta más bajo:</strong> {prices.sell.price.toLocaleString()} en {prices.sell.city || 'Desconocido'}
                </p>
                <p>
                  🔴 <strong>Precio de compra más alto:</strong> {prices.buy.price.toLocaleString()} en {prices.buy.city || 'Desconocido'}
                </p>
                <p>
                  💰 <strong>Margen:</strong> {prices.margen.toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-red-400">No se encontraron precios.</p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
