import React, { useContext, useEffect, useState } from 'react';
import { AlbionContext } from '../context/AlbionContext';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';

export default function Market() {
  const {
    items,
    quality,
    setQuality,
    searchTerm,
    setSearchTerm,
  } = useContext(AlbionContext);

  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar ítems que coincidan (nombre o id)
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const name = item.nombre?.toLowerCase() || item.LocalizedNames?.['ES-ES']?.toLowerCase() || '';
    return (
      name.includes(searchTerm.toLowerCase()) ||
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.UniqueName && item.UniqueName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Llamar backend2 para obtener precios combinados
  async function fetchPrices(itemId, qualityParam = 1) {
    if (!itemId) {
      setPrices(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://albionsito-backend2.onrender.com/api/prices?itemId=${encodeURIComponent(
          itemId
        )}&quality=${qualityParam}`
      );
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const data = await res.json();
      setPrices(data.precios || null);
    } catch (e) {
      setError(e.message || 'Error al obtener precios');
      setPrices(null);
    } finally {
      setLoading(false);
    }
  }

  // Cuando cambia el ítem buscado o calidad, refetch
  useEffect(() => {
    if (filteredItems.length === 1) {
      const item = filteredItems[0];
      fetchPrices(item.id || item.UniqueName, quality);
    } else {
      setPrices(null);
    }
  }, [filteredItems, quality]);

  return (
    <div className="container">
      <h1>Market - Precios Combinados</h1>
      <SearchBar onSearch={setSearchTerm} placeholder="Buscar ítem..." />

      <div style={{ marginTop: 12 }}>
        <label>
          Calidad:
          <select
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            style={{ marginLeft: 8, padding: 4, borderRadius: 6, background: '#111', color: '#fff' }}
          >
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <Loader />}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

      {!loading && !error && prices && (
        <>
          <h2 style={{ marginTop: 20 }}>
            Precios para{' '}
            {filteredItems.length === 1
              ? filteredItems[0].nombre || filteredItems[0].LocalizedNames?.['ES-ES'] || filteredItems[0].id
              : 'Ítem no encontrado'}
          </h2>

          {Object.entries(prices).map(([city, data]) => (
            <div key={city} className="card" style={{ marginTop: 10 }}>
              <h3>{city}</h3>
              <div>
                <strong>Última actualización:</strong>{' '}
                {data.actualizado ? new Date(data.actualizado).toLocaleString() : 'Desconocida'}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <div>
                  <strong>Venta (ordenes):</strong>
                  <ul>
                    {data.orden_venta?.map(({ precio, fecha, fuentes }, i) => (
                      <li key={i}>
                        {precio.toLocaleString()} <small>plata</small> -{' '}
                        {fecha ? new Date(fecha).toLocaleString() : 'Desconocida'} {' '}
                        <small>{fuentes?.join('')}</small>
                      </li>
                    ))}
                    {!data.orden_venta?.length && <li>No hay datos</li>}
                  </ul>
                </div>
                <div>
                  <strong>Compra (ordenes):</strong>
                  <ul>
                    {data.orden_compra?.map(({ precio, fecha, fuentes }, i) => (
                      <li key={i}>
                        {precio.toLocaleString()} <small>plata</small> -{' '}
                        {fecha ? new Date(fecha).toLocaleString() : 'Desconocida'} {' '}
                        <small>{fuentes?.join('')}</small>
                      </li>
                    ))}
                    {!data.orden_compra?.length && <li>No hay datos</li>}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {!loading && !error && !prices && filteredItems.length !== 1 && (
        <div style={{ marginTop: 20 }}>
          {filteredItems.length === 0
            ? 'No hay ítems que coincidan con la búsqueda'
            : 'Selecciona un ítem para ver precios'}
        </div>
      )}
    </div>
  );
}
