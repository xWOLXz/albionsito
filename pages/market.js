import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

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

  // ✅ Buscar ítems por nombre
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

  const handleClick = async (item) => {
    setSelectedItem(item);
    setLoadingData(true);

    try {
      const res = await fetch(
        `https://www.albion-online-data.com/api/v2/stats/prices/${item.id}.json?locations=Bridgewatch,Martlock,Lymhurst,Thetford,Fortsterling,Caerleon`
      );
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error('❌ Formato inesperado de la API');

      let minSell = null;
      let maxBuy = null;

      data.forEach((entry) => {
        if (entry.sell_price_min > 0 && (!minSell || entry.sell_price_min < minSell.price)) {
          minSell = { price: entry.sell_price_min, city: entry.city };
        }
        if (entry.buy_price_max > 0 && (!maxBuy || entry.buy_price_max > maxBuy.price)) {
          maxBuy = { price: entry.buy_price_max, city: entry.city };
        }
      });

      const margen = minSell && maxBuy ? maxBuy.price - minSell.price : 'No disponible';

      setMarketData({
        venta: minSell,
        compra: maxBuy,
        margen,
        timestamp: data[0]?.sell_price_min_date || 'Desconocido',
      });
    } catch (error) {
      console.error('❌ Error al obtener datos de mercado:', error);
      setMarketData(null);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">🔍 Buscar Ítem (desde items.json)</h1>

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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const imagen = item.imagen || `https://render.albiononline.com/v1/item/${item.id}.png`;

          return (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className="bg-gray-800 rounded-xl p-2 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition"
            >
              <img
                src={imagen}
                alt={item.nombre}
                className="w-16 h-16 mb-2"
                onError={(e) => {
                  e.target.src = '/no-img.png';
                }}
              />
              <p className="text-sm text-center">{item.nombre}</p>
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <div className="mt-10 bg-gray-900 p-4 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-2">📦 Datos de Mercado: {selectedItem.nombre}</h2>

          {loadingData ? (
            <p className="text-yellow-400">Cargando datos de mercado...</p>
          ) : marketData ? (
            <>
              <p>
                📉 <strong>Venta más barata:</strong>{' '}
                {marketData.venta
                  ? `${marketData.venta.price} en ${marketData.venta.city}`
                  : 'No disponible'}
              </p>
              <p>
                📈 <strong>Compra más cara:</strong>{' '}
                {marketData.compra
                  ? `${marketData.compra.price} en ${marketData.compra.city}`
                  : 'No disponible'}
              </p>
              <p>
                💸 <strong>Margen:</strong>{' '}
                {typeof marketData.margen === 'number'
                  ? `${marketData.margen} de ganancia`
                  : marketData.margen}
              </p>
              <p>
                ⏱️ <strong>Última actualización:</strong>{' '}
                {new Date(marketData.timestamp).toLocaleString('es-CO')}
              </p>
            </>
          ) : (
            <p className="text-red-400">No se pudo obtener información del mercado.</p>
          )}
        </div>
      )}
    </div>
  );
      }
