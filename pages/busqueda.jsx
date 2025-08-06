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
    if (!search) {
      setFilteredItems([]);
      return;
    }

    const texto = search.toLowerCase();
    const resultados = items.filter(item =>
      item.nombre && item.nombre.toLowerCase().includes(texto)
    );

    setFilteredItems(resultados);
  }, [search, items]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-center">🔍 Buscar Ítems de Albion</h1>
      <SearchBar value={search} onChange={setSearch} placeholder="Escribe el nombre del ítem..." />

      {loading ? (
        <div className="flex justify-center mt-10">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))
          ) : (
            search && (
              <p className="text-center col-span-full text-gray-500">
                No se encontraron ítems con ese nombre.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
