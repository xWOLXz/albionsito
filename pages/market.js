import { useState, useEffect } from 'react';

export default function MarketPage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/items.json')
      .then((res) => res.json())
      .then((data) => {
        const tradables = data.filter(item =>
          item.UniqueName && item.LocalizedNames?.['ES-ES'] &&
          !item.UniqueName.includes('QUEST_') &&
          !item.UniqueName.includes('TROPHY') &&
          !item.UniqueName.includes('AVATAR') &&
          !item.UniqueName.includes('JOURNAL') &&
          !item.UniqueName.includes('FARMABLE') &&
          !item.UniqueName.includes('BLACKMARKET')
        );
        setItems(tradables);
      });
  }, []);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length < 3) {
      setFilteredItems([]);
      return;
    }

    setLoading(true);
    const matches = items.filter(item =>
      item.LocalizedNames['ES-ES'].toLowerCase().includes(term.toLowerCase())
    ).slice(0, 10);

    const results = await Promise.all(matches.map(async (item) => {
      const res = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${item.UniqueName}?locations=Bridgewatch,Martlock,Lymhurst,FortSterling,Thetford,Caerleon`);
      const data = await res.json();

      const validData = data.filter(entry => entry.sell_price_min > 0 || entry.buy_price_max > 0);

      let lowestSell = null;
      let highestBuy = null;

      validData.forEach(entry => {
        if (!lowestSell || entry.sell_price_min < lowestSell.price) {
          lowestSell = { city: entry.city, price: entry.sell_price_min };
        }
        if (!highestBuy || entry.buy_price_max > highestBuy.price) {
          highestBuy = { city: entry.city, price: entry.buy_price_max };
        }
      });

      return {
        name: item.LocalizedNames['ES-ES'],
        icon: item.UniqueName,
        lowestSell,
        highestBuy,
        profit: (lowestSell && highestBuy) ? (highestBuy.price - lowestSell.price) : 0
      };
    }));

    setFilteredItems(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Mercado Albion Online</h1>
      <input
        type="text"
        placeholder="Buscar ítem en español..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ padding: '8px', fontSize: '1rem', width: '100%', maxWidth: 300 }}
      />

      {loading && <p>Cargando resultados...</p>}

      <table style={{ marginTop: '2rem' }}>
        <thead>
          <tr>
            <th>Ítem</th>
            <th>Venta más baja</th>
            <th>Compra más alta</th>
            <th>Ganancia estimada</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, idx) => (
            <tr key={idx}>
              <td>
                <img src={`https://render.albiononline.com/v1/item/${item.icon}.png`} alt={item.name} width={40} />
                <span style={{ marginLeft: '8px' }}>{item.name}</span>
              </td>
              <td>{item.lowestSell ? `${item.lowestSell.price} (en ${item.lowestSell.city})` : 'N/D'}</td>
              <td>{item.highestBuy ? `${item.highestBuy.price} (en ${item.highestBuy.city})` : 'N/D'}</td>
              <td style={{ color: item.profit > 0 ? 'lime' : 'gray' }}>
                {item.profit > 0 ? `${item.profit} plata` : 'Sin ganancia'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
        }
