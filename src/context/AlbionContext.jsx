import React, { createContext, useState, useEffect } from 'react';

export const AlbionContext = createContext();

export const AlbionProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState({ backend1: {}, backend2: {} });

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch('/items.json');
      const data = await res.json();
      setItems(data);
    };

    fetchItems();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        fetch('https://albionsito-backend.onrender.com/api/prices'),
        fetch('https://albionsito-backend2.onrender.com/api/prices2d'),
      ]);
      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
      setPrices({
        backend1: data1,
        backend2: data2,
      });
    } catch (error) {
      console.error('Error al obtener precios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlbionContext.Provider
      value={{
        items,
        quality,
        setQuality,
        searchTerm,
        setSearchTerm,
        fetchPrices,
        loading,
        prices,
      }}
    >
      {children}
    </AlbionContext.Provider>
  );
};
