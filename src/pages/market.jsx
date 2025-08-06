// pages/market.jsx
import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';

export default function Market() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        setItems(data.slice(0, 30)); // Puedes ordenar y mostrar solo los top 30 con lógica si ya la tienes
      } catch (error) {
        console.error('Error al cargar items.json:', error);
      } finally {
        setCargando(false);
      }
    }

    fetchItems();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">📊 Market General</h1>
      {cargando ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md p-2 text-center">
              <img src={item.url} alt={item.nombre} className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm font-semibold">{item.nombre}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
