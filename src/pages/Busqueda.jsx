import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

const Busqueda = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarItem = async (nombre) => {
    try {
      setLoading(true);
      console.log('🔍 Buscando:', nombre);
      const response = await fetch(`https://albionsito-backend2.onrender.com/api/item?name=${nombre}`);
      const data = await response.json();
      console.log('📦 Respuesta de búsqueda:', data);
      setResults(data || []);
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Buscar Ítem</h1>
      <SearchBar onSearch={buscarItem} />
      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {results.map((item) => (
            <ItemCard key={`${item.item_id}-${item.city}-${item.order_type}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Busqueda;
