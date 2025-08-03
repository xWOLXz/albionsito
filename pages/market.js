import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Market() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar todos los ítems desde el backend
  useEffect(() => {
    const fetchAllItems = async () => {
      let page = 1;
      let allResults = [];
      let keepGoing = true;

      while (keepGoing) {
        try {
          const res = await fetch(`https://albionsito-backend.onrender.com/items?page=${page}`);
          const data = await res.json();

          if (data.length === 0) {
            keepGoing = false;
          } else {
            allResults = allResults.concat(data);
            page++;
          }
        } catch (err) {
          console.error('Error al cargar ítems:', err);
          keepGoing = false;
        }
      }

      setAllItems(allResults);
      setFilteredItems(allResults);
      setLoading(false);
    };

    fetchAllItems();
  }, []);

  // Filtrar ítems en tiempo real por nombre
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredItems(allItems);
    } else {
      const results = allItems.filter((item) =>
        item.localized_name.toLowerCase().includes(term)
      );
      setFilteredItems(results);
    }
  };

  return (
    <>
      <Head>
        <title>Market General | Albionsito</title>
      </Head>

      <div className="min-h-screen bg-black text-white p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">🛒 Market General</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <img src="/albion-loader.gif" alt="Cargando..." className="w-24 h-24 mb-4" />
            <p className="text-lg">Cargando todos los ítems del mercado...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <input
                type="text"
                placeholder="🔍 Buscar ítem por nombre..."
                value={searchTerm}
                onChange={handleSearch}
                className="px-4 py-2 rounded-md w-full max-w-xl text-black"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.unique_name}
                  className="bg-gray-800 rounded-lg p-3 flex flex-col items-center text-center"
                >
                  <img
                    src={`https://render.albiononline.com/v1/item/${item.unique_name}.png`}
                    alt={item.localized_name}
                    className="w-14 h-14 mb-2"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <span className="text-sm">{item.localized_name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
          }
