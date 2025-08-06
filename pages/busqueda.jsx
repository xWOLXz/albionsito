// pages/busqueda.jsx
import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

export default function Busqueda() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarItems = async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        setItems(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar items.json:', error);
        setLoading(false);
      }
    };

    cargarItems();
  }, []);

  useEffect(() => {
    const buscar = () => {
      const texto = search.toLowerCase();
      const filtrados = items.filter(item =>
        item.nombre && item.nombre.toLowerCase().includes(texto)
      );
      setFilteredItems(filtrados.slice(0, 50)); // Limita a 50 resultados
    };

    buscar();
  }, [search, items]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-center">🔍 Buscar Ítems de Albion</h1>
      <SearchBar value={search} onChange={setSearch} placeholder="Escribe el nombre del ítem en español..." />

      {loading ? (
        <div className="flex justify-center mt-10">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
