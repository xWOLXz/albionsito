// pages/market.js
import { useState } from 'react';
import styles from '../styles/Market.module.css';

export default function Market() {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemResults, setItemResults] = useState([]);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length < 3) {
      setItemResults([]);
      return;
    }

    try {
      const res = await fetch(`https://west.albion-online-data.com/api/gameinfo/search/${term}`);
      const data = await res.json();
      const filtered = data.filter((item) => item.UniqueName.includes('T') && !item.UniqueName.includes('QUESTITEM'));
      setItemResults(filtered.slice(0, 10));
    } catch (err) {
      console.error('Error buscando ítems:', err);
    }
  };

  const fetchPrices = async (itemId) => {
    setLoading(true);
    setPrices(null);
    try {
      const res = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${itemId}?locations=Thetford,Fort Sterling,Lymhurst,Bridgewatch,Martlock,Caerleon,Brecilien`);
      const data = await res.json();
      setPrices(data);
    } catch (err) {
      console.error('Error obteniendo precios:', err);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mercado Albion Online</h1>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Buscar ítem..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <ul className={styles.resultsList}>
        {itemResults.map((item) => (
          <li key={item.UniqueName} onClick={() => fetchPrices(item.UniqueName)}>
            <img src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`} alt={item.LocalizedNames?.['ES-ES'] || item.UniqueName} />
            <span>{item.LocalizedNames?.['ES-ES'] || item.UniqueName}</span>
          </li>
        ))}
      </ul>

      {loading && <p>Cargando precios...</p>}

      {prices && (
        <div className={styles.prices}>
          <h2>Precios por ciudad:</h2>
          <table>
            <thead>
              <tr>
                <th>Ciudad</th>
                <th>Precio de venta (más barato)</th>
                <th>Precio de compra (más caro)</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((city) => (
                <tr key={city.city}>
                  <td>{city.city}</td>
                  <td>{city.sell_price_min.toLocaleString()} ⬇️</td>
                  <td>{city.buy_price_max.toLocaleString()} ⬆️</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
        }
