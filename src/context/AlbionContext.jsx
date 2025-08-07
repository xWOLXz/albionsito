import { createContext, useContext, useEffect, useState } from 'react';

const AlbionContext = createContext();

export const useAlbion = () => useContext(AlbionContext);

export const AlbionProvider = ({ children }) => {
  const [itemsData, setItemsData] = useState([]);
  const [pricesBackend, setPricesBackend] = useState([]);
  const [prices2D, setPrices2D] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [itemsRes, pricesRes, prices2DRes] = await Promise.all([
          fetch('/items.json'),
          fetch('https://albionsito-backend.onrender.com/prices'),
          fetch('https://albionsito-backend2.onrender.com/prices2d')
        ]);
        const items = await itemsRes.json();
        const prices = await pricesRes.json();
        const prices2d = await prices2DRes.json();
        setItemsData(items);
        setPricesBackend(prices);
        setPrices2D(prices2d);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <AlbionContext.Provider value={{ itemsData, pricesBackend, prices2D, loading }}>
      {children}
    </AlbionContext.Provider>
  );
};
