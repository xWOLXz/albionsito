import React, { useState, useEffect } from 'react';

const Busqueda = () => {
  const [nombreItem, setNombreItem] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [itemsData, setItemsData] = useState([]);

  // Cargar items.json desde /public
  useEffect(() => {
    const cargarItems = async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        setItemsData(data);
      } catch (err) {
        console.error('Error cargando items.json:', err);
      }
    };

    cargarItems();
  }, []);

  const buscarItem = async () => {
    if (!nombreItem.trim()) return;

    setCargando(true);
    setError(null);
    setResultados([]);

    try {
      const response = await fetch(`https://albionsito-backend2.vercel.app/api/item?name=${encodeURIComponent(nombreItem)}`);

      if (!response.ok) {
        throw new Error('Error al consultar el backend');
      }

      const data = await response.json();
      setResultados(data);
    } catch (err) {
      console.error('Error al buscar:', err.message);
      setError('Ocurrió un error al buscar el ítem.');
    } finally {
      setCargando(false);
    }
  };

  const manejarInput = (e) => {
    setNombreItem(e.target.value);
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    buscarItem();
  };

  const obtenerNombreYIcono = (itemId) => {
    const item = itemsData.find((i) => i.id === itemId);
    return item ? { nombre: item.nombre, icono: item.url || item.icono } : { nombre: itemId, icono: `https://render.albiononline.com/v1/item/${itemId}.png` };
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🔍 Buscar ítem por nombre</h1>

      <form onSubmit={manejarSubmit} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={nombreItem}
          onChange={manejarInput}
          placeholder="Ej: Caballo, Hacha, Túnica, etc."
          className="p-2 border rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>

      {cargando && (
        <div className="text-center mt-4 text-yellow-600">Cargando datos...</div>
      )}

      {error && (
        <div className="text-center mt-4 text-red-600">{error}</div>
      )}

      {resultados.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Resultados:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {resultados.map((item, index) => {
              const info = obtenerNombreYIcono(item.item_id);
              return (
                <div key={index} className="p-4 border rounded shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={info.icono}
                      alt={item.item_id}
                      className="w-10 h-10"
                    />
                    <span className="font-bold">{info.nombre}</span>
                  </div>
                  <p>🛒 Venta: {item.sell_price_min.toLocaleString()} (mín)</p>
                  <p>📦 Compra: {item.buy_price_max.toLocaleString()} (máx)</p>
                  <p>📍 Ciudad: {item.city}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Busqueda;
