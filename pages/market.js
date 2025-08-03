// pages/market.js
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Market() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        console.log('📦 Items cargados:', data.length);
      })
      .catch((err) => console.error('Error al cargar items.json:', err));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const term = search.toLowerCase();
      const filtered = items.filter((item) => {
        const nameES = item?.LocalizedNames?.['ES-ES'] || '';
        return nameES.toLowerCase().includes(term);
      });
      setFilteredItems(filtered);
      console.log('🔍 Buscando:', search);
      console.log('📊 Resultados encontrados:', filtered.length);
    }, 200);

    return () => clearTimeout(timeout);
  }, [search, items]);

  const handleItemClick = (item) => {
    const id = item.UniqueName;
    const name = item?.LocalizedNames?.['ES-ES'] || 'Sin nombre';
    const imageUrl = `https://render.albiononline.com/v1/item/${id}.png`;
    const selected = { id, nombre: name, imagen: imageUrl };
    console.log('📌 Ítem seleccionado:', selected);
    alert(`ID del ítem: ${id}`);
  };

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">
        🔍 Buscar Ítem (desde items.json)
      </h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre en español..."
          className="p-2 rounded-md text-black w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredItems.map((item) => {
          const id = item.UniqueName;
          const name = item?.LocalizedNames?.['ES-ES'] || 'Sin nombre';
          const imageUrl = `https://render.albiononline.com/v1/item/${id}.png`;

          return (
            <div
              key={id}
              className="bg-zinc-900 p-2 rounded-xl hover:scale-105 transition cursor-pointer shadow-md"
              onClick={() => handleItemClick(item)}
            >
              <Image
                src={imageUrl}
                alt={name}
                width={80}
                height={80}
                className="mx-auto rounded"
              />
              <p className="text-center text-sm mt-2">{name}</p>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && search.trim() !== '' && (
        <p className="text-center text-zinc-400 mt-10">❌ No se encontraron ítems con ese nombre.</p>
      )}
    </div>
  );
}
