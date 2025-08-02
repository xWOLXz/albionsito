import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://albionsito-backend.onrender.com/items');
      const data = await res.json();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error cargando datos del backend:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleBuscar = (e) => {
    const texto = e.target.value.toLowerCase();
    setBusqueda(texto);
    const resultados = items.filter((item) =>
      item.nombre.toLowerCase().includes(texto)
    );
    setFilteredItems(resultados);
  };

  const formatoMoneda = (valor) => {
    return valor.toLocaleString('es-CO');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🛒 Mercado de Albion</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Buscar ítem..."
          className="p-2 rounded bg-gray-800 text-white w-full md:w-1/2"
          value={busqueda}
          onChange={handleBuscar}
        />
        <button
          onClick={fetchItems}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded w-full md:w-auto"
          title="Actualizar"
        >
          🔄
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <img src="/albion-loader.gif" alt="Cargando..." className="w-24 h-24" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 text-left">Ítem</th>
                <th className="p-2">Compra más baja</th>
                <th className="p-2">Venta más alta</th>
                <th className="p-2">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems
                .sort((a, b) => b.ganancia - a.ganancia)
                .map((item) => (
                  <tr key={item.item_id} className="border-t border-gray-700 hover:bg-gray-800">
                    <td className="flex items-center gap-2 p-2">
                      <img src={item.icono} alt={item.nombre} className="w-6 h-6" />
                      {item.nombre}
                    </td>
                    <td className="text-center">
                      <div>{formatoMoneda(item.compra)} 🪙</div>
                      <div className="text-xs text-gray-400">{item.ciudad_compra}</div>
                    </td>
                    <td className="text-center">
                      <div>{formatoMoneda(item.venta)} 🪙</div>
                      <div className="text-xs text-gray-400">{item.ciudad_venta}</div>
                    </td>
                    <td className="text-center text-green-400 font-semibold">
                      {formatoMoneda(item.ganancia)} 🪙
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
