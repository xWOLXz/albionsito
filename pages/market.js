// /pages/market.js
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function MarketPage() {
  const [allItems, setAllItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [prices, setPrices] = useState(null);

  // Cargar todos los items paginados una sola vez al iniciar
  useEffect(() => {
    let cancel = false;
    const fetchAllItems = async () => {
      let page = 1;
      let items = [];
      while (!cancel) {
        const res = await fetch(`https://albionsito-backend.onrender.com/items?page=${page}`);
        const data = await res.json();
        if (!data.length) break;
        items = [...items, ...data];
        page++;
      }
      if (!cancel) {
        setAllItems(items);
        setLoading(false);
      }
    };
    fetchAllItems();
    return () => {
      cancel = true;
    };
  }, []);

  // Buscar items en memoria (todos los cargados)
  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = allItems.filter(item =>
      item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(query)
    );
    setFilteredItems(filtered);
  }, [search, allItems]);

  // Obtener precios del item seleccionado
  useEffect(() => {
    if (!selectedItem) return;
    const fetchPrices = async () => {
      const res = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${selectedItem.UniqueName}`);
      const data = await res.json();
      setPrices(data);
    };
    fetchPrices();
  }, [selectedItem]);

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">📦 Mercado de Albion</h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar ítem por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
      />

      {/* Cargando */}
      {loading && <p className="text-center">⏳ Cargando todos los ítems...</p>}

      {/* Resultados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {filteredItems.map(item => (
          <button
            key={item.UniqueName}
            className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded flex flex-col items-center"
            onClick={() => setSelectedItem(item)}
          >
            <Image
              src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
              alt={item.LocalizedNames?.['ES-ES'] || item.UniqueName}
              width={64}
              height={64}
            />
            <span className="text-xs text-center mt-1">
              {item.LocalizedNames?.['ES-ES'] || item.UniqueName}
            </span>
          </button>
        ))}
      </div>

      {/* Detalles del ítem seleccionado */}
      {selectedItem && prices && (
        <div className="mt-8 p-4 border rounded bg-zinc-800">
          <h2 className="text-lg font-semibold mb-2">
            Detalles de: {selectedItem.LocalizedNames?.['ES-ES'] || selectedItem.UniqueName}
          </h2>
          <p>📉 Precio más bajo: {prices.sell_price_min} (en {prices.sell_city})</p>
          <p>📈 Precio más alto de compra: {prices.buy_price_max} (en {prices.buy_city})</p>
          <p>💰 Margen de ganancia: {prices.profit}</p>
          <button
            className="mt-2 px-4 py-1 bg-red-600 text-white rounded"
            onClick={() => setSelectedItem(null)}
          >
            Cerrar detalles
          </button>
        </div>
      )}
    </div>
  );
              }
