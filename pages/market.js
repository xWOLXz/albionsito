// pages/market.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://TUBACKEND/items'; // <-- CAMBIA esto por tu backend real
const ITEMS_PER_PAGE = 20;

export default function Market() {
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      setCargando(true);
      try {
        const res = await axios.get(API_URL);
        setItems(res.data);
      } catch (error) {
        console.error('Error al obtener ítems:', error);
      }
      setCargando(false);
    };

    obtenerDatos();
  }, []);

  const totalPaginas = Math.ceil(items.length / ITEMS_PER_PAGE);
  const mostrarItems = items.slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE);

  const siguiente = () => setPagina(p => Math.min(p + 1, totalPaginas));
  const anterior = () => setPagina(p => Math.max(p - 1, 1));

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Market (ítems desde Albion2D)</h1>

      {cargando ? (
        <div className="flex justify-center items-center h-48">
          <img src="/albion-loader.gif" alt="Cargando..." className="w-20 h-20" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {mostrarItems.map((item, idx) => (
              <div key={idx} className="bg-gray-800 p-2 rounded-xl shadow-md flex flex-col items-center">
                <img src={item.icono} alt={item.nombre} className="w-12 h-12 mb-2" />
                <p className="text-sm text-center">{item.nombre}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={anterior}
              disabled={pagina === 1}
              className="bg-gray-600 px-4 py-1 rounded hover:bg-gray-500 disabled:opacity-30"
            >
              ← Anterior
            </button>
            <span className="text-sm mt-1">Página {pagina} de {totalPaginas}</span>
            <button
              onClick={siguiente}
              disabled={pagina === totalPaginas}
              className="bg-gray-600 px-4 py-1 rounded hover:bg-gray-500 disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
