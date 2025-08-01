import { useEffect, useState } from 'react';
import styles from '../styles/TopGanancias.module.css';

const CITIES = ['Bridgewatch', 'Martlock', 'Thetford', 'Lymhurst', 'Fort Sterling', 'Caerleon', 'Brecilien'];
const API_BASE_URL = 'https://west.albion-online-data.com/api/v2/stats/prices';

const TopGanancias = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 30;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const itemIds = [
          'T4_BAG', 'T5_BAG', 'T6_BAG', 'T7_BAG', 'T8_BAG',
          'T4_CAPE', 'T5_CAPE', 'T6_CAPE', 'T7_CAPE', 'T8_CAPE',
          'T4_MEAL_SOUP', 'T5_MEAL_SOUP', 'T6_MEAL_SOUP',
          'T4_POTION_HEAL', 'T5_POTION_HEAL', 'T6_POTION_HEAL'
        ];

        const response = await fetch(`${API_BASE_URL}/${itemIds.join(',')}?locations=${CITIES.join(',')}&qualities=1`);
        const prices = await response.json();

        const itemsMap = {};

        for (const item of prices) {
          const { item_id, city, sell_price_min, buy_price_max } = item;
          if (!itemsMap[item_id]) {
            itemsMap[item_id] = {
              item_id,
              sell: { price: sell_price_min || 0, city },
              buy: { price: buy_price_max || 0, city }
            };
          } else {
            if (sell_price_min && sell_price_min < itemsMap[item_id].sell.price) {
              itemsMap[item_id].sell = { price: sell_price_min, city };
            }
            if (buy_price_max && buy_price_max > itemsMap[item_id].buy.price) {
              itemsMap[item_id].buy = { price: buy_price_max, city };
            }
          }
        }

        const processedItems = Object.values(itemsMap)
          .map(item => ({
            ...item,
            margin: item.buy.price - item.sell.price
          }))
          .filter(item => item.sell.price > 0 && item.buy.price > 0 && item.margin > 0)
          .sort((a, b) => b.margin - a.margin);

        setData(processedItems);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const paginatedItems = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className={styles.container}>
      <h1>🤑 Top Ganancias</h1>

      {loading ? (
        <p>Cargando datos desde el mercado de Albion Online...</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Compra + Ciudad</th>
                <th>Venta + Ciudad</th>
                <th>Margen</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item, index) => (
                <tr key={`${item.item_id}-${index}`}>
                  <td>
                    <img
                      src={`https://render.albiononline.com/v1/item/${item.item_id}.png`}
                      alt={item.item_id}
                      className={styles.icon}
                    />
                    <span>{item.item_id}</span>
                  </td>
                  <td>{item.sell.price.toLocaleString()} 🏙️ {item.sell.city}</td>
                  <td>{item.buy.price.toLocaleString()} 🏙️ {item.buy.city}</td>
                  <td>💰 {item.margin.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <button onClick={prevPage} disabled={currentPage === 1}>⬅️ Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>Siguiente ➡️</button>
          </div>
        </>
      )}
    </div>
  );
};

export default TopGanancias;
