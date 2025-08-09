import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

// Ajusta a tus dominios de Render/Render/Vercel
const BACKEND1 = 'https://albionsito-backend.onrender.com';   // usa Albion Data Project
const BACKEND2 = 'https://albionsito-backend2.onrender.com';  // usa API alternativa (albion2d o similar)

const CITIES = ["Caerleon","Bridgewatch","Lymhurst","Martlock","Thetford","Fort Sterling","Brecilien"];

const cityColor = {
  "Fort Sterling":"white",
  "Lymhurst":"lightgreen",
  "Bridgewatch":"orange",
  "Martlock":"skyblue",
  "Thetford":"violet",
  "Caerleon":"black",
  "Brecilien":"gray"
};

export default function Market() {
  const [items, setItems] = useState([]); // items loaded from public/items.json
  const [results, setResults] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const [quality, setQuality] = useState(1); // tier base
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [pricesFromBackend1, setPricesFromBackend1] = useState(null);
  const [pricesFromBackend2, setPricesFromBackend2] = useState(null);

  // 1) Cargar local items.json al iniciar (para búsqueda fluida)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/items.json');
        const data = await res.json();
        console.log('[Frontend] items.json cargado:', data.length);
        // Filtrar solo tier base: asumimos ids como "T4_*" etc -> tomar nivel 4-8 base sin suffixes
        const base = data.filter(it => {
          // item puede tener "id" o "UniqueName" o nombre en distinto formato
          const id = it.id || it.UniqueName || it.ID;
          if (!id) return false;
          // Consideramos tier base cuando tiene formato T<number>_...
          return /^T[4-8]_[A-Z0-9_]+$/.test(id);
        });
        setItems(base);
        console.log('[Frontend] items (tier base) almacenados:', base.length);
      } catch (err) {
        console.error('[Frontend] Error cargando items.json', err);
      } finally {
        setLoadingItems(false);
      }
    })();

    // warm backends
    (async () => {
      try {
        console.log('[Frontend] Pidiendo init a backends para precarga/cache');
        await fetch(`${BACKEND1}/api/init`).then(r => r.json()).then(j => console.log('[Frontend] Init backend1 ->', j));
      } catch (e) { console.warn('[Frontend] Init backend1 fallo', e); }
      try {
        await fetch(`${BACKEND2}/api/init`).then(r => r.json()).then(j => console.log('[Frontend] Init backend2 ->', j));
      } catch (e) { console.warn('[Frontend] Init backend2 fallo', e); }
    })();

  }, []);

  // Buscador -> recibe string cuando debounce dispara
  const handleSearch = (term) => {
    if (!term || term.trim().length < 1) {
      setResults([]);
      return;
    }
    console.log('[Frontend] Buscar localmente:', term);
    const q = term.toLowerCase();
    const filtered = items.filter(it => {
      const nombre = (it.nombre || it.LocalizedNames?.['ES-ES'] || it.UniqueName || '').toLowerCase();
      return nombre.includes(q);
    }).slice(0, 30);
    console.log('[Frontend] Resultados encontrados:', filtered.length);
    setResults(filtered);
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    setQuality(1);
    fetchPricesForItem(item, 1);
  };

  // Pedir precios a ambos backends
  const fetchPricesForItem = async (item, qualityToUse = 1) => {
    const itemId = item.id || item.UniqueName || item.ID;
    if (!itemId) return;
    setLoadingPrices(true);
    setPricesFromBackend1(null);
    setPricesFromBackend2(null);

    console.log(`[Frontend] Solicitando precios para ${itemId} quality=${qualityToUse}`);

    // Backend1
    (async () => {
      try {
        const url = `${BACKEND1}/api/prices?itemId=${encodeURIComponent(itemId)}&quality=${qualityToUse}`;
        console.log('[Frontend] fetch ->', url);
        const res = await fetch(url);
        const json = await res.json();
        console.log('[Frontend] backend1 respuesta:', json);
        setPricesFromBackend1(json);
      } catch (err) {
        console.error('[Frontend] Error backend1:', err);
        setPricesFromBackend1({ error: String(err) });
      }
    })();

    // Backend2
    (async () => {
      try {
        const url = `${BACKEND2}/api/prices?itemId=${encodeURIComponent(itemId)}&quality=${qualityToUse}`;
        console.log('[Frontend] fetch ->', url);
        const res = await fetch(url);
        const json = await res.json();
        console.log('[Frontend] backend2 respuesta:', json);
        setPricesFromBackend2(json);
      } catch (err) {
        console.error('[Frontend] Error backend2:', err);
        setPricesFromBackend2({ error: String(err) });
      } finally {
        setLoadingPrices(false);
      }
    })();
  };

  const changeQuality = (q) => {
    setQuality(q);
    if (selectedItem) fetchPricesForItem(selectedItem, q);
  };

  return (
    <div className="container">
      <h1>🛒 Market</h1>
      <div style={{marginTop:10}} className="card">
        <SearchBar onSearch={handleSearch} placeholder="Escribe (ej: Caballo, Túnica, Bolsa...)" />
      </div>

      {/* No mostramos items hasta que la búsqueda devuelva resultados */}
      <div style={{marginTop:12}}>
        {loadingItems ? <Loader /> : (
          <>
            {results.length === 0 && <div className="small">Escribe 3 segundos y verás resultados (tier básico sólo).</div>}
            {results.length > 0 && (
              <div className="grid" style={{marginTop:10}}>
                {results.map(it => <ItemCard key={it.id || it.UniqueName} item={it} onSelect={selectItem} />)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detalle y precios */}
      {selectedItem && (
        <div style={{marginTop:20}} className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <img src={selectedItem.imagen || `https://render.albiononline.com/v1/item/${selectedItem.id || selectedItem.UniqueName}.png`} width={52} height={52} />
              <div>
                <div style={{fontWeight:700}}>{selectedItem.nombre || selectedItem.LocalizedNames?.['ES-ES'] || selectedItem.UniqueName}</div>
                <div className="small">{selectedItem.id || selectedItem.UniqueName}</div>
              </div>
            </div>

            <div>
              <label className="small">Ver encantamiento: </label>
              <select value={quality} onChange={(e) => changeQuality(Number(e.target.value))}>
                <option value={1}>Base</option>
                <option value={2}>+1</option>
                <option value={3}>+2</option>
                <option value={4}>+3</option>
                <option value={5}>+4</option>
              </select>
            </div>
          </div>

          <div style={{marginTop:12}}>
            <h3>Precios (Backend1 = fucsia, Backend2 = rosa)</h3>
            {loadingPrices && <Loader />}

            <div style={{display:'flex', gap:12, marginTop:8}}>
              {/* Backend1 */}
              <div style={{flex:1}}>
                <div style={{background:'#6b0b6b', padding:8, borderRadius:6}}>Backend1 (AlbionData)</div>
                {pricesFromBackend1 ? (
                  <PricesBlock data={pricesFromBackend1} source="backend1" />
                ) : <div className="small">Sin datos (clic en Ver precios o espera)</div>}
              </div>

              {/* Backend2 */}
              <div style={{flex:1}}>
                <div style={{background:'#ff8fc2', padding:8, borderRadius:6}}>Backend2 (Albion2D / alternativa)</div>
                {pricesFromBackend2 ? (
                  <PricesBlock data={pricesFromBackend2} source="backend2" />
                ) : <div className="small">Sin datos</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helper component para mostrar precios por ciudad */
function PricesBlock({ data, source }) {
  // data expected like { item: "T4_BAG", precios: { Caerleon: { orden_venta: [...], orden_compra: [...] }, ... } }
  if (!data) return null;
  if (data.error) return <div className="small">Error: {String(data.error)}</div>;

  const precios = data.precios || data.prices || data; // aceptar varias variantes
  if (!precios || Object.keys(precios).length === 0) return <div className="small">No hay registros recientes</div>;

  return (
    <div style={{marginTop:8}}>
      {Object.entries(precios).map(([city, obj]) => {
        const color = cityColor[city] || '#ddd';
        const shade = source === 'backend1' ? 'rgba(107,11,107,0.08)' : 'rgba(255,143,194,0.08)';
        return (
          <div key={city} style={{padding:8, marginBottom:8, borderRadius:8, background:shade}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <strong style={{color}}>{city}</strong>
              <span className="small">{obj.actualizado || obj.updated || ''}</span>
            </div>

            <div style={{display:'flex', gap:12, marginTop:6}}>
              <div style={{flex:1}}>
                <div className="small">Orden venta (top recientes)</div>
                { (obj.orden_venta || obj.sell || obj.sellOrders || []).slice(0,7).map((o, idx) => (
                  <div key={idx} className="result-row"> <span>•</span> <span>{(o.precio || o.price || o).toLocaleString ? o.precio?.toLocaleString() || o.price?.toLocaleString() || o.toLocaleString() : o}</span> <span className="small">{o.fecha || o.date || ''}</span> </div>
                ))}
              </div>

              <div style={{flex:1}}>
                <div className="small">Orden compra (top recientes)</div>
                { (obj.orden_compra || obj.buy || obj.buyOrders || []).slice(0,7).map((o, idx) => (
                  <div key={idx} className="result-row"> <span>•</span> <span>{(o.precio || o.price || o).toLocaleString ? o.precio?.toLocaleString() || o.price?.toLocaleString() || o.toLocaleString() : o}</span> <span className="small">{o.fecha || o.date || ''}</span> </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
