import React, { useState, useEffect } from 'react';

const Busqueda = () => {
  const [nombreItem, setNombreItem] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [nombresTraducidos, setNombresTraducidos] = useState({});

  // Cargar traducciones desde el archivo JSON una sola vez
  useEffect(() => {
    const cargarTraducciones = async () => {
      try {
        const res = await fetch('/itemsTraducidos.json');
        const data = await res.json();
        setNombresTraducidos(data);
      } catch (err) {
        console.error('Error cargando nombres traducidos:', err);
      }
    };

    cargarTraducciones();
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
      console.log('[LOG] Resultados obtenidos:', data.length);
      setResultados(data);
    } catch (err) {
      console.error('[ERROR] Falló la búsqueda:', err.message);
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

  const obtenerNombreReal = (itemId) => {
    return nombresTraducidos[itemId] || itemId;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🔍 Buscar ítem por nombre</h1>

      <form onSubmit={manejarSubmit} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={nombreItem}
          onChange={manejarInput}
          placeholder="Ej: Caballo, Hacha, T8, etc."
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
            {resultados.map((item, index) => (
              <div key={index} className="p-4 border rounded shadow">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={`https://render.albiononline.com/v1/item/${item.item_id}.png`}
                    alt={item.item_id}
                    className="w-10 h-10"
                  />
                  <span className="font-bold">{obtenerNombreReal(item.item_id)}</span>
                </div>
                <p>🛒 Venta: {item.sell_price_min.toLocaleString()} (mín)</p>
                <p>📦 Compra: {item.buy_price_max.toLocaleString()} (máx)</p>
                <p>📍 Ciudad: {item.city}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Busqueda;
