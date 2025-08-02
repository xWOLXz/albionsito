import { useEffect, useState } from 'react';

const Market = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [precios, setPrecios] = useState({});
  const [error, setError] = useState('');

  const fetchItems = async (pageNumber) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/items?page=${pageNumber}`);
      const data = await res.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error cargando ítems:', err);
      setError('Error cargando ítems. Intenta de nuevo.');
    }
    setLoading(false);
  };

  const fetchPrecio = async (itemId) => {
    if (precios[itemId]) return; // evitar repetir
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${itemId}`);
      const data = await res.json();
      setPrecios(prev => ({ ...prev, [itemId]: data }));
    } catch (err) {
      console.error('Error cargando precios de', itemId, err);
    }
  };

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const mostrarItems = items.filter(item =>
    item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(search)
  );

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>Mercado de Albion Online</h1>

      <input
        type="text"
        placeholder="Buscar ítem..."
        value={search}
        onChange={handleSearch}
        style={{
          display: 'block',
          margin: '20px auto',
          padding: '10px',
          width: '300px',
          borderRadius: '5px',
          border: '1px solid #ccc'
        }}
      />

      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Cargando ítems...</p>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px'
          }}>
            {mostrarItems.map(item => {
              const iconUrl = `https://render.albiononline.com/v1/item/${item.UniqueName}.png`;
              const precio = precios[item.UniqueName];
              fetchPrecio(item.UniqueName);

              return (
                <div key={item.UniqueName} style={{
                  background: '#1e1e1e',
                  padding: 10,
                  borderRadius: 10,
                  textAlign: 'center',
                  color: 'white'
                }}>
                  <img
                    src={iconUrl}
                    alt={item.UniqueName}
                    style={{ width: 80, height: 80 }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <h4>{item.LocalizedNames?.['ES-ES'] || item.UniqueName}</h4>
                  {precio ? (
                    <>
                      <p><strong>Compra máx:</strong> {precio.buy?.price?.toLocaleString()} ({precio.buy?.city})</p>
                      <p><strong>Venta mín:</strong> {precio.sell?.price?.toLocaleString()} ({precio.sell?.city})</p>
                      <p><strong>Ganancia:</strong> {precio.margen?.toLocaleString()}</p>
                    </>
                  ) : (
                    <p>Cargando precios...</p>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 30, textAlign: 'center' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              style={{
                marginRight: 10,
                padding: '10px 20px',
                background: '#444',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Anterior
            </button>

            <span style={{ color: 'white', margin: '0 15px' }}>
              Página {page} de {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(prev => prev + 1)}
              style={{
                marginLeft: 10,
                padding: '10px 20px',
                background: '#444',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Market;
