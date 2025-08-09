import React, { createContext, useState, useEffect } from 'react';

export const AlbionContext = createContext();

export const AlbionProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/items.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(data);
      } catch (e) {
        console.error('Error cargando items:', e);
      }
    }
    fetchItems();
  }, []);

  return (
    <AlbionContext.Provider
      value={{
        items,
        quality,
        setQuality,
        searchTerm,
        setSearchTerm,
        selectedItem,
        setSelectedItem,
      }}
    >
      {children}
    </AlbionContext.Provider>
  );
};
