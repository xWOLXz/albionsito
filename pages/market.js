import React, { useState, useEffect } from 'react';

export default function MarketPage() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [precios, setPrecios] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Precarga los nombres e IDs de todos los ítems una sola vez
    const cargarItems = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/api/items');
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error('Error al cargar ítems:', error.message);
      }
    };
    cargarItems();
  }, []);

  const handleBuscar = (texto) => {
    setBusqueda(texto);
    if (texto.trim() === '') {
      setResultados([]);
    } else {
      const encontrados = items
        .filter(item =>
          item.nombre.toLowerCase().includes(texto.toLowerCase())
        )
        .slice(0, 20); // Limita a 20 resultados para no saturar
      setResultados(encontrados);
    }
  };

  const seleccionarItem = async (item) => {
    setItemSeleccionado(item);
    setResultados([]);
    setBusqueda('');
    setCargando(true);
    try {
  const encodedId = encodeURIComponent(item.item_id);
  const res = await fetch(`https://albionsito-backend.onrender.com/api/precios?itemId=${encodedId}`);
  
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }

  const data = await res.json();
  setPrecios(data);
    } catch (err) {
  console.error('Error al cargar precios:', err.message);
  setPrecios(null); // para que muestre "No se pudo cargar el precio"
    } catch (error) {
      console.error('Error al cargar precios:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const limpiarBusqueda = () => {
    setItemSeleccionado(null);
    setPrecios(null);
    setBusqueda('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
      <h1>🛒 Buscador de Ítems</h1>

      {!itemSeleccionado && (
        <>
          <input
            type="text"
            placeholder="Buscar ítem por nombre..."
            value={busqueda}
            onChange={(e) => handleBuscar(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              marginBottom: '10px'
            }}
          />
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {resultados.map(item => (
              <li
                key={item.item_id}
                onClick={() => seleccionarItem(item)}
                style={{
                  cursor: 'pointer',
                  padding: '8px',
                  borderBottom: '1px solid #ccc',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <img src={item.imagen} alt={item.nombre} width={40} height={40} style={{ marginRight: 10 }} />
                <span>{item.nombre}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {itemSeleccionado && (
        <div style={{ marginTop: 20 }}>
          <button onClick={limpiarBusqueda}>🔙 Volver</button>
          <h2>{itemSeleccionado.nombre}</h2>
          <img src={itemSeleccionado.imagen} alt={itemSeleccionado.nombre} width={100} />

          {cargando ? (
            <p>Cargando precios...</p>
          ) : precios ? (
            <div style={{ marginTop: 20 }}>
              <p><strong>📉 Precio de venta más barato:</strong> {precios.sell.price} en {precios.sell.city || 'N/A'}</p>
              <p><strong>📈 Precio de compra más caro:</strong> {precios.buy.price} en {precios.buy.city || 'N/A'}</p>
              <p><strong>💰 Margen de ganancia:</strong> {precios.margen}</p>
            </div>
          ) : (
            <p>No se pudo cargar el precio del ítem.</p>
          )}
        </div>
      )}
    </div>
  );
}
