import React, { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [priceData, setPriceData] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/api/items/all');
        const data = await res.json();
        setItems(data);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando items:', err);
      }
    };

    fetchItems();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    if (value === '') {
      setFiltered([]);
      setSelectedItem(null);
      return;
    }

    const filteredResults = items.filter((item) =>
      item.nombre.toLowerCase().includes(value)
    );
    setFiltered(filteredResults);
    setSelectedItem(null);
    setPriceData(null);
  };

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setPriceData(null);

    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/api/precios?itemId=${item.item_id}`);
      const data = await res.json();
      setPriceData(data);
    } catch (err) {
      console.error('Error al obtener precios:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Market General</h1>

      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Buscar ítem..."
          value={search}
          onChange={handleSearch}
          className="p-2 rounded-md text-black w-full max-w-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <img src="/albion-loader.gif" alt="Cargando..." className="w-20 h-20" />
        </div>
      ) : (
        <>
          {filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.item_id}
                  onClick={() => handleItemClick(item)}
                  className="bg-gray-800 hover:bg-gray-700 cursor-pointer p-2 rounded-lg flex flex-col items-center"
                >
                  <img
                    src={`https://render.albiononline.com/v1/item/${item.imagen}.png`}
                    alt={item.nombre}
                    className="w-12 h-12 mb-2"
                  />
                  <span className="text-center text-sm">{item.nombre}</span>
                </div>
              ))}
            </div>
          )}

          {selectedItem && priceData && (
            <div className="mt-8 bg-gray-900 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Precios de: {selectedItem.nombre}</h2>
              <img
                src={`https://render.albiononline.com/v1/item/${selectedItem.imagen}.png`}
                alt={selectedItem.nombre}
                className="w-16 h-16 mb-2"
              />
              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-white">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border border-white">Ciudad</th>
                      <th className="px-2 py-1 border border-white">Más Barato (Venta)</th>
                      <th className="px-2 py-1 border border-white">Más Caro (Compra)</th>
                      <th className="px-2 py-1 border border-white">Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 border border-white">{row.ciudad}</td>
                        <td className="px-2 py-1 border border-white">
                          {row.venta?.toLocaleString() || '—'}
                        </td>
                        <td className="px-2 py-1 border border-white">
                          {row.compra?.toLocaleString() || '—'}
                        </td>
                        <td className="px-2 py-1 border border-white">
                          {row.margen ? row.margen.toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
