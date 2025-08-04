import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // ✅ Carga inicial de items desde public/items.json
  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        console.log('✅ items.json cargado:', data.length, 'ítems');
      })
      .catch((err) => console.error('❌ Error cargando items.json:', err));
  }, []);

  // ✅ Filtro de búsqueda con debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredItems([]);
        return;
      }

      const resultados = items.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredItems(resultados);
      console.log('🔎 Búsqueda:', searchTerm, '| Resultados:', resultados.length);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, items]);

  // ✅ Cargar datos del mercado desde tu backend en Render
  const fetchMarketData = async (itemId) => {
    try {
      setLoadingPrices(true);
      setMarketData(null);

      const res = await fetch(
        `https://albionsito-backend.onrender.com/precios/${itemId}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        console.log('🟢 Precios encontrados:', data);
        setMarketData(data);
      } else {
        console.warn('⚠️ Sin datos de precios para', itemId);
      }
    } catch (err) {
      console.error('❌ Error obteniendo precios:', err);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleItemClick = (item) => {
    console.log('🟢 Ítem seleccionado:', item);
    setSelectedItem(item);
    fetchMarketData(item.id);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Panel Izquierdo - Búsqueda */}
      <div className="w-full md:w-1/3 p-4 overflow-y-auto border-r border-gray-700 bg-gray-900">
        <h1 className="text-2xl font-bold mb-4">📦 Market</h1>
        <input
          type="text"
          placeholder="Buscar ítem (ej: capa, espada...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 rounded-md text-black"
        />

        {filteredItems.length === 0 && searchTerm && (
          <p className="text-gray-400">No se encontraron ítems.</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-gray-800 hover:bg-gray-700 transition cursor-pointer rounded-lg p-2 flex flex-col items-center"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // 🧠 Si falla imagen, busca en tu API de respaldo
                  e.target.src = `https://albionsito-backend.onrender.com/icono/${item.id}`;
                }}
              />
              <p className="text-xs text-center mt-1">{item.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel Derecho - Resultados de Precios */}
      <div className="hidden md:block w-2/3 p-6 overflow-y-auto bg-gray-950">
        {selectedItem ? (
          <>
            <h2 className="text-xl font-bold mb-2">🧾 {selectedItem.nombre}</h2>
            <p className="text-sm text-gray-400 mb-4">ID: {selectedItem.id}</p>

            {loadingPrices ? (
              <p className="text-yellow-300">Cargando precios...</p>
            ) : marketData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {marketData.map((entry) => (
                  <div
                    key={entry.city}
                    className="bg-gray-800 p-3 rounded-xl shadow text-sm"
                  >
                    <h3 className="font-bold mb-1">{entry.city}</h3>
                    <p>🛒 Venta: {entry.sell_price_min?.toLocaleString() || '❌'}</p>
                    <p>💰 Compra: {entry.buy_price_max?.toLocaleString() || '❌'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay precios disponibles.</p>
            )}
          </>
        ) : (
          <p className="text-gray-500">Selecciona un ítem para ver precios.</p>
        )}
      </div>
    </div>
  );
                      }
