import React from 'react'

export default function Header() {
  return (
    <header style={{ backgroundColor: '#111', padding: '1rem', color: '#fff' }}>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <a href="/market" style={{ color: '#fff' }}>Market General</a>
        <a href="/top-ganancias" style={{ color: '#fff' }}>Top Ganancias</a>
        <a href="/black-market" style={{ color: '#fff' }}>Black Market</a>
      </nav>
    </header>
  )
}
