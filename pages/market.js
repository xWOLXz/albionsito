import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemPrices, setItemPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // ✅ Cargar items.json desde /public
  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        console.log('✅ Items cargados:', data.length);
      })
      .catch((error) => {
        console.error('❌ Error al cargar items.json:', error);
      });
  }, []);

  // ✅ Debounce búsqueda
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredItems([]);
        return;
      }

      const resultados = items.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredItems(resultados);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, items]);

  // ✅ Al hacer clic en un item
  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    setItemPrices([]);
    setLoadingPrices(true);
    console.log(`🔎 Consultando precios para: ${item.id}`);

    try {
      const response = await fetch(
        `https://west.albion-online-data.com/api/v2/stats/prices/${item.id}?locations=FortSterling,Thetford,Lymhurst,Bridgewatch,Martlock,Caerleon,Brecilien`
      );
      const data = await response.json();

      const precios = data.map((entry) => ({
        ciudad: entry.city,
        venta: entry.sell_price_min,
        compra: entry.buy_price_max,
      }));

      setItemPrices(precios);
    } catch (error) {
      console.error('❌ Error al obtener precios:', error);
    } finally {
      setLoadingPrices(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row">
      {/* Panel Izquierdo: Buscador */}
      <div className="w-full md:w-1/3 p-4 bg-gray-900 border-r border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-white">Buscar Ítem</h1>

        <input
          type="text"
          placeholder="Ej: espada, hacha, capa, montura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded-md text-black"
        />

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className="bg-gray-800 hover:bg-gray-700 transition rounded-lg p-2 cursor-pointer flex flex-col items-center"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-12 h-12 mb-1"
                onError={(e) => {
                  e.target.src = '/no-img.png';
                }}
              />
              <p className="text-xs text-center">{item.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel Derecho: Resultados */}
      <div className="w-full md:w-2/3 p-4">
        {selectedItem ? (
          <div>
            <h2 className="text-xl font-bold mb-4">
              💰 Precios de: {selectedItem.nombre}
            </h2>

            {loadingPrices ? (
              <p className="text-gray-400">⏳ Cargando precios...</p>
            ) : itemPrices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {itemPrices.map((precio) => (
                  <div
                    key={precio.ciudad}
                    className="bg-gray-800 p-4 rounded-xl shadow text-center"
                  >
                    <h3 className="font-bold text-lg mb-2">
                      📍 {precio.ciudad}
                    </h3>
                    <p className="text-sm">
                      🛒 Venta: {precio.venta > 0 ? precio.venta.toLocaleString() + ' 🪙' : <span className="text-red-400">Sin datos</span>}
                    </p>
                    <p className="text-sm">
                      📥 Compra: {precio.compra > 0 ? precio.compra.toLocaleString() + ' 🪙' : <span className="text-red-400">Sin datos</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Sin información de precios.</p>
            )}
          </div>
        ) : (
          <p className="text-gray-400">Selecciona un ítem para ver los precios.</p>
        )}
      </div>
    </div>
  );
              }
