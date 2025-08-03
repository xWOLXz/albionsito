import { useState } from 'react';
import itemsData from '../utils/items.json';

export default function Market() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemPrices, setItemPrices] = useState(null);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value.length === 0) {
      setFilteredItems([]);
      return;
    }

    const results = itemsData.filter((item) =>
      item?.name?.toLowerCase().includes(value)
    );

    setFilteredItems(results.slice(0, 20));
    console.log('🔍 Buscando:', value);
    console.log('🔎 Resultados encontrados:', results.length);
  };

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setFilteredItems([]);
    console.log('✅ Ítem seleccionado:', item);

    try {
      const response = await fetch(
        `https://west.albion-online-data.com/api/v2/stats/prices/${item.id}.json?locations=Bridgewatch,Martlock,Thetford,Lymhurst,FortSterling,Caerleon`
      );
      const data = await response.json();
      console.log('💰 Datos de precios:', data);
      setItemPrices(data);
    } catch (error) {
      console.error('❌ Error al obtener precios:', error);
      setItemPrices(null);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">📦 Mercado de Albion</h1>

      <input
        type="text"
        placeholder="Buscar ítem por nombre..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={handleSearch}
      />

      {filteredItems.length > 0 && (
        <ul className="bg-white shadow rounded max-h-80 overflow-y-auto mb-4">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectItem(item)}
            >
              <img src={item.icon} alt={item.name} className="w-6 h-6" />
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      )}

      {selectedItem && (
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">{selectedItem.name}</h2>
          <img
            src={selectedItem.icon}
            alt={selectedItem.name}
            className="w-12 h-12 mb-2"
          />

          {itemPrices ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-1">Ciudad</th>
                  <th className="py-1">Compra máx</th>
                  <th className="py-1">Venta mín</th>
                </tr>
              </thead>
              <tbody>
                {itemPrices.map((entry, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-1">{entry.city}</td>
                    <td className="py-1">{entry.buy_price_max?.toLocaleString() || '-'}</td>
                    <td className="py-1">{entry.sell_price_min?.toLocaleString() || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-red-500 mt-2">No se pudo obtener información de precios.</p>
          )}
        </div>
      )}
    </div>
  );
}
