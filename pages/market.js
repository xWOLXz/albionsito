import { useEffect, useState } from 'react';

const CITIES = [
  'Bridgewatch',
  'Martlock',
  'Thetford',
  'Fort Sterling',
  'Lymhurst',
  'Brecilien',
];

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState(null);

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

  // ✅ Búsqueda con debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredItems([]);
        return;
      }

      const resultados = items.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log('🔎 Buscando:', searchTerm);
      console.log('📦 Resultados encontrados:', resultados.length);
      setFilteredItems(resultados);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, items]);

  // ✅ Cargar datos de mercado al seleccionar ítem
  const handleClick = (item) => {
    setSelectedItem(item);
    console.log('🟢 Item seleccionado:', item);

    const cityParams = CITIES.map((c) => `locations=${c}`).join('&');
    const url = `https://west.albion-online-data.com/api/v2/stats/prices/${item.id}.json?${cityParams}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log('📊 Datos de mercado recibidos:', data);
        setMarketData(data);
      })
      .catch((err) => {
        console.error('❌ Error al cargar datos del mercado:', err);
        setMarketData(null);
      });
  };

  const renderTable = () => {
    if (!marketData || !Array.isArray(marketData)) return null;

    const rows = CITIES.map((city) => {
      const ciudadData = marketData.find((e) => e.city === city) || {};
      const venta = ciudadData.sell_price_min ?? 'No disponible';
      const compra = ciudadData.buy_price_max ?? 'No disponible';

      const margen =
        typeof venta === 'number' && typeof compra === 'number'
          ? venta - compra
          : 'No disponible';

      return (
        <tr key={city} className="border-t border-gray-600">
          <td className="p-2 font-semibold">{city}</td>
          <td className="p-2 text-blue-400">
            {venta !== 'No disponible' ? `${venta} ¤` : venta}
          </td>
          <td className="p-2 text-red-400">
            {compra !== 'No disponible' ? `${compra} ¤` : compra}
          </td>
          <td className={`p-2 ${typeof margen === 'number' ? (margen >= 0 ? 'text-green-400' : 'text-red-500') : 'text-gray-400'}`}>
            {typeof margen === 'number' ? `${margen} de ganancia` : margen}
          </td>
        </tr>
      );
    });

    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">📦 Datos de Mercado: {selectedItem.nombre}</h2>
        <table className="w-full text-left text-sm bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="p-2">Ciudad</th>
              <th className="p-2">Venta más barata</th>
              <th className="p-2">Compra más cara</th>
              <th className="p-2">Margen</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 text-white">{rows}</tbody>
        </table>
        <p className="text-xs mt-2 text-gray-400">
          ⏱ Última actualización: {new Date().toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-6">
      {/* Panel izquierdo: búsqueda */}
      <div className="md:w-1/3">
        <h1 className="text-2xl font-bold mb-4">🔍 Buscar Ítem</h1>
        <input
          type="text"
          placeholder="Buscar ítem (ej: espada, capa, montura...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md mb-4 text-black"
        />

        {filteredItems.length === 0 && searchTerm !== '' && (
          <p className="text-gray-400">Sin resultados para: "{searchTerm}"</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4">
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
                  e.target.src = '/no-img.png';
                }}
              />
              <p className="text-xs text-center">{item.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho: resultados */}
      <div className="md:w-2/3">
        {selectedItem && renderTable()}
        {!selectedItem && (
          <p className="text-gray-500">Selecciona un ítem para ver su información de mercado.</p>
        )}
      </div>
    </div>
  );
      }
