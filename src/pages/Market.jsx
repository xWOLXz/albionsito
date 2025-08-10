import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

const BACKEND1 = 'https://albionsito-backend.onrender.com';
const BACKEND2 = 'https://albionsito-backend2.onrender.com';

const cityColor = {
  'Fort Sterling': 'white',
  Lymhurst: 'lightgreen',
  Bridgewatch: 'orange',
  Martlock: 'skyblue',
  Thetford: 'violet',
  Caerleon: 'black',
  Brecilien: 'gray'
};

const SRC = { backend1: '①', backend2: '②' };
const MAX_PER_CITY = 5;

export default function Market() {
  const [items, setItems] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quality, setQuality] = useState(1);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [mergedPrices, setMergedPrices] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        const base = data.filter((it) => /^T[4-8]_[A-Z0-9_]+$/.test(it.id || it.UniqueName || it.ID));
        setItems(base);
      } catch (err) {
        console.error('Error cargando items:', err);
      } finally {
        setLoadingItems(false);
      }
    })();

    // ping backends silently
    fetch(`${BACKEND1}/api/init`).catch(() => {});
    fetch(`${BACKEND2}/api/init`).catch(() => {});
  }, []);

  const handleSearch = (term) => {
    const q = term?.toLowerCase().trim();
    if (!q) return setResults([]);
    const filtered = items
      .filter((it) => (it.nombre || it.UniqueName || it.name || '').toLowerCase().includes(q))
      .slice(0, 30);
    setResults(filtered);
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    setQuality(1);
    fetchPricesForItem(item, 1);
  };

  async function fetchPricesForItem(item, qualityToUse = 1) {
    const itemId = item.id || item.UniqueName || item.ID;
    setLoadingPrices(true);
    setMergedPrices(null);

    try {
      const [p1, p2] = await Promise.allSettled([
        fetch(`${BACKEND1}/api/prices?itemId=${encodeURIComponent(itemId)}&quality=${qualityToUse}`),
        fetch(`${BACKEND2}/api/prices?itemId=${encodeURIComponent(itemId)}&quality=${qualityToUse}`)
      ]);

      let json1 = null;
      let json2 = null;

      if (p1.status === 'fulfilled') {
        try { json1 = await p1.value.json(); } catch (e) { json1 = null; console.warn('backend1 parse error', e); }
      } else console.warn('backend1 error', p1.reason);

      if (p2.status === 'fulfilled') {
        try { json2 = await p2.value.json(); } catch (e) { json2 = null; console.warn('backend2 parse error', e); }
      } else console.warn('backend2 error', p2.reason);

      // normalize and merge
      const norm1 = normalizeBackend1(json1);
      const norm2 = normalizeBackend2(json2);
      const merged = mergeNormalized(norm1, norm2);
      setMergedPrices(merged);
    } catch (err) {
      console.error('Error fetching prices:', err);
    } finally {
      setLoadingPrices(false);
    }
  }

  // Normalizers + merge (idénticos a lo que acordamos)
  function normalizeBackend1(resp) {
    const out = {};
    if (!resp) return out;
    const payload = resp.prices || resp;
    if (!payload || typeof payload !== 'object') return out;
    for (const [city, info] of Object.entries(payload)) {
      if (!city) continue;
      const sellArray = info.sell || info.orden_venta || [];
      const buyArray = info.buy || info.orden_compra || [];
      out[city] = { sell: [], buy: [], actualizado: info.updated || info.actualizado || null };
      for (const s of sellArray) {
        const precio = (s.price ?? s.precio ?? s.sell_price_min ?? s.sell_price) || 0;
        const fecha = s.date ?? s.fecha ?? s.sell_price_min_date ?? new Date().toISOString();
        out[city].sell.push({ precio: Number(precio), fecha, fuentes: [SRC.backend1] });
      }
      for (const b of buyArray) {
        const precio = (b.price ?? b.precio ?? b.buy_price_max ?? b.buy_price) || 0;
        const fecha = b.date ?? b.fecha ?? b.buy_price_max_date ?? new Date().toISOString();
        out[city].buy.push({ precio: Number(precio), fecha, fuentes: [SRC.backend1] });
      }
    }
    return out;
  }

  function normalizeBackend2(resp) {
    const out = {};
    if (!resp) return out;
    const payload = resp.precios || resp.prices || resp;
    if (!payload || typeof payload !== 'object') return out;
    for (const [city, info] of Object.entries(payload)) {
      if (!city) continue;
      const sellArray = info.orden_venta || info.sell || [];
      const buyArray = info.orden_compra || info.buy || [];
      out[city] = { sell: [], buy: [], actualizado: info.actualizado || info.updated || null };
      for (const s of sellArray) {
        const precio = (s.precio ?? s.price ?? s.sell_price_min ?? s) || 0;
        const fecha = s.fecha ?? s.date ?? s.sell_price_min_date ?? new Date().toISOString();
        out[city].sell.push({ precio: Number(precio), fecha, fuentes: [SRC.backend2] });
      }
      for (const b of buyArray) {
        const precio = (b.precio ?? b.price ?? b.buy_price_max ?? b) || 0;
        const fecha = b.fecha ?? b.date ?? b.buy_price_max_date ?? new Date().toISOString();
        out[city].buy.push({ precio: Number(precio), fecha, fuentes: [SRC.backend2] });
      }
    }
    return out;
  }

  function mergeNormalized(n1, n2) {
    const cities = new Set([...Object.keys(n1 || {}), ...Object.keys(n2 || {})]);
    const result = {};
    for (const city of cities) {
      const listSell = [];
      const listBuy = [];
      const addToList = (targetList, entry) => {
        const key = `${entry.precio}||${new Date(entry.fecha).toISOString()}`;
        const existing = targetList.find((x) => x._key === key);
        if (existing) {
          for (const f of entry.fuentes) if (!existing.fuentes.includes(f)) existing.fuentes.push(f);
        } else targetList.push({ ...entry, _key: key });
      };
      const srcSell1 = (n1[city]?.sell) || [];
      const srcSell2 = (n2[city]?.sell) || [];
      const srcBuy1 = (n1[city]?.buy) || [];
      const srcBuy2 = (n2[city]?.buy) || [];
      srcSell1.forEach((s) => addToList(listSell, s));
      srcSell2.forEach((s) => addToList(listSell, s));
      srcBuy1.forEach((b) => addToList(listBuy, b));
      srcBuy2.forEach((b) => addToList(listBuy, b));
      listSell.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      listBuy.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      const sellFinal = listSell.slice(0, MAX_PER_CITY).map(({ _key, ...rest }) => rest);
      const buyFinal = listBuy.slice(0, MAX_PER_CITY).map(({ _key, ...rest }) => rest);
      const candDates = [n1[city]?.actualizado, n2[city]?.actualizado, ...sellFinal.map((x) => x.fecha), ...buyFinal.map((x) => x.fecha)].filter(Boolean).map((d) => new Date(d));
      const updated = candDates.length ? new Date(Math.max(...candDates.map((d) => d.getTime()))) : null;
      result[city] = { orden_venta: sellFinal, orden_compra: buyFinal, actualizado: updated ? updated.toISOString() : null };
    }
    const ordered = {};
    Object.keys(result).sort().forEach((k) => (ordered[k] = result[k]));
    return ordered;
  }

  function formatDateIso(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(); } catch (e) { return iso; }
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

  return (
    <div className="container">
      <h1>🛒 Market</h1>

      <div className="card" style={{ marginTop: 10 }}>
        <SearchBar onSearch={handleSearch} placeholder="Escribe para buscar ítems (ej: Túnica, Bolsa...)" />
      </div>

      <div style={{ marginTop: 12 }}>
        {loadingItems ? <Loader /> : (
          <>
            {results.length === 0 && <div className="small">Escribe 3 segundos y verás resultados.</div>}
            {results.length > 0 && (
              <div className="grid" style={{ marginTop: 10 }}>
                {results.map((it) => (
                  <ItemCard key={it.id || it.UniqueName} item={it} onSelect={selectItem} />
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
              <img src={selectedItem.imagen || `https://render.albiononline.com/v1/item/${selectedItem.id || selectedItem.UniqueName}.png`} width={52} height={52} />
              <div>
                <div style={{ fontWeight: 700 }}>{selectedItem.nombre || selectedItem.id || selectedItem.UniqueName}</div>
                <div className="small">{selectedItem.id || selectedItem.UniqueName}</div>
              </div>
            </div>

            <div>
              <label className="small">Encantamiento: </label>
              <select value={quality} onChange={(e) => { const q = Number(e.target.value); setQuality(q); if (selectedItem) fetchPricesForItem(selectedItem, q); }}>
                <option value={1}>Base</option>
                <option value={2}>+1</option>
                <option value={3}>+2</option>
                <option value={4}>+3</option>
                <option value={5}>+4</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {loadingPrices && <Loader />}
            {!loadingPrices && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>💹 Movimientos por ciudad</h3>
                  <div className="small">① backend1 &nbsp;&nbsp; ② backend2</div>
                </div>

                {!mergedPrices && <div className="small">Selecciona un ítem para ver precios.</div>}

                {mergedPrices && (
                  <div style={{ marginTop: 8 }}>
                    {Object.entries(mergedPrices).map(([city, obj]) => (
                      <div key={city} style={{ padding: 8, marginBottom: 8, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: cityColor[city] || '#ddd' }}>{city}</strong>
                          <span className="small">{obj.actualizado ? `${formatDateIso(obj.actualizado)} (${timeAgo(obj.actualizado)})` : ''}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                          <div style={{ flex: 1 }}>
                            <div className="small">Orden venta (últimos {MAX_PER_CITY})</div>
                            {obj.orden_venta.length === 0 && <div className="small">—</div>}
                            {obj.orden_venta.map((o, idx) => (
                              <div key={idx} className="result-row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ width: 8 }}>•</span>
                                <div style={{ flex: 1 }}>{(o.precio || 0).toLocaleString()}</div>
                                <div className="small" style={{ minWidth: 170, textAlign: 'right' }}>{formatDateIso(o.fecha)} <span style={{ marginLeft: 8 }}>({timeAgo(o.fecha)})</span></div>
                                <div style={{ marginLeft: 8 }}>{(o.fuentes || []).join(' ')}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="small">Orden compra (últimos {MAX_PER_CITY})</div>
                            {obj.orden_compra.length === 0 && <div className="small">—</div>}
                            {obj.orden_compra.map((o, idx) => (
                              <div key={idx} className="result-row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ width: 8 }}>•</span>
                                <div style={{ flex: 1 }}>{(o.precio || 0).toLocaleString()}</div>
                                <div className="small" style={{ minWidth: 170, textAlign: 'right' }}>{formatDateIso(o.fecha)} <span style={{ marginLeft: 8 }}>({timeAgo(o.fecha)})</span></div>
                                <div style={{ marginLeft: 8 }}>{(o.fuentes || []).join(' ')}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
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

---

# Backend2 — archivos (ES modules, listos para Render)

> **Notas**: backend2 ahora usa sintaxis ESM (`import`) para evitar el error de Render. Asegúrate de que `package.json` de backend2 tenga: `"type": "module"`.

## albionsito-backend2/utils/logger.js
```js
export function info(msg) { console.log(`[INFO] ${new Date().toISOString()} - ${msg}`); }
export function error(msg) { console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`); }
export default { info, error };
