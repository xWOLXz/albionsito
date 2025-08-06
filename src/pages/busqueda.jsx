// src/pages/busqueda.jsx
import React, { useState } from 'react';
import './busqueda.css';

function Busqueda() {
  const [nombre, setNombre] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const buscarItem = async () => {
    if (!nombre.trim()) return;

    setCargando(true);
    setError(null);
    setResultados([]);

    try {
      const response = await fetch(`https://albionsito-backend2.vercel.app/api/precios?id=${encodeURIComponent(nombre)}`);

      if (!response.ok) {
        throw new Error('Error al consultar el servidor.');
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setError('No se encontraron resultados para ese nombre.');
        setCargando(false);
        return;
      }

      setResultados(data);
    } catch (err) {
      console.error('Error buscando precios:', err);
      setError('Ocurrió un error al buscar el ítem.');
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      buscarItem();
    }
  };

  return (
    <div className="busqueda-container">
      <h1 className="busqueda-titulo">🔍 Buscar Ítem en el Market</h1>

      <div className="busqueda-barra">
        <input
          type="text"
          placeholder="Ej: T4 MOUNT HORSE"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={buscarItem}>Buscar</button>
      </div>

      {cargando && (
        <div className="busqueda-cargando">
          <img src="/albion-loader.gif" alt="Cargando..." />
          <p>Consultando precios...</p>
        </div>
      )}

      {error && (
        <div className="busqueda-error">
          ⚠️ {error}
        </div>
      )}

      {resultados.length > 0 && (
        <div className="busqueda-tabla-wrapper">
          <table className="busqueda-tabla">
            <thead>
              <tr>
                <th>Ciudad</th>
                <th>Precio de Venta</th>
                <th>Precio de Compra</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((item, index) => (
                <tr key={index}>
                  <td>{item.city}</td>
                  <td>{item.sell_price_min.toLocaleString()} 💰</td>
                  <td>{item.buy_price_max.toLocaleString()} 💰</td>
                  <td>{new Date(item.datetime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="busqueda-contador">
            Artículos cargados: {resultados.length}
          </p>
        </div>
      )}
    </div>
  );
}

export default Busqueda;
