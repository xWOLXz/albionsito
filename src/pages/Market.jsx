// src/pages/Market.jsx
import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import ItemCard from '../components/ItemCard';

export default function Market() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendURL = "https://albionsito-backend.onrender.com/api/prices";

  // Cargar datos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(backendURL);
        const data = await res.json();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error("Error al cargar precios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar ítems por búsqueda
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredItems(items);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = items.filter((item) =>
      item.item_id?.toLowerCase().includes(lowerQuery) ||
      item.nombre?.toLowerCase().includes(lowerQuery)
    );
    setFilteredItems(filtered);
  };

  return (
    <div className="market-page">
      <h1>Mercado de Albion Online</h1>
      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <Loader />
      ) : filteredItems.length > 0 ? (
        <div className="item-list">
          {filteredItems.map((item, index) => (
            <ItemCard key={index} item={item} />
          ))}
        </div>
      ) : (
        <p>No se encontraron ítems.</p>
      )}
    </div>
  );
}
