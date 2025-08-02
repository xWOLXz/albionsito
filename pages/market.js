// /pages/market.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://albionsito-backend.onrender.com';

export default function Market() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar todos los ítems al inicio
  useEffect(() => {
    const loadAllItems = async () => {
      try {
        let page = 1;
        let allItems = [];
        let keepFetching = true;

        while (keepFetching) {
          const res = await axios.get(`${API_BASE}/items?page=${page}`);
          allItems = [...allItems, ...res.data.items];
          page++;
          if (res.data.items.length === 0) keepFetching = false;
        }

        setItems(allItems);
        setFiltered(allItems);
      } catch (err) {
        console.error('Error cargando ítems:', err.message);
      }
    };

    loadAllItems();
  }, []);

  // Buscar
  useEffect(() => {
    const term = search.toLowerCase();
    const resultados = items.filter(item =>
      item.LocalizedNames['ES-ES'].toLowerCase().includes(term)
    );
    setFiltered(resultados);
  }, [search, items]);

  // Consultar precios de un ítem
  const fetchPrices = async (itemId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/precios?itemId=${itemId}`);
      setSelected({ ...res.data });
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar precios:', err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🛒 Market General - Albionsito</h1>

      <input
        type="text"
        placeholder="Buscar ítem..."
        className="p-2 rounded w-full text-black mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && (
        <div className="text-center text-yellow-400 font-semibold mb-4 animate-pulse">
          ⏳ Consultando precios del ítem seleccionado...
        </div>
      )}

      {selected && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-2">📦 {selected.itemId}</h2>
          <p>💰 Mejor venta: {selected.sell.price.toLocaleString()} en <strong>{selected.sell.city}</strong></p>
          <p>🛒 Mejor compra: {selected.buy.price.toLocaleString()} en <strong>{selected.buy.city}</strong></p>
          <p className="text-green-400 font-bold">📈 Margen de ganancia: {selected.margen.toLocaleString()}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {filtered.map(item => (
          <button
            key={item.UniqueName}
            className="bg-gray-800 rounded p-2 hover:bg-gray-700 transition"
            onClick={() => fetchPrices(item.UniqueName)}
          >
            <img
              src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
              alt={item.LocalizedNames['ES-ES']}
              className="w-16 h-16 mx-auto"
            />
            <p className="text-sm mt-2 text-center">{item.LocalizedNames['ES-ES']}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
