import { useState, useEffect } from 'react';

const Market = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [precios, setPrecios] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://albionsito-backend.onrender.com/items?page=${page}`);
        const data = await res.json();
        setItems(data.items);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando ítems:', error);
      }
    };
    fetchItems();
  }, [page]);

  const fetchPrecio = async (itemId) => {
    if (precios[itemId]) return;
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${itemId}`);
      const data = await res.json();
      setPrecios(prev => ({ ...prev, [itemId]: data }));
    } catch (error) {
      console.error('Error cargando precios:', error);
    }
  };

  const filteredItems = items.filter(item =>
    item.LocalizedNames['ES-ES'].toLowerCase().includes(search)
  );

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>Mercado General</h1>
      <input
        type="text"
        placeholder="Buscar ítem..."
        value={search}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
        style={{
          display: 'block',
          margin: '20px auto',
          padding: '10px',
          width: '300px',
          borderRadius: '5px',
          border: '1px solid #ccc'
        }}
      />

      {loading ? (
        <p style={{ textAlign: 'center' }}>Cargando ítems...</p>
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {filteredItems.map(item => {
              const icon = `https://render.albiononline.com/v1/item/${item.UniqueName}.png`;
              const precio = precios[item.UniqueName];
              fetchPrecio(item.UniqueName);

              return (
                <div key={item.UniqueName} style={{
                  background: '#111',
                  padding: 10,
                  borderRadius: 10,
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <img src={icon} alt={item.UniqueName} style={{ width: 80 }} />
                  <h4>{item.LocalizedNames['ES-ES']}</h4>
                  {precio ? (
                    <>
                      <p><strong>Compra máx:</strong> {precio.buy?.price?.toLocaleString() || '—'} ({precio.buy?.city || '-'})</p>
                      <p><strong>Venta mín:</strong> {precio.sell?.price?.toLocaleString() || '—'} ({precio.sell?.city || '-'})</p>
                      <p><strong>Ganancia:</strong> {precio.margen?.toLocaleString() || '—'}</p>
                    </>
                  ) : (
                    <p>Cargando precios...</p>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
            <span style={{ margin: '0 10px' }}>Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
