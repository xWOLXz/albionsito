// pages/index.js
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>⚔️ Bienvenido a <span style={estilos.marca}>Albionsito</span> App</h1>
      <p style={estilos.descripcion}>
        Consulta el mercado en tiempo real, encuentra oportunidades de ganancia y domina el comercio en Albion Online.
      </p>

      <div style={estilos.botones}>
        <Link href="/market">
          <button style={estilos.boton}>📊 Market General</button>
        </Link>
        <Link href="/top-ganancias">
          <button style={estilos.boton}>💰 Top Ganancias</button>
        </Link>
        <Link href="/black-market">
          <button style={estilos.boton}>🕶️ Black Market</button>
        </Link>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Image
          src="/albion-loader.gif"
          alt="Albionsito"
          width={80}
          height={80}
        />
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
          App conectada a las APIs oficiales y a Albion 2D.
        </p>
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    backgroundColor: '#111',
    color: '#fff',
    minHeight: '100vh',
  },
  titulo: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  marca: {
    color: '#ffcc00',
  },
  descripcion: {
    fontSize: '1rem',
    marginBottom: '2rem',
    maxWidth: '600px',
    margin: '0 auto 2rem',
    lineHeight: '1.6',
  },
  botones: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
  boton: {
    padding: '0.8rem 1.8rem',
    fontSize: '1rem',
    backgroundColor: '#222',
    color: '#fff',
    border: '2px solid #555',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};
