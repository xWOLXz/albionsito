// src/pages/Market.jsx
import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

// ---- CONFIG ----
const BACKEND3 = 'https://albionsito-backend3.onrender.com'; // <-- tu backend unificado

const cityColor = {
  "Fort Sterling": "white",
  "Lymhurst": "lightgreen",
  "Bridgewatch": "orange",
  "Martlock": "skyblue",
  "Thetford": "violet",
  "Caerleon": "black",
  "Brecilien": "gray"
};

// Símbolos de fuente (útil para mostrar qué backends contestaron)
const SRC = {
  backend1: '①',
  backend2: '②'
};

// número máximo por ciudad por tipo (usa para mostrar leyenda o mensajes)
const MAX_PER_CITY = 5;

// ---- COMPONENT ----
export default function Market() {
  // datos e UI
  const [items, setItems] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const [quality, setQuality] = useState(1);

  const [loadingPrices, setLoadingPrices] = useState(false);
  const [mergedPrices, setMergedPrices] = useState(null);
  const [rawBackend1, setRawBackend1] = useState(null); // se mantienen por compatibilidad visual (si quisieras mostrar raw)
  const [rawBackend2, setRawBackend2] = useState(null);
  const [lastSources, setLastSources] = useState(null); // { backend1: true/false, backend2: true/false }
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState(null);

  // carga inicial items.json
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        // Permitir IDs con guion bajo o formato normal
        const base = data.filter(it => /^T[4-8]_[A-Z0-9_]+$/.test(it.id || it.UniqueName || it.ID));
        if (!alive) return;
        setItems(base);
      } catch (err) {
        console.error('Error cargando items:', err);
      } finally {
        if (alive) setLoadingItems(false);
      }
    })();

    // ping opcional para calentar backends si quieres
    fetch(`${BACKEND3}/api/init`).catch(() => {});

    return () => { alive = false; };
  }, []);

  // búsqueda (la SearchBar hace debounce)
  const handleSearch = (term) => {
    const q = term?.toLowerCase().trim();
    if (!q) return setResults([]);
    const filtered = items.filter(it =>
      (it.nombre || it.UniqueName || '').toLowerCase().includes(q)
    ).slice(0, 30);
    setResults(filtered);
  };

  // seleccionar ítem desde ItemCard
  const selectItem = (item) => {
    setSelectedItem(item);
    setQuality(1);
    fetchPricesForItem(item, 1);
  };

  // helper: fetch con timeout
  async function fetchWithTimeout(url, opts = {}, ms = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const resp = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(id);
      return resp;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  // ---- fetchPricesForItem usando BACKEND3 ----
  // item puede ser objeto item (recomendado) o string id
  async function fetchPricesForItem(itemOrId, qualityToUse = 1, { force = false } = {}) {
    const itemId = typeof itemOrId === 'string' ? itemOrId : (itemOrId.id || itemOrId.UniqueName || itemOrId.ID);
    if (!itemId) return;

    setLoadingPrices(true);
    setMergedPrices(null);
    setRawBackend1(null);
    setRawBackend2(null);
    setLastSources(null);
    setFromCache(false);
    setError(null);

    try {
      const url = `${BACKEND3}/api/precios-unidos?itemId=${encodeURIComponent(itemId)}&quality=${qualityToUse}${force ? '&force=1' : ''}`;
      const r = await fetchWithTimeout(url, {}, 9000);

      if (!r.ok) {
        // intentar parsear mensaje de error si viene
        let errText = `Error desde backend3: ${r.status} ${r.statusText}`;
        try {
          const errJson = await r.json();
          if (errJson?.error) errText += ` - ${errJson.error}`;
        } catch (_) {}
        throw new Error(errText);
      }

      const full = await r.json();

      // backend3 está pensado para devolver: { itemId, quality, fromCache, precios, sources }
      const precios = full.precios || full.precio || full.precios_unidos || null;

      if (!precios) {
        // si por alguna razón devuelven dos backends raw (inusual), puedes normalizar aquí
        throw new Error('La respuesta del backend no contiene `precios` (objeto mergeado).');
      }

      // Guardar info útil para UI
      setMergedPrices(precios);
      setFromCache(Boolean(full.fromCache));
      setLastSources(full.sources || null);

      // Si el backend3 incluye raw payloads por compatibilidad (no recomendado),
      // aquí los dejamos en estado para depuración. Por defecto backend3 no envía raw.
      if (full.rawBackend1) setRawBackend1(full.rawBackend1);
      if (full.rawBackend2) setRawBackend2(full.rawBackend2);

    } catch (err) {
      console.error('Error fetching prices (backend3):', err);
      setError(err.message || String(err));
    } finally {
      setLoadingPrices(false);
    }
  }

  // --- (Opcional) antiguas funciones de normalización / merge en frontend ---
  // Las dejo por si quieres debuggear o volver a procesar datos localmente.
  // NOTA: Con backend3 estas funciones NO son necesarias porque ya devuelve el objeto mergeado.
  /*
  function normalizeBackend1(resp) { ... }
  function normalizeBackend2(resp) { ... }
  function mergeNormalized(n1, n2) { ... }
  */

  // Helpers de fecha
  function formatDateIso(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  }
  function timeAgo(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'justo ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  // ---- RENDER ----
  return (
    <div className="container">
      <h1>🛒 Market</h1>

      <div className="card" style={{ marginTop: 10 }}>
        <SearchBar onSearch={handleSearch} placeholder="Escribe para buscar ítems (ej: Túnica, Bolsa...)" />
      </div>

      <div style={{ marginTop: 12 }}>
        {loadingItems ? (
          <Loader />
        ) : (
          <>
            {results.length === 0 && <div className="small">Escribe 3 segundos y verás resultados.</div>}
            {results.length > 0 && (
              <div className="grid" style={{ marginTop: 10 }}>
                {results.map(it => (
                  <ItemCard key={it.id || it.UniqueName || it.ID} item={it} onSelect={selectItem} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedItem && (
        <div style={{ marginTop: 20 }} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img
                src={selectedItem.imagen || `https://render.albiononline.com/v1/item/${selectedItem.id || selectedItem.UniqueName}.png`}
                width={52}
                height={52}
                alt="icon"
              />
              <div>
                <div style={{ fontWeight: 700 }}>
                  {selectedItem.nombre || selectedItem.id || selectedItem.UniqueName}
                </div>
                <div className="small">{selectedItem.id || selectedItem.UniqueName}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div>
                <label className="small">Encantamiento: </label>
                <select value={quality} onChange={(e) => {
                  const q = Number(e.target.value);
                  setQuality(q);
                  if (selectedItem) fetchPricesForItem(selectedItem, q);
                }}>
                  <option value={1}>Base</option>
                  <option value={2}>+1</option>
                  <option value={3}>+2</option>
                  <option value={4}>+3</option>
                  <option value={5}>+4</option>
                </select>
              </div>

              <div>
                <button
                  onClick={() => fetchPricesForItem(selectedItem, quality)}
                  className="btn"
                  style={{ padding: '6px 10px', borderRadius: 6 }}
                >
                  🔄 Actualizar
                </button>

                <button
                  onClick={() => fetchPricesForItem(selectedItem, quality, { force: true })}
                  title="Forzar refresh (ignora cache)"
                  className="btn"
                  style={{ marginLeft: 8, padding: '6px 8px', borderRadius: 6 }}
                >
                  ♻ Forzar
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {loadingPrices && <Loader />}
            {!loadingPrices && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>💹 Movimientos por ciudad</h3>
                  <div className="small">
                    {fromCache ? <span>Cache ✅</span> : <span>Directo ✅</span>} &nbsp;&nbsp;
                    <span>① backend1 &nbsp;&nbsp; ② backend2</span>
                  </div>
                </div>

                {error && <div style={{ color: 'crimson', marginTop: 8 }}>Error: {error}</div>}
                {!mergedPrices && !error && <div className="small">Selecciona un ítem para ver precios.</div>}

                {mergedPrices && (
                  <div style={{ marginTop: 8 }}>
                    {Object.entries(mergedPrices).length === 0 && <div className="small">No hay movimientos registrados.</div>}
                    {Object.entries(mergedPrices).map(([city, obj]) => (
                      <div key={city} style={{ padding: 8, marginBottom: 8, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: cityColor[city] || '#ddd' }}>{city}</strong>
                          <span className="small">{obj.actualizado ? `${formatDateIso(obj.actualizado)} (${timeAgo(obj.actualizado)})` : ''}</span>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                          <div style={{ flex: 1 }}>
                            <div className="small">Orden venta (últimos {MAX_PER_CITY})</div>
                            {(!obj.orden_venta || obj.orden_venta.length === 0) && <div className="small">—</div>}
                            {obj.orden_venta && obj.orden_venta.map((o, idx) => (
                              <div key={idx} className="result-row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ width: 8 }}>•</span>
                                <div style={{ flex: 1 }}>{(o.precio || 0).toLocaleString()}</div>
                                <div className="small" style={{ minWidth: 170, textAlign: 'right' }}>
                                  {formatDateIso(o.fecha)} <span style={{ marginLeft: 8 }}>({timeAgo(o.fecha)})</span>
                                </div>
                                <div style={{ marginLeft: 8 }}>{(o.fuentes || []).join(' ')}</div>
                              </div>
                            ))}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div className="small">Orden compra (últimos {MAX_PER_CITY})</div>
                            {(!obj.orden_compra || obj.orden_compra.length === 0) && <div className="small">—</div>}
                            {obj.orden_compra && obj.orden_compra.map((o, idx) => (
                              <div key={idx} className="result-row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ width: 8 }}>•</span>
                                <div style={{ flex: 1 }}>{(o.precio || 0).toLocaleString()}</div>
                                <div className="small" style={{ minWidth: 170, textAlign: 'right' }}>
                                  {formatDateIso(o.fecha)} <span style={{ marginLeft: 8 }}>({timeAgo(o.fecha)})</span>
                                </div>
                                <div style={{ marginLeft: 8 }}>{(o.fuentes || []).join(' ')}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Depuración opcional: mostrar rawBackend1/rawBackend2 si existen */}
                {(rawBackend1 || rawBackend2) && (
                  <div style={{ marginTop: 12 }}>
                    <div className="small">Raw backends (debug)</div>
                    {rawBackend1 && <pre style={{ maxHeight: 120, overflow: 'auto' }}>{JSON.stringify(rawBackend1, null, 2)}</pre>}
                    {rawBackend2 && <pre style={{ maxHeight: 120, overflow: 'auto' }}>{JSON.stringify(rawBackend2, null, 2)}</pre>}
                  </div>
                )}

                {/* mostrar info de fuentes si está */}
                {lastSources && (
                  <div style={{ marginTop: 8 }}>
                    <div className="small">Fuentes:</div>
                    <div className="small">
                      Backend1: {lastSources.backend1 ? '✅' : '❌'} &nbsp;&nbsp;
                      Backend2: {lastSources.backend2 ? '✅' : '❌'}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
