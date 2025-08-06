// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Albionsito 📊</h2>
      <ul className="nav-links">
        <li><Link to="/">Market</Link></li>
        <li><Link to="/blackmarket">Black Market</Link></li>
        <li><Link to="/busqueda">Búsqueda</Link></li>
        <li><Link to="/top">Top Ganancias</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
