import React, { useEffect, useState } from 'react';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

const Market = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://albionsito-backend.onrender.com/items');
      const data = await response.json();

      // Ordenar por mayor ganancia
      const sorted = data.sort((a, b) => b.profit - a.profit).slice(0, 30);
      setItems(sorted);
    } catch (error) {
      console.error('Error al obtener datos del mercado:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Top Ganancias del Mercado</h1>
        <button onClick={fetchMarketData} title="Actualizar">
          <img src="/albion-loader.gif" alt="Actualizar" className="w-6 h-6" />
        </button>
      </div>
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
