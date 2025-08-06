import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import ItemCard from '../components/ItemCard';

const Market = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://albionsito-backend.onrender.com/items');
      const data = await response.json();
      console.log('🔍 Respuesta del backend Market:', data);
      setItems(data || []);
    } catch (error) {
      console.error('❌ Error al obtener los datos del market:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Market General</h1>
      <button
        onClick={fetchItems}
        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        🔄 Recargar
      </button>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.item_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Market;
