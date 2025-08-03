import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  const CITIES = [
    'Bridgewatch',
    'Martlock',
    'Lymhurst',
    'Fort Sterling',
    'Thetford',
    'Caerleon',
    'Brecilien',
  ];

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

  // ✅ Filtrar items por búsqueda
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredItems([]);
        return;
      }

      const resultados = items.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log('🔍 Buscando:', searchTerm);
      console.log('📦 Resultados encontrados:', resultados.length);
      setFilteredItems(resultados);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, items]);

  // ✅ Al seleccionar un item
  const handleClick = (item) => {
    console.log('🟢 Item seleccionado:', item);
    setSelectedItem(item);
    setMarketData(null);
    fetchMarketData(item.id);
  };

  // ✅ Cargar datos del market por ID
  const fetchMarketData = async (itemId) => {
    setLoadingData(true);
    try {
      const cityParams = CITIES.map((city) => `locations=${city}`).join('&');
      const response = await fetch(
        `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json?${cityParams}&qualities=1`
      );
      const data = await response.json();
      console.log('📊 Datos de mercado recibidos:', data);
      setMarketData(data);
    } catch (error) {
      console.error('❌ Error al obtener datos del market:', error);
      setMarketData([]);
    } finally {
      setLoadingData(false);
    }
  };

  // ✅ Obtener datos organizados por ciudad
  const getDataByCity = () => {
    if (!marketData || !Array.isArray(marketData)) return [];
    return CITIES.map((city) => {
      const entry = marketData.find((e) => e.city === city);
      return {
        city,
        sellPrice: entry?.sell_price_min || null,
        buyPrice: entry?.buy_price_max || null,
      };
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen p-4 bg-black text-white">
      {/* Panel izquierdo: Buscador */}
      <div className="md:w-1/3 p-2">
        <h1 className="text-xl font-bold mb-2">🔍 Buscar Ítem</h1>
        <input
          type="text"
          placeholder="Ej: espada, capa, montura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-600 bg-white text-black rounded mb-4"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[70vh] pr-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className="bg-gray-800 rounded-xl p-2 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition"
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

      {/* Panel derecho: Resultados */}
      <div className="md:w-2/3 p-4">
        {selectedItem ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              📦 Datos de Mercado: {selectedItem.nombre}
            </h2>

            {loadingData && <p>⏳ Cargando datos del mercado...</p>}

            {!loadingData && (
              <div className="space-y-2">
                {getDataByCity().map((data, index) => (
                  <div key={index} className="border-b border-gray-600 pb-2 mb-2">
                    <h3 className="text-lg font-medium text-yellow-400">{data.city}</h3>
                    <p>🛒 Venta más barata: {data.sellPrice ? `${data.sellPrice} ᛃ` : 'No disponible'}</p>
                    <p>🛍️ Compra más cara: {data.buyPrice ? `${data.buyPrice} ᛃ` : 'No disponible'}</p>
                    {data.sellPrice && data.buyPrice && (
                      <p className="text-green-400">
                        📈 Margen: {data.buyPrice - data.sellPrice} ᛃ
                      </p>
                    )}
                  </div>
                ))}
                <p className="text-sm text-gray-400 italic">
                  ⏱ Última actualización: {new Date().toLocaleString()}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">Selecciona un ítem para ver sus precios en el mercado.</p>
        )}
      </div>
    </div>
  );
                  }
