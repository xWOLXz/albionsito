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

  // Filtrar ítems según searchTerm para mostrar en lista (en realidad SearchBar ya filtra)
  // Aquí solo queremos obtener el ítem seleccionado para fetch
  const selectedItem = items.find(item =>
    item.id === searchTerm || item.UniqueName === searchTerm
  );

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
      `https://albionsito-backend2.onrender.com/api/combined-prices?itemId=${encodeURIComponent(
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

  // Cuando cambia el ítem seleccionado o calidad, refetch precios
  useEffect(() => {
    if (searchTerm) {
      fetchPrices(searchTerm, quality);
    } else {
      setPrices(null);
    }
  }, [searchTerm, quality]);

  return (
    <div className="container" style={{ maxWidth: 900, margin: 'auto', padding: 16, color: '#eee', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Market - Precios Combinados</h1>

      <SearchBar
        items={items}
        onSearch={setSearchTerm}
        placeholder="Buscar ítem..."
      />

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <label>
          Calidad:
          <select
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            style={{
              marginLeft: 8,
              padding: '4px 10px',
              borderRadius: 6,
              background: '#111',
              color: '#fff',
              border: '1px solid #444',
              cursor: 'pointer',
            }}
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
      {error && <div style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</div>}

      {!loading && !error && prices && (
        <>
          <h2 style={{ marginTop: 20, textAlign: 'center' }}>
            Precios para: {selectedItem
              ? selectedItem.nombre || selectedItem.LocalizedNames?.['ES-ES'] || selectedItem.id
              : searchTerm}
          </h2>

          {Object.entries(prices).map(([city, data]) => (
            <div
              key={city}
              className="card"
              style={{
                marginTop: 10,
                backgroundColor: '#222',
                padding: 12,
                borderRadius: 8,
                color: '#ddd',
              }}
            >
              <h3>{city}</h3>
              <div>
                <strong>Última actualización:</strong>{' '}
                {data.actualizado ? new Date(data.actualizado).toLocaleString() : 'Desconocida'}
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                <div>
                  <strong>Venta (órdenes):</strong>
                  <ul>
                    {data.orden_venta?.length ? (
                      data.orden_venta.map(({ precio, fecha, fuentes }, i) => (
                        <li key={i}>
                          {precio.toLocaleString()} <small>plata</small> -{' '}
                          {fecha ? new Date(fecha).toLocaleString() : 'Desconocida'}{' '}
                          <small>{fuentes?.join('')}</small>
                        </li>
                      ))
                    ) : (
                      <li>No hay datos</li>
                    )}
                  </ul>
                </div>
                <div>
                  <strong>Compra (órdenes):</strong>
                  <ul>
                    {data.orden_compra?.length ? (
                      data.orden_compra.map(({ precio, fecha, fuentes }, i) => (
                        <li key={i}>
                          {precio.toLocaleString()} <small>plata</small> -{' '}
                          {fecha ? new Date(fecha).toLocaleString() : 'Desconocida'}{' '}
                          <small>{fuentes?.join('')}</small>
                        </li>
                      ))
                    ) : (
                      <li>No hay datos</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {!loading && !error && !prices && !searchTerm && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          Selecciona un ítem para ver precios
        </div>
      )}
    </div>
  );
}
