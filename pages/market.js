import { useEffect, useState } from 'react';
import axios from 'axios';

const CITIES = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Brecilien'];
const ITEM_TIERS = ['T4', 'T5', 'T6', 'T7', 'T8'];
const ITEM_TYPES = ['BAG', 'CAPE', 'MAIN_SWORD', 'HEAD_CLOTH_SET1', 'ARMOR_CLOTH_SET1'];

export default function Market() {
  const [items, setItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerLoad = 20;

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setDisplayedItems(filtered.slice(0, itemOffset + itemsPerLoad));
  }, [search, items, itemOffset]);

  const loadItems = async () => {
    setLoading(true);
    const newItems = [];

    for (const tier of ITEM_TIERS) {
      for (const type of ITEM_TYPES) {
        const itemId = `${tier}_${type}`;
        try {
          const response = await axios.get(`https://www.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${CITIES.join(',')}`);
          const data = response.data;

          if (Array.isArray(data)) {
            const sellOrders = data.filter(d => d.sell_price_min > 0);
            const buyOrders = data.filter(d => d.buy_price_max > 0);

            if (sellOrders.length > 0 && buyOrders.length > 0) {
              const minSell = sellOrders.reduce((min, curr) =>
                curr.sell_price_min < min.sell_price_min ? curr : min
              );
              const maxBuy = buyOrders.reduce((max, curr) =>
                curr.buy_price_max > max.buy_price_max ? curr : max
              );

              const profit = maxBuy.buy_price_max - minSell.sell_price_min;
              if (profit > 0) {
                newItems.push({
                  id: itemId,
                  name: itemId.replace(/_/g, ' '),
                  image: `https://render.albiononline.com/v1/item/${itemId}.png`,
                  sell: minSell.sell_price_min,
                  sellCity: minSell.city,
                  buy: maxBuy.buy_price_max,
                  buyCity: maxBuy.city,
                  profit
                });
              }
            }
          }
        } catch (error) {
          console.error('Error fetching item:', itemId, error);
        }
      }
    }

    // Ordenar por mayor ganancia
    newItems.sort((a, b) => b.profit - a.profit);
    setItems(newItems);
    setDisplayedItems(newItems.slice(0, itemsPerLoad));
    setItemOffset(0);
    setLoading(false);
  };

  const loadMore = () => {
    const nextOffset = itemOffset + itemsPerLoad;
    setItemOffset(nextOffset);
    setDisplayedItems(items.slice(0, nextOffset + itemsPerLoad));
  };

  return (
    <div style={{ background: '#111', minHeight: '100vh', color: 'white', padding: 20 }}>
      <h1 style={{ textAlign: 'center', fontSize: 28 }}>Market General</h1>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={loadItems} style={{ marginRight: 10, background: 'none', border: 'none' }}>
          <img src="/albion-loader.gif" alt="refresh" width={28} />
        </button>
        <input
          type="text"
          placeholder="Buscar item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 5, width: '200px', borderRadius: 4 }}
        />
      </div>

      <div>
        <table style={{ width: '100%', borderSpacing: 10 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid gray' }}>
              <th style={{ textAlign: 'left' }}>Item</th>
              <th>Compra ↑</th>
              <th>Venta ↓</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((item, index) => (
              <tr key={index}>
                <td style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} width={50} height={50} style={{ marginRight: 10 }} />
                  {item.name}
                </td>
                <td>
                  {item.buy.toLocaleString()}<br /><small>{item.buyCity}</small>
                </td>
                <td>
                  {item.sell.toLocaleString()}<br /><small>{item.sellCity}</small>
                </td>
                <td style={{ color: item.profit > 0 ? 'lightgreen' : 'white' }}>
                  {item.profit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {displayedItems.length < items.length && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button onClick={loadMore} style={{ padding: 10, background: '#333', color: 'white', border: 'none', borderRadius: 4 }}>
              Cargar más
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <img src="/albion-loader.gif" alt="Cargando..." width={60} />
        </div>
      )}
    </div>
  );
}
