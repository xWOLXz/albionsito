// src/pages/Market.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AlbionContext } from '../context/AlbionContext';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';

const BACKEND2_API = 'https://albionsito-backend2.onrender.com/api/prices';

export default function Market() {
  const { items, quality, setQuality, searchTerm, setSearchTerm } = useContext(AlbionContext);
  const [loading, setLoading] = useState(false);
  const [pricesData, setPricesData] = useState(null);
  const [error, setError] = useState(null);

  // Buscar ítem exacto por id o nombre
  const findItemBySearch = (term) => {
    if (!term || term.length < 1) return null;
    const termLc = term.toLowerCase();
    return (
      items.find(
        (it) =>
          it.id.toLowerCase() === termLc ||
          it.UniqueName.toLowerCase() === termLc ||
          (it.LocalizedNames?.['ES-ES']?.toLowerCase() === termLc) ||
          (it.nombre?.toLowerCase() === termLc)
      ) || null
    );
  };

  // Obtenemos el item seleccionado para pedir su precio
  const selectedItem = findItemBySearch(searchTerm);

  // Fetch precios backend2 para el item y calidad
  useEffect(() => {
    if (!selectedItem) {
      setPricesData(null);
      setError(null);
      return;
    }

    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${BACKEND2_API}?itemId=${encodeURIComponent(selectedItem.UniqueName || selectedItem.id)}&quality=${quality}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setPricesData(json.precios || null);
      } catch (err) {
        setError(err.message || 'Error al obtener precios');
        setPricesData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [selectedItem, quality]);

  // Formatea fecha ISO a string legible local
  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('es-ES', {
        hour12: false,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="container">
      <h1 className="mb-4 text-center text-2xl font-bold">Albionsito - Mercado</h1>

      <SearchBar onSearch={setSearchTerm} placeholder="Buscar ítem por ID o nombre exacto..." />

      <div className="my-3 flex justify-center gap-2 items-center">
        <label htmlFor="quality" className="font-semibold">
          Calidad (encantamiento):
        </label>
        <select
          id="quality"
          className="input w-20"
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
        >
          {[1, 2, 3, 4].map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>

      {loading && <Loader />}

      {error && (
        <div className="card text-red-400 my-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && !pricesData && searchTerm && (
        <div className="card my-4">No se encontraron precios para este ítem o calidad.</div>
      )}

      {!loading && pricesData && (
        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="border border-zinc-700 p-2 text-left">Ciudad</th>
                <th className="border border-zinc-700 p-2 text-right">Venta mínima</th>
                <th className="border border-zinc-700 p-2 text-left">🅰🅱 Fuente</th>
                <th className="border border-zinc-700 p-2 text-right">Compra máxima</th>
                <th className="border border-zinc-700 p-2 text-left">🅰🅱 Fuente</th>
                <th className="border border-zinc-700 p-2 text-center">Últ. actualización</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(pricesData).map(([city, data]) => {
                // Venta mínima: precio más bajo en orden_venta
                const ventaMin = data.orden_venta.length
                  ? data.orden_venta.reduce((min, o) => (o.precio < min.precio ? o : min), data.orden_venta[0])
                  : null;

                // Compra máxima: precio más alto en orden_compra
                const compraMax = data.orden_compra.length
                  ? data.orden_compra.reduce((max, o) => (o.precio > max.precio ? o : max), data.orden_compra[0])
                  : null;

                return (
                  <tr key={city} className="even:bg-zinc-900">
                    <td className="border border-zinc-700 p-2">{city}</td>

                    <td className="border border-zinc-700 p-2 text-right">
                      {ventaMin ? ventaMin.precio.toLocaleString('es-ES') : '-'}
                    </td>
                    <td className="border border-zinc-700 p-2 text-left">
                      {ventaMin ? ventaMin.fuentes.join('') : '-'}
                    </td>

                    <td className="border border-zinc-700 p-2 text-right">
                      {compraMax ? compraMax.precio.toLocaleString('es-ES') : '-'}
                    </td>
                    <td className="border border-zinc-700 p-2 text-left">
                      {compraMax ? compraMax.fuentes.join('') : '-'}
                    </td>

                    <td className="border border-zinc-700 p-2 text-center">
                      {formatDate(data.actualizado)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
                  }
