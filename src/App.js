import React, { useEffect, useState } from 'react';
import ItemTable from './components/ItemTable';
import { FaSyncAlt } from 'react-icons/fa';

const API_URL = 'https://albionsito-backend.onrender.com/items';

function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Error cargando items:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = items.filter(item =>
    item.item_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Market General - Albionsito</h1>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          className="border border-gray-400 p-2 rounded w-full"
          placeholder="Buscar item básico (T4_BAG, T6_CAPE...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={fetchData}
          className="p-2 rounded bg-gray-800 text-white hover:bg-gray-700"
          title="Actualizar"
        >
          <FaSyncAlt />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <img src="/albion-loader.gif" alt="Cargando..." className="w-20" />
        </div>
      ) : (
        <ItemTable items={filtered} />
      )}
    </div>
  );
}

export default App;
