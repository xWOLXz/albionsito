import { useEffect, useState } from 'react';

const Market = () => {
  const [items, setItems] = useState([]);
  const [precios, setPrecios] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/items');
        const data = await res.json();
        setItems(data);
        setFiltered(data);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando ítems:', error);
      }
    };
    fetchItems();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    const result = items.filter(item =>
      item.LocalizedNames?.['ES-ES']?.toLowerCase().includes(term)
    );
    setFiltered(result);
    setCurrentPage(1);
  };

  const fetchPrecio = async (itemId) => {
    if (precios[itemId]) return;
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${itemId}`);
      const data = await res.json();
      setPrecios(prev => ({ ...prev, [itemId]: data }));
    } catch (error) {
      console.error('Error obteniendo precios de', itemId, error);
    }
  };

  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>🛒 Market General</h1>
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Buscar ítem..."
        style={{
          display: 'block',
          margin: '20px auto',
          padding: '10px',
          width: '300px',
          borderRadius: '8px',
          border: '1px solid #ccc'
        }}
      />

      {loading ? (
        <p style={{ textAlign: 'center' }}>Cargando ítems...</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}
          >
            {currentItems.map(item => {
              const icon = `https://render.albiononline.com/v1/item/${item.UniqueName}.png`;
              const precio = precios[item.UniqueName];
              useEffect(() => {
                fetchPrecio(item.UniqueName);
              }, []);

              return (
                <div key={item.UniqueName} style={{
                  background: '#111',
                  padding: '15px',
                  borderRadius: '10px',
                  color: '#fff',
                  textAlign: 'center',
                  boxShadow: '0 0 10px #0008'
                }}>
                  <img src={icon} alt={item.UniqueName} width={80} height={80} />
                  <h3>{item.LocalizedNames['ES-ES']}</h3>
                  {precio ? (
                    <>
                      <p><strong>Compra máx:</strong> {precio.buy.price.toLocaleString()} ({precio.buy.city})</p>
                      <p><strong>Venta mín:</strong> {precio.sell.price.toLocaleString()} ({precio.sell.city})</p>
                      <p><strong>Ganancia:</strong> {precio.margen.toLocaleString()}</p>
                    </>
                  ) : (
                    <p>Cargando precios...</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ marginRight: '10px', padding: '10px 15px' }}
            >
              ← Anterior
            </button>
            <span style={{ fontWeight: 'bold' }}>Página {currentPage}</span>
            <button
              onClick={() => setCurrentPage(prev => (prev * itemsPerPage < filtered.length ? prev + 1 : prev))}
              disabled={(currentPage * itemsPerPage) >= filtered.length}
              style={{ marginLeft: '10px', padding: '10px 15px' }}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Market;
