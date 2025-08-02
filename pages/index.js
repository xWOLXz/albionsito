// pages/index.js
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [apiStatus, setApiStatus] = useState('Verificando...');

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/status');
        if (res.ok) {
          setApiStatus('✅ Conexión establecida con el backend');
        } else {
          setApiStatus('❌ Problema con el backend');
        }
      } catch (error) {
        setApiStatus('❌ Error al conectar con el backend');
      }
    };
    checkAPI();
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Bienvenido a Albionsito App</h1>
      <p style={{ marginBottom: '2rem' }}>Tu centro de información del mercado de Albion Online</p>

      <div style={{
        marginBottom: '2rem',
        fontWeight: 'bold',
        color: apiStatus.includes('✅') ? 'lightgreen' : 'tomato'
      }}>
        Estado del backend: {apiStatus}
      </div>

      <nav style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <Link href="/market" style={{ color: 'skyblue' }}>Market General</Link>
        <Link href="/top-ganancias" style={{ color: 'skyblue' }}>Top Ganancias</Link>
        <Link href="/black-market" style={{ color: 'skyblue' }}>Black Market</Link>
      </nav>
    </div>
  );
}
