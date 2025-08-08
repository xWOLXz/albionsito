import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

const BACKEND1 = 'https://albionsito-backend.onrender.com';
const BACKEND2 = 'https://albionsito-backend2.onrender.com';

const cityColor = {
  "Fort Sterling": "white",
  "Lymhurst": "lightgreen",
  "Bridgewatch": "orange",
  "Martlock": "skyblue",
  "Thetford": "violet",
  "Caerleon": "black",
  "Brecilien": "gray"
};

export default function Market() {
  const [items, setItems] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quality, setQuality] = useState(1);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [pricesFromBackend1, setPricesFromBackend1] = useState(null);
  const [pricesFromBackend2, setPricesFromBackend2] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        const base = data.filter(it => /^T[4-8]_[A-Z0-9_]+$/.test(it.id || it.UniqueName || it.ID));
        setItems(base);
      } catch (err) {
        console.error('Error cargando items:', err);
      } finally {
        setLoadingItems(false);
      }
    })();

    fetch(`${BACKEND1}/api/init`).catch(() => {});
    fetch(`${BACKEND2}/api/init`).catch(() => {});
  }, []);

  const handleSearch = (term) => {
    const q = term?.toLowerCase().trim();
    if (!q) return setResults([]);

    const filtered = items.filter(it =>
      (it.nombre || it.UniqueName || '').toLowerCase().includes(q)
    ).slice(0, 30);
    setResults(filtered);
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    setQuality(1);
    fetchPricesForItem(item, 1);
  };

  const fetchPricesForItem = async (item, qualityToUse = 1) => {
    const itemId = item.id || item.UniqueName || item.ID;
    setLoadingPrices(true);
    setPricesFromBackend1(null);
    setPricesFromBackend2(null);

    try {
      const res1 = await fetch(`${BACKEND1}/api/prices?itemId=${encodeURIComponent(itemId)}&quality=${qualityToUse}`);
      setPricesFromBackend1(await res1.json());
    } catch (err) {
      setPricesFromBackend1({ error: String(err) });
    }

    try {
      const res2 = await fetch(`${BACKEND2}/api/prices?itemId=${encodeURIComponent(itemId)}&quality=${qualityToUse}`);
      const json2 = await res2.json();
      setPricesFromBackend2(json2);
    } catch (err) {
      setPricesFromBackend2({ error: String(err) });
    } finally {
      setLoadingPrices(false);
    }
  };

  const changeQuality = (q) => {
    setQuality(q);
    if (selectedItem) fetchPricesForItem(selectedItem, q);
  };

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
              <img
                src={selectedItem.imagen || `https://render.albiononline.com/v1/item/${selectedItem.id || selectedItem.UniqueName}.png`}
                width={52}
                height={52}
              />
              <div>
                <div style={{ fontWeight: 700 }}>
                  {selectedItem.nombre || selectedItem.id || selectedItem.UniqueName}
                </div>
                <div className="small">{selectedItem.id || selectedItem.UniqueName}</div>
              </div>
            </div>

            <div>
              <label className="small">Encantamiento: </label>
              <select value={quality} onChange={(e) => changeQuality(Number(e.target.value))}>
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
                <h3>💹 Comparativa por ciudad</h3>
                <PricesBlock backend1={pricesFromBackend1} backend2={pricesFromBackend2} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PricesBlock({ data, source }) {
  if (!data) return null;
  if (data.error) return <div className="small">Error: {String(data.error)}</div>;

  const precios = data.precios || data.prices || data;
  if (!precios || Object.keys(precios).length === 0) {
    return <div className="small">No hay registros recientes</div>;
  }

  return (
    <div style={{ marginTop: 8 }}>
      {Object.entries(precios).map(([city, obj]) => {
        const color = cityColor[city] || '#ddd';
        const shade =
          source === 'backend1'
            ? 'rgba(107,11,107,0.08)'
            : 'rgba(255,143,194,0.08)';

        // Asegurar ordenamiento
        const ordenVenta = [...(obj.orden_venta || obj.sell || [])]
          .sort((a, b) => (a.precio || a.price) - (b.precio || b.price))
          .slice(0, 7);

        const ordenCompra = [...(obj.orden_compra || obj.buy || [])]
          .sort((a, b) => (b.precio || b.price) - (a.precio || a.price))
          .slice(0, 7);

        return (
          <div
            key={city}
            style={{
              padding: 8,
              marginBottom: 8,
              borderRadius: 8,
              background: shade,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <strong style={{ color }}>{city}</strong>
              <span className="small">
                {obj.actualizado || obj.updated || ''}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              {/* Columna de orden venta */}
              <div style={{ flex: 1 }}>
                <div className="small">Orden venta</div>
                {ordenVenta.map((o, idx) => (
                  <div key={idx} className="result-row">
                    <span>•</span>
                    <span>
                      {(o.precio || o.price || o).toLocaleString()}
                    </span>
                    <span className="small">{o.fecha || o.date || ''}</span>
                  </div>
                ))}
              </div>

              {/* Columna de orden compra */}
              <div style={{ flex: 1 }}>
                <div className="small">Orden compra</div>
                {ordenCompra.map((o, idx) => (
                  <div key={idx} className="result-row">
                    <span>•</span>
                    <span>
                      {(o.precio || o.price || o).toLocaleString()}
                    </span>
                    <span className="small">{o.fecha || o.date || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
