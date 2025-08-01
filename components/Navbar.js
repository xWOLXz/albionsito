// components/Navbar.js
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link href="/" style={styles.link}>Inicio</Link>
      <Link href="/market" style={styles.link}>Market General</Link>
      <Link href="/top-ganancias" style={styles.link}>Top Ganancias</Link>
      <Link href="/black-market" style={styles.link}>Black Market</Link>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#111',
    color: '#fff',
    borderBottom: '1px solid #444',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
  }
};
