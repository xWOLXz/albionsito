// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.jsx';
import Market from './pages/market.jsx';
import Busqueda from './pages/busqueda.jsx';
import BlackMarket from './pages/blackmarket.jsx';
import TopGanancias from './pages/top.jsx';
import Navbar from './components/Navbar.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Market />} />
        <Route path="/busqueda" element={<Busqueda />} />
        <Route path="/blackmarket" element={<BlackMarket />} />
        <Route path="/top" element={<TopGanancias />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
