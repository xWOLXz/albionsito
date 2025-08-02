import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function MarketPage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://albionsito-backend.onrender.com/items');
      const data = await response.json();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error cargando ítems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = items.filter(item =>
      item.nombre.toLowerCase().includes(term)
    );
    setFilteredItems(filtered);
  };

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar ítem..."
          className="p-2 rounded-md border w-full max-w-md text-black"
        />
        <button
          onClick={fetchItems}
          className="ml-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md"
          title="Actualizar"
        >
          🔄
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Image src="/albion-loader.gif" alt="Cargando..." width={100} height={100} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-xl p-2 shadow hover:scale-105 transition-all">
              <Image
                src={item.imagen}
                alt={item.nombre}
                width={80}
                height={80}
                className="mx-auto"
              />
              <p className="mt-2 text-center text-sm">{item.nombre}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
            }
