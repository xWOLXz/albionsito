import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState('Verificando...');

  const checkBackend = async () => {
    try {
      const res = await fetch('https://albionsito-backend.onrender.com/status');
      if (res.ok) {
        setBackendStatus('🟢 Conectado');
      } else {
        setBackendStatus('🔴 Desconectado');
      }
    } catch (error) {
      setBackendStatus('🔴 Desconectado');
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 10000); // cada 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊 ALBIONSITO APP</h1>

      <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
        Estado del backend: <strong>{backendStatus}</strong>
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <Link href="/market">
          <button style={btnStyle}>🛒 Market General</button>
        </Link>

        <Link href="/top-ganancias">
          <button style={btnStyle}>💰 Top Ganancias</button>
        </Link>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '1rem 2rem',
  background: '#1e1e1e',
  color: 'white',
  border: '1px solid #555',
  borderRadius: '10px',
  fontSize: '1rem',
  cursor: 'pointer',
};
