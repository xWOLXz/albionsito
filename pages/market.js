import { useEffect, useState } from 'react';

export default function Market() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(30);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setCargando(true);
        const res = await fetch('https://albionsito-backend.onrender.com/items');
        const data = await res.json();
        const itemsFiltrados = data.filter(item => item.imagen && !item.imagen.includes('QUESTITEM'));
        setItems(itemsFiltrados);
        setCargando(false);
      } catch (error) {
        console.error('Error al cargar los ítems:', error);
        setCargando(false);
      }
    };

    fetchItems();
  }, []);

  const itemsFiltrados = items.filter(item =>
    item.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const itemsActuales = itemsFiltrados.slice(indicePrimerItem, indiceUltimoItem);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPaginas = Math.ceil(itemsFiltrados.length / itemsPorPagina);

  return (
    <div style={{ padding: '2rem', background: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Market General</h1>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Buscar ítem..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '0.5rem', width: '300px', borderRadius: '8px', border: 'none' }}
        />
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center' }}>Cargando ítems...</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            {itemsActuales.map((item) => (
              <div
                key={item.id}
                style={{
                  width: '180px',
                  background: '#1a1a1a',
                  padding: '1rem',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                {item.imagen && !item.imagen.includes('QUESTITEM') && (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    width={100}
                    height={100}
                    style={{ marginBottom: '0.5rem' }}
                  />
                )}
                <div>{item.nombre}</div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => cambiarPagina(i + 1)}
                style={{
                  margin: '0 5px',
                  padding: '0.5rem 1rem',
                  background: paginaActual === i + 1 ? '#f39c12' : '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
                      }
