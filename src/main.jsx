import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AlbionProvider } from './context/AlbionContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AlbionProvider>
      <App />
    </AlbionProvider>
  </React.StrictMode>
);
