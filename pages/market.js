import { useEffect, useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';

const Market = () => {
  const [items, setItems] = useState([]);
  const [precios, setPrecios] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const ciudades = [
    "Bridgewatch",
    "Martlock",
    "Lymhurst",
    "FortSterling",
    "Thetford",
    "Caerleon",
    "Brecilien"
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json');
      const data = await res.json();

      const itemsFiltrados = data.filter(
        (item) =>
          item.UniqueName &&
          item.LocalizedNames?.['ES-ES'] &&
          !item.UniqueName.includes('JOURNAL') &&
          !item.UniqueName.includes('TROPHY') &&
          !item.UniqueName.includes('SKIN') &&
          !item.UniqueName.includes('QUEST') &&
          !item.UniqueName.includes('BLACKMARKET') &&
          !item.UniqueName.includes('EVENT') &&
          !item.UniqueName.includes('TEST') &&
          !item.UniqueName.includes('DUMMY')
      );

      setItems(itemsFiltrados.slice(0, 100)); // Paginación futura
    } catch (err) {
      console.error('Error al obtener ítems:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrecios = async (itemId) => {
    try {
      const res = await fetch(
        `https://west.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${ciudades.join(',')}&qualities=1`
      );
      const data = await res.json();

      const ofertasCompra = data.filter((d) => d.buy_price_max > 0);
      const ofertasVenta = data.filter((d) => d.sell_price_min > 0);

      const mejorCompra = ofertasCompra.reduce((a, b) =>
        a.buy_price_max > b.buy_price_max ? a : b,
        { buy_price_max: 0 }
      );
      const mejorVenta = ofertasVenta.reduce((a, b) =>
        a.sell_price_min < b.sell_price_min ? a : b,
        { sell_price_min: Infinity }
      );

      const margen = mejorVenta.sell_price_min - mejorCompra.buy_price_max;

      setPrecios((prev) => ({
        ...prev,
        [itemId]: {
          buy: {
            price: mejorCompra.buy_price_max,
            city: mejorCompra.city || 'N/A',
          },
          sell: {
            price: mejorVenta.sell_price_min,
            city: mejorVenta.city || 'N/A',
          },
          margen: isFinite(margen) ? margen : 0,
        },
      }));
    } catch (err) {
      console.error('Error al obtener precios para', itemId, err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    items.forEach((item) => {
      if (!precios[item.UniqueName]) {
        fetchPrecios(item.UniqueName);
      }
    });
  }, [items]);

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const filtrados = items.filter((item) =>
    item.LocalizedNames['ES-ES'].toLowerCase().includes(search)
  );

  const handleReload = () => {
    setPrecios({});
    fetchItems();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>Market General</h1>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar ítem..."
          value={search}
          onChange={handleSearch}
          style={{
            padding: 10,
            width: '300px',
            borderRadius: 5,
            border: '1px solid #ccc',
            marginRight: 10
          }}
        />
        <button onClick={handleReload} style={{ padding: 10 }}>
          <ReloadIcon />
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Cargando ítems...</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20
          }}
        >
          {filtrados.map((item) => {
            const precio = precios[item.UniqueName];
            const icon = `https://render.albiononline.com/v1/item/${item.UniqueName}.png`;

            return (
              <div
                key={item.UniqueName}
                style={{
                  background: '#1a1a1a',
                  borderRadius: 10,
                  padding: 10,
                  color: '#fff',
                  textAlign: 'center'
                }}
              >
                <img
                  src={icon}
                  alt={item.LocalizedNames['ES-ES']}
                  style={{ width: 64, height: 64 }}
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <h4>{item.LocalizedNames['ES-ES']}</h4>
                {precio ? (
                  <>
                    <p>
                      <strong>Compra máx:</strong>{' '}
                      {precio.buy.price.toLocaleString()} ({precio.buy.city})
                    </p>
                    <p>
                      <strong>Venta mín:</strong>{' '}
                      {precio.sell.price.toLocaleString()} ({precio.sell.city})
                    </p>
                    <p>
                      <strong>Ganancia:</strong>{' '}
                      {precio.margen.toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p>Cargando precios...</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Market;
