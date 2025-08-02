import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Market = () => {
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  const obtenerItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/items?page=${pagina}&nocache=${Date.now()}`);
      if (res.data && Array.isArray(res.data.items)) {
        setItems(res.data.items);
        setTotalPaginas(res.data.totalPages || 1);
      } else {
        setItems([]);
        setTotalPaginas(1);
      }
    } catch (err) {
      console.error('Error al obtener ítems:', err.message);
      setItems([]);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerItems();
  }, [pagina]);

  const buscar = (e) => {
    setBusqueda(e.target.value.toLowerCase());
  };

  const filtrados = items.filter((item) =>
    item.name.toLowerCase().includes(busqueda)
  );

  return (
    <div style={{ padding: '20px', background: '#111', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', textAlign: 'center' }}>Mercado General</h1>

      <input
        type="text"
        placeholder="Buscar item..."
        value={busqueda}
        onChange={buscar}
        style={{ padding: '8px', marginBottom: '20px', width: '100%' }}
      />

      {loading ? (
        <p>Cargando ítems...</p>
      ) : filtrados.length === 0 ? (
        <p>No se encontraron ítems.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {filtrados.map((item) => (
            <div key={item.id} style={{ background: '#222', padding: '15px', borderRadius: '10px' }}>
              <img src={item.icon} alt={item.name} style={{ width: '64px', height: '64px' }} />
              <h3 style={{ fontSize: '16px' }}>{item.name}</h3>
              <p>🟢 Compra: {item.buy?.price ?? 'N/D'} ({item.buy?.city ?? '-'})</p>
              <p>🔴 Venta: {item.sell?.price ?? 'N/D'} ({item.sell?.city ?? '-'})</p>
              <p>💰 Margen: {item.margen ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={() => setPagina(p => Math.max(p - 1, 1))} disabled={pagina === 1}>
          ← Anterior
        </button>
        <span style={{ margin: '0 10px' }}>Página {pagina} de {totalPaginas}</span>
        <button onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))} disabled={pagina === totalPaginas}>
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default Market;
