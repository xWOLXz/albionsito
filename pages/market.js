import { useEffect, useState } from 'react';

const Market = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [precios, setPrecios] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://albionsito-backend.onrender.com/items?page=${page}`);
        const data = await res.json();
        setItems(data.items);
        setPrecios({}); // Resetear precios al cambiar de página
        setLoading(false);
      } catch (error) {
        console.error('Error cargando ítems:', error);
        setLoading(false);
      }
    };
    fetchItems();
  }, [page]);

  const fetchPrecio = async (itemId) => {
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${itemId}`);
      const data = await res.json();
      setPrecios(prev => ({ ...prev, [itemId]: data }));
    } catch (error) {
      console.error('Error cargando precios:', error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const mostrarItems = items.filter(item =>
    item.LocalizedNames['ES-ES'].toLowerCase().includes(search)
  );

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>Market General</h1>
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

              if (!precio && !precios[item.UniqueName]) {
                fetchPrecio(item.UniqueName);
              }

              return (
                <div key={item.UniqueName} style={{
                  background: '#1a1a1a',
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
                  <h4>{item.LocalizedNames['ES-ES']}</h4>
                  {precio ? (
                    <>
                      <p><strong>Compra máx:</strong> {precio.buy.price?.toLocaleString() || 'N/A'} ({precio.buy.city || '-'})</p>
                      <p><strong>Venta mín:</strong> {precio.sell.price?.toLocaleString() || 'N/A'} ({precio.sell.city || '-'})</p>
                      <p><strong>Ganancia:</strong> {precio.margen?.toLocaleString() || 'N/A'}</p>
                    </>
                  ) : (
                    <p>Cargando precios...</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              style={{ marginRight: 10, padding: '8px 16px' }}
            >
              Anterior
            </button>
            <span style={{ margin: '0 10px' }}>Página {page}</span>
            <button
              onClick={() => setPage(prev => prev + 1)}
              style={{ marginLeft: 10, padding: '8px 16px' }}
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
