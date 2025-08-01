// pages/index.js
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Bienvenido a Albionsito App</h1>
      <p style={{ marginBottom: '2rem' }}>Tu centro de información del mercado de Albion Online</p>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link href="/market">Market General</Link>
        <Link href="/top-ganancias">Top Ganancias</Link>
        <Link href="/black-market">Black Market</Link>
      </nav>
    </div>
  );
}
