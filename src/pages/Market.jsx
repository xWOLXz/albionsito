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
    selectedItem,
    setSelectedItem,
  } = useContext(AlbionContext);

  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtrar ítems para el buscador
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const name =
      item.nombre?.toLowerCase() ||
      item.LocalizedNames?.['ES-ES']?.toLowerCase() ||
      '';
    return (
      name.includes(searchTerm.toLowerCase()) ||
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.UniqueName && item.UniqueName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Cuando cambia búsqueda, actualizar selección a null para forzar seleccionar uno
  useEffect(() => {
    setSelectedItem(null);
  }, [searchTerm]);

  // Cuando cambia ítem seleccionado o calidad, hacer fetch de precios
  useEffect(() => {
    async function fetchPrices() {
      if (!selectedItem) {
        setPrices(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const itemId = selectedItem.id || selectedItem.UniqueName;
        const res = await fetch(
          `https://albionsito-backend2.onrender.com/api/combined-prices?itemId=${encodeURIComponent(
            itemId
          )}&quality=${quality}`
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
    fetchPrices();
  }, [selectedItem, quality]);

  return (
    <div className="container" style={{ maxWidth: 900, margin: 'auto', padding: 12 }}>
      <h1>Market - Precios Combinados</h1>

      <SearchBar
        onSearch={setSearchTerm}
        placeholder="Buscar ítem por nombre o ID..."
        items={filteredItems}
        onSelect={setSelectedItem}
        selected={selectedItem}
      />

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

      {!loading && !error && prices && selectedItem && (
        <>
          <h2 style={{ marginTop: 20 }}>
            Precios para: {selectedItem.nombre || selectedItem.LocalizedNames?.['ES-ES'] || selectedItem.id}
          </h2>

          {Object.entries(prices).map(([city, data]) => (
            <div key={city} className="card" style={{ marginTop: 10, padding: 10, background: '#222', borderRadius: 8 }}>
              <h3>{city}</h3>
              <div>
                <strong>Última actualización:</strong>{' '}
                {data.actualizado ? new Date(data.actualizado).toLocaleString() : 'Desconocida'}
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 6, flexWrap: 'wrap' }}>
                <div>
                  <strong>Venta (órdenes):</strong>
                  <ul style={{ maxWidth: 220, marginTop: 6 }}>
                    {data.orden_venta?.length ? (
                      data.orden_venta.map(({ precio, fecha, fuentes }, i) => (
                        <li key={i}>
                          {precio.toLocaleString()} <small>plata</small> -{' '}
                          {fecha ? new Date(fecha).toLocaleString() : 'Desconocida'}{' '}
                          <small>{fuentes?.join(' ')}</small>
                        </li>
                      ))
                    ) : (
                      <li>No hay datos</li>
                    )}
                  </ul>
                </div>
                <div>
                  <strong>Compra (órdenes):</strong>
                  <ul style={{ maxWidth: 220, marginTop: 6 }}>
                    {data.orden_compra?.length ? (
                      data.orden_compra.map(({ precio, fecha, fuentes }, i) => (
                        <li key={i}>
                          {precio.toLocaleString()} <small>plata</small> -{' '}
                          {fecha ? new Date(fecha).toLocaleString() : 'Desconocida'}{' '}
                          <small>{fuentes?.join(' ')}</small>
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

      {!loading && !error && !prices && (
        <div style={{ marginTop: 20 }}>
          {filteredItems.length === 0
            ? 'No hay ítems que coincidan con la búsqueda'
            : 'Selecciona un ítem para ver precios'}
        </div>
      )}
    </div>
  );
}
