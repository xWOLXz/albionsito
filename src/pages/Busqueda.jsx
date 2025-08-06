import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';

const Busqueda = () => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (nombre) => {
    setLoading(true);
    try {
      const response = await fetch(`https://albionsito-backend2.onrender.com/api/item?name=${nombre}`);
      const data = await response.json();
      setResultados(data);
    } catch (error) {
      console.error('Error al buscar el ítem:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <SearchBar onSearch={handleSearch} />
      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {resultados.map((item, index) => (
            <div key={index} className="border p-4 rounded bg-white shadow">
              <div className="flex items-center gap-3">
                <img src={`https://render.albiononline.com/v1/item/${item.item_id}.png`} alt={item.localized_name} className="w-10 h-10" />
                <div>
                  <h2 className="font-semibold">{item.localized_name}</h2>
                  <p className="text-sm text-gray-600">{item.city} — {item.quality}</p>
                </div>
              </div>
              <div className="mt-2">
                <p><strong>Tipo:</strong> {item.order_type === 'buy' ? 'Compra' : 'Venta'}</p>
                <p><strong>Precio:</strong> {item.price.toLocaleString()} plata</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Busqueda;
