import { useEffect, useState } from 'react';

const ciudades = ['Thetford', 'FortSterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'BlackMarket'];

export default function Market() {
  const [items, setItems] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 30;

  useEffect(() => {
    const cargarItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/items');
        const data = await res.json();
        const itemsConImagen = data.filter(item => item.imagen && item.imagen.startsWith('https'));
        setItems(itemsConImagen);
      } catch (err) {
        console.error('Error cargando items:', err);
      }
    };

    cargarItems();
  }, []);

  const [precios, setPrecios] = useState({});

  const obtenerPrecios = async () => {
    try {
      const ids = items.map(item => item.id).join(',');
      const res = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${ids}.json?locations=${ciudades.join(',')}`);
      const data = await res.json();

      const datosFiltrados = {};
      data.forEach(entry => {
        const { item_id, city, sell_price_min, buy_price_max } = entry;
        if (!datosFiltrados[item_id]) {
          datosFiltrados[item_id] = {
            sell_price: sell_price_min,
            sell_city: city,
            buy_price: buy_price_max,
            buy_city: city,
          };
        } else {
          if (sell_price_min > 0 && sell_price_min < datosFiltrados[item_id].sell_price) {
            datosFiltrados[item_id].sell_price = sell_price_min;
            datosFiltrados[item_id].sell_city = city;
          }
          if (buy_price_max > datosFiltrados[item_id].buy_price) {
            datosFiltrados[item_id].buy_price = buy_price_max;
            datosFiltrados[item_id].buy_city = city;
          }
        }
      });

      setPrecios(datosFiltrados);
    } catch (err) {
      console.error('Error cargando precios:', err);
    }
  };

  useEffect(() => {
    if (items.length > 0) {
      obtenerPrecios();
      const intervalo = setInterval(obtenerPrecios, 30000);
      return () => clearInterval(intervalo);
    }
  }, [items]);

  const itemsFiltrados = items.filter(item =>
    item.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalPaginas = Math.ceil(itemsFiltrados.length / itemsPorPagina);
  const itemsPagina = itemsFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  return (
    <div className="bg-black text-white min-h-screen px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Market General</h1>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Buscar ítem..."
          className="text-black px-4 py-2 rounded w-full max-w-md"
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaActual(1);
          }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {itemsPagina.map(item => {
          const precio = precios[item.id];
          const margen = precio && precio.sell_price && precio.buy_price
            ? precio.sell_price - precio.buy_price
            : null;

          return (
            <div key={item.id} className="bg-zinc-900 rounded-xl p-4 flex flex-col items-center shadow-lg">
              <img src={item.imagen} alt={item.nombre} className="w-20 h-20 mb-2" />
              <h2 className="text-center text-lg font-semibold mb-2">{item.nombre}</h2>

              {precio ? (
                <>
                  <p className="text-sm text-green-400">
                    🟢 Compra: {precio.buy_price.toLocaleString()} 🏙️ {precio.buy_city}
                  </p>
                  <p className="text-sm text-red-400">
                    🔴 Venta: {precio.sell_price.toLocaleString()} 🏙️ {precio.sell_city}
                  </p>
                  <p className="text-sm text-yellow-400">
                    💰 Ganancia: {margen ? margen.toLocaleString() : '0'}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Cargando precios...</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
          disabled={paginaActual === 1}
          className="bg-white text-black px-3 py-1 rounded disabled:opacity-50"
        >
          ← Anterior
        </button>
        <span className="px-3 py-1">{paginaActual} / {totalPaginas}</span>
        <button
          onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
          disabled={paginaActual === totalPaginas}
          className="bg-white text-black px-3 py-1 rounded disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
            }
