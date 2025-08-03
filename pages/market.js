import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Market() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        setItems(data);
        setFiltered(data);
        console.log('📦 Ítems cargados:', data.length);
      } catch (error) {
        console.error('Error al cargar items.json:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const texto = e.target.value;
    setBusqueda(texto);

    if (texto.trim() === '') {
      setFiltered(items);
      return;
    }

    const resultado = items.filter(item =>
      item.nombre?.toLowerCase().includes(texto.toLowerCase())
    );

    setFiltered(resultado);
  };

  const handleItemClick = (item) => {
    alert(`ID del ítem: ${item.id}`);
    console.log('🟢 Ítem seleccionado:', item);
    // Aquí se podrá luego llamar a la API con item.id
  };

  return (
    <div className="bg-black min-h-screen text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🔍 Buscar Ítem (desde items.json)</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Ej: Espada, capa, montura..."
          className="w-full max-w-md px-4 py-2 rounded-md text-black"
          value={busqueda}
          onChange={handleChange}
        />
      </div>

      {loading ? (
        <p className="text-center">Cargando ítems...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((item, index) => (
            <div
              key={index}
              className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg cursor-pointer text-center"
              onClick={() => handleItemClick(item)}
            >
              <Image
                src={item.imagen}
                alt={item.nombre || item.id}
                width={100}
                height={100}
                className="mx-auto mb-2 rounded"
                unoptimized
                onError={(e) => (e.target.style.display = 'none')}
              />
              <p className="text-sm">{item.nombre || item.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
            }
