import React from 'react';
import { AlbionProvider } from './context/AlbionContext';
import Market from './pages/Market';

export default function App() {
  return (
    <AlbionProvider>
      <Market />
    </AlbionProvider>
  );
}
