import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemPrices, setItemPrices] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Cargar items desde /public/items.json
  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        console.log('✅ Items cargados:', data.length);
      })
      .catch((err) => {
        console.error('❌ Error al cargar items:', err);
      });
  }, []);

  // Filtro con debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredItems([]);
        return;
      }

      const results = items.filter((item) =>
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(results);
      console.log('🔍 Resultados filtrados:', results.length);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, items]);

  // Cargar precios desde la API de Albion Online 2D
  const fetchItemPrices = async (itemId) => {
    try {
      setLoadingPrices(true);
      setItemPrices(null);
      const res = await fetch(
        `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json`
      );
      const data = await res.json();
      console.log('📦 Datos desde API:', data);

      const cities = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Caerleon', 'Brecilien'];
      const preciosPorCiudad = cities.map((city) => {
        const registros = data.filter((entry) => entry.city === city);
        const sellPrice = Math.min(...registros.map((r) => r.sell_price_min).filter((p) => p > 0));
        const buyPrice = Math.max(...registros.map((r) => r.buy_price_max).filter((p) => p > 0));
        const margen = sellPrice && buyPrice ? sellPrice - buyPrice : null;

        return {
          ciudad: city,
          venta: sellPrice || 0,
          compra: buyPrice || 0,
          margen: margen || 0,
        };
      });

      setItemPrices(preciosPorCiudad);
      setLoadingPrices(false);
    } catch (err) {
      console.error('❌ Error al cargar precios desde API:', err);
      setLoadingPrices(false);
    }
  };

  const handleClickItem = (item) => {
    console.log('🟢 Ítem seleccionado:', item);
    setSelectedItem(item);
    fetchItemPrices(item.id);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      {/* Panel de búsqueda */}
      <div className="md:w-1/3 border-r border-gray-700 p-4">
        <h1 className="text-2xl font-bold mb-4">🔍 Buscar Ítem</h1>
        <input
          type="text"
          placeholder="Buscar por ID (ej: T5_CAPE, T8_SWORD...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 text-black rounded"
        />
        <div className="grid grid-cols-2 gap-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClickItem(item)}
              className="bg-gray-800 hover:bg-gray-700 rounded p-2 flex flex-col items-center cursor-pointer transition"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-12 h-12 object-contain mb-1"
                onError={(e) => (e.target.src = '/no-img.png')}
              />
              <p className="text-xs text-center">{item.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de resultado */}
      <div className="md:w-2/3 p-4">
        {selectedItem && (
          <div>
            <h2 className="text-xl font-semibold mb-2">{selectedItem.nombre}</h2>
            <p className="text-sm mb-4 text-gray-300">{selectedItem.id}</p>

            {loadingPrices ? (
              <div className="flex justify-center">
                <img src="/albion-loader.gif" alt="Cargando..." className="w-16 h-16" />
              </div>
            ) : itemPrices ? (
              <table className="w-full text-sm text-left border border-gray-700">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 border border-gray-700">Ciudad</th>
                    <th className="p-2 border border-gray-700">💰 Compra</th>
                    <th className="p-2 border border-gray-700">🪙 Venta</th>
                    <th className="p-2 border border-gray-700">📈 Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {itemPrices.map((ciudad, index) => (
                    <tr key={index} className="hover:bg-gray-800 transition">
                      <td className="p-2 border border-gray-700">{ciudad.ciudad}</td>
                      <td className="p-2 border border-gray-700">{ciudad.compra.toLocaleString()}</td>
                      <td className="p-2 border border-gray-700">{ciudad.venta.toLocaleString()}</td>
                      <td className="p-2 border border-gray-700">{ciudad.margen.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400">No hay precios disponibles aún.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
                }
