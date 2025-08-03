import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

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

  // ✅ Debounce al escribir
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
    }, 300); // ⏱ Espera 300ms

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, items]);

  const handleClick = (item) => {
    console.log('🟢 Item seleccionado:', item);
    alert(`ID del item: ${item.id}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🔍 Buscar Ítem (desde items.json)</h1>

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
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item)}
            className="bg-gray-800 rounded-xl p-2 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition"
          >
            <img
              src={item.imagen}
              alt={item.nombre}
              className="w-16 h-16 mb-2"
              onError={(e) => {
                e.target.src = '/no-img.png';
              }}
            />
            <p className="text-sm text-center">{item.nombre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
