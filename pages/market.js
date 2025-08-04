import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Cargar items.json
  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        console.log('✅ items.json cargado:', data.length);
      })
      .catch((err) => {
        console.error('❌ Error al cargar items.json:', err);
      });
  }, []);

  // Búsqueda con debounce
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
      console.log('🔍 Resultados:', resultados.length);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, items]);

  // Obtener precios desde API Albion 2D
  useEffect(() => {
    if (!selectedItem) return;

    const fetchPrices = async () => {
      setLoadingData(true);
      try {
        const response = await fetch(
          `https://west.albion-online-data.com/api/v2/stats/prices/${selectedItem.id}?locations=Bridgewatch,Martlock,Lymhurst,Thetford,FortSterling,Caerleon,Brecilien&qualities=1`
        );
        const data = await response.json();
        console.log('📦 Datos de mercado:', data);
        setMarketData(data);
      } catch (error) {
        console.error('❌ Error al obtener precios:', error);
        setMarketData(null);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPrices();
  }, [selectedItem]);

  const handleClick = (item) => {
    setSelectedItem(item);
    setMarketData(null);
    console.log('🟢 Item seleccionado:', item.nombre);
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-4 min-h-screen bg-[#1a1a1a] text-white">
      {/* Panel de búsqueda */}
      <div className="md:w-1/3">
        <h1 className="text-xl font-bold mb-4">🔎 Buscar ítem</h1>
        <input
          type="text"
          placeholder="Ej: espada, hacha, capa, montura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[70vh] overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className="bg-[#2b2b2b] hover:bg-[#3a3a3a] p-2 rounded cursor-pointer flex flex-col items-center text-center"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-12 h-12"
                onError={(e) => {
                  e.target.src = '/no-img.png';
                }}
              />
              <span className="text-sm mt-1">{item.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de resultados */}
      <div className="md:w-2/3">
        {selectedItem && (
          <div>
            <h2 className="text-xl font-bold mb-2">
              📊 Precios de: <span className="text-yellow-400">{selectedItem.nombre}</span>
            </h2>
            {loadingData ? (
              <p className="text-gray-400">Cargando datos del mercado...</p>
            ) : marketData && marketData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border mt-2">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="px-2 py-1 border">Ciudad</th>
                      <th className="px-2 py-1 border">Precio Venta</th>
                      <th className="px-2 py-1 border">Precio Compra</th>
                      <th className="px-2 py-1 border">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Bridgewatch', 'Martlock', 'Lymhurst', 'Thetford', 'FortSterling', 'Caerleon', 'Brecilien'].map((city) => {
                      const ciudadData = marketData.find((entry) => entry.city === city);
                      const sell = ciudadData?.sell_price_min || 0;
                      const buy = ciudadData?.buy_price_max || 0;
                      const diff = sell && buy ? sell - buy : 0;

                      return (
                        <tr key={city} className="border-b">
                          <td className="px-2 py-1 border">{city}</td>
                          <td className="px-2 py-1 border text-green-400">
                            {sell > 0 ? sell.toLocaleString() : '—'}
                          </td>
                          <td className="px-2 py-1 border text-red-400">
                            {buy > 0 ? buy.toLocaleString() : '—'}
                          </td>
                          <td className="px-2 py-1 border text-yellow-300">
                            {diff > 0 ? `+${diff.toLocaleString()}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No hay datos disponibles para este ítem.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
        }
