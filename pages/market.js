import { useEffect, useState } from 'react';
import fetchItemPrices from '../utils/fetchItemPrices';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error('❌ Error al cargar items.json:', err));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredItems([]);
        return;
      }
      const results = items.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(results);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, items]);

  const handleClick = async (item) => {
    setSelectedItem(item);
    setLoading(true);
    const result = await fetchItemPrices(item.id);
    setPrices(result);
    setLoading(false);
  };

  return (
    <div className="p-4 flex flex-col md:flex-row gap-4">
      {/* Panel de búsqueda */}
      <div className="md:w-1/3">
        <h1 className="text-2xl font-bold mb-4">🔍 Buscar ítem</h1>
        <input
          type="text"
          placeholder="Ej: espada, hacha, capa, montura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md mb-4 text-black"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className="bg-gray-800 rounded-xl p-2 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-16 h-16 mb-2"
                onError={(e) => {
                  e.target.src = `https://render.albiononline.com/v1/item/${item.id}.png`;
                }}
              />
              <p className="text-sm text-center">{item.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de resultados */}
      <div className="md:w-2/3">
        {selectedItem && (
          <div className="bg-gray-900 p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-2">{selectedItem.nombre}</h2>
            <img
              src={selectedItem.imagen}
              alt={selectedItem.nombre}
              className="w-20 h-20 mb-4"
              onError={(e) => {
                e.target.src = `https://render.albiononline.com/v1/item/${selectedItem.id}.png`;
              }}
            />
            {loading ? (
              <p className="text-gray-300">Cargando precios...</p>
            ) : prices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {prices.map((entry) => (
                  <div key={entry.city} className="bg-gray-800 p-3 rounded-lg text-center">
                    <h3 className="font-bold text-lg text-white">{entry.city}</h3>
                    <p className="text-sm text-green-400">
                      Compra: {entry.buy_price_min?.toLocaleString() || '❌'}
                    </p>
                    <p className="text-sm text-yellow-400">
                      Venta: {entry.sell_price_min?.toLocaleString() || '❌'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-400">No hay precios disponibles para este ítem.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
