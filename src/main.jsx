import React from 'react';
import ReactDOM from 'react-dom/client';
import { AlbionProvider } from './context/AlbionContext';
import App from './App';   // Aquí tu componente principal con rutas, incluido Market

import './index.css';      // estilos globales

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AlbionProvider>
      <App />
    </AlbionProvider>
  </React.StrictMode>
);
