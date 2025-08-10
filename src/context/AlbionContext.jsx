import React, { createContext, useState, useEffect } from "react";

export const AlbionContext = createContext();

export const AlbionProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar items locales una sola vez
  useEffect(() => {
    fetch("/items.json")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error cargando items locales:", err));
  }, []);

  // Función para buscar ítems
  const searchItems = (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    const filtered = items.filter((item) =>
      item.LocalizedNames?.["ES-ES"]
        ?.toLowerCase()
        .includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // Función para seleccionar un ítem y traer precios
  const selectItem = async (item) => {
    setSelectedItem(item);
    setLoading(true);
    try {
      const res = await fetch(
        `https://albionsito-backend.onrender.com/api/prices/${item.UniqueName}`
      );
      const data = await res.json();
      setPrices(data);
    } catch (error) {
      console.error("Error obteniendo precios:", error);
      setPrices([]);
    }
    setLoading(false);
  };

  return (
    <AlbionContext.Provider
      value={{
        items,
        searchResults,
        searchItems,
        selectedItem,
        selectItem,
        prices,
        loading,
      }}
    >
      {children}
    </AlbionContext.Provider>
  );
};
