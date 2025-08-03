import { useState, useEffect } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [precios, setPrecios] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/api/items/all');
        const data = await res.json();
        setItems(data);
        setFilteredItems(data);
      } catch (err) {
        console.error('Error cargando items:', err);
      }
    };
    fetchItems();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredItems(
      items.filter((item) =>
        item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(value) ||
        item.UniqueName?.toLowerCase().includes(value)
      )
    );
  };

  const handleClick = async (item) => {
    setSelectedItem(item);
    setLoading(true);
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/api/precios?itemId=${item.UniqueName}`);
      const data = await res.json();
      setPrecios(data);
    } catch (err) {
      console.error('Error al cargar precios:', err);
      setPrecios(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">🛒 Buscador de Ítems</h1>
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Espada, T5_FIRESTAFF@2, Martillo, etc..."
        className="w-full p-2 mb-6 text-black rounded"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.UniqueName}
            className="bg-gray-800 p-3 rounded hover:bg-gray-700 cursor-pointer"
            onClick={() => handleClick(item)}
          >
            <img
              src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
              alt={item.UniqueName}
              className="w-12 h-12 mb-2"
            />
            <p className="text-sm font-semibold">{item.LocalizedNames?.['ES-ES'] || item.UniqueName}</p>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="mt-8 bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">
            {selectedItem.LocalizedNames?.['ES-ES'] || selectedItem.UniqueName}
          </h2>
          <img
            src={`https://render.albiononline.com/v1/item/${selectedItem.UniqueName}.png`}
            alt={selectedItem.UniqueName}
            className="w-16 h-16 mb-2"
          />

          {loading ? (
            <p>Cargando precios...</p>
          ) : precios ? (
            <>
              <p>📈 Precio más alto de compra: <strong>{precios.buy.price.toLocaleString()}</strong> en {precios.buy.city}</p>
              <p>📉 Precio más bajo de venta: <strong>{precios.sell.price.toLocaleString()}</strong> en {precios.sell.city}</p>
              <p>💰 Margen: <strong>{precios.margen.toLocaleString()}</strong></p>
            </>
          ) : (
            <p>No se encontraron precios.</p>
          )}
        </div>
      )}
    </div>
  );
}
