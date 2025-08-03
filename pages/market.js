import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Cargar items desde /public/items.json
  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        console.log('✅ Items cargados:', data.length);
      })
      .catch((err) => {
        console.error('❌ Error al cargar items.json:', err);
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

  const handleItemClick = async (item) => {
    console.log('🟢 Item seleccionado:', item);
    setSelectedItem(item);
    setMarketData([]);
    setLoading(true);

    try {
      const response = await fetch(
        `https://west.albion-online-data.com/api/v2/stats/prices/${item.id}?locations=FortSterling,Thetford,Lymhurst,Bridgewatch,Martlock,Caerleon,Brecilien&qualities=1`
      );
      const data = await response.json();
      console.log('📈 Datos recibidos de la API:', data);
      setMarketData(data);
    } catch (error) {
      console.error('❌ Error al obtener datos del mercado:', error);
    } finally {
      setLoading(false);
      // Scroll automático hacia resultados
      setTimeout(() => {
        const panel = document.getElementById('market-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const renderPriceTable = () => {
    if (!selectedItem) return null;

    const ciudades = [
      'FortSterling',
      'Thetford',
      'Lymhurst',
      'Bridgewatch',
      'Martlock',
      'Caerleon',
      'Brecilien',
    ];

    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-lg mt-4">
        <h2 className="text-xl font-bold mb-2">
          📊 Precios para: {selectedItem.nombre}
        </h2>

        {loading ? (
          <p className="text-yellow-400">⏳ Consultando precios en la API...</p>
        ) : marketData.length === 0 ? (
          <p className="text-red-400">⚠️ No hay datos disponibles.</p>
        ) : (
          <table className="w-full text-sm table-auto border-collapse mt-2">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-2 py-1 text-left">Ciudad</th>
                <th className="px-2 py-1">💰 Precio Venta Mín.</th>
                <th className="px-2 py-1">🪙 Precio Compra Máx.</th>
                <th className="px-2 py-1">📈 Margen</th>
              </tr>
            </thead>
            <tbody>
              {ciudades.map((ciudad) => {
                const datosCiudad = marketData.find((d) => d.city === ciudad);
                const sellPrice = datosCiudad?.sell_price_min || 0;
                const buyPrice = datosCiudad?.buy_price_max || 0;
                const margen = sellPrice && buyPrice ? sellPrice - buyPrice : 0;

                return (
                  <tr
                    key={ciudad}
                    className="border-t border-gray-600 text-center hover:bg-gray-800"
                  >
                    <td className="px-2 py-1 text-left">{ciudad}</td>
                    <td className="px-2 py-1 text-green-400">
                      {sellPrice.toLocaleString()}
                    </td>
                    <td className="px-2 py-1 text-blue-400">
                      {buyPrice.toLocaleString()}
                    </td>
                    <td className="px-2 py-1 text-yellow-300">
                      {margen.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-4">
      {/* Panel izquierdo: buscador */}
      <div className="md:w-1/2 w-full">
        <h1 className="text-2xl font-bold mb-4">🔍 Buscar Ítem</h1>
        <input
          type="text"
          placeholder="Ej: espada, capa, montura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md mb-4 text-black"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-2 text-center cursor-pointer transition"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-16 h-16 mx-auto mb-2"
                onError={(e) => {
                  e.target.src = '/no-img.png';
                  e.target.onerror = null;
                }}
              />
              <p className="text-sm text-white">{item.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho: resultados */}
      <div id="market-panel" className="md:w-1/2 w-full">
        {renderPriceTable()}
      </div>
    </div>
  );
}
