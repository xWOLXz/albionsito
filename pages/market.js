import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Market() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://albionsito-backend.onrender.com/items');
        const data = await res.json();
        setItems(data.items);
        setFilteredItems(data.items); // inicializa con todos
      } catch (error) {
        console.error('Error cargando ítems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.LocalizedNames['ES-ES']?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  const fetchPrecios = async (itemId) => {
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${itemId}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error al obtener precios:', error);
      return null;
    }
  };

  const [preciosMap, setPreciosMap] = useState({});

  useEffect(() => {
    const cargarPrecios = async () => {
      const preciosTemp = {};
      for (const item of filteredItems.slice(0, 50)) {
        const precios = await fetchPrecios(item.UniqueName);
        if (precios) {
          preciosTemp[item.UniqueName] = precios;
        }
      }
      setPreciosMap(preciosTemp);
    };

    if (filteredItems.length > 0) {
      cargarPrecios();
    }
  }, [filteredItems]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#111', color: 'white' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2em' }}>Mercado General</h1>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar ítem..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px',
            width: '90%',
            maxWidth: '500px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '16px',
            backgroundColor: '#222',
            color: 'white'
          }}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>🔄 Cargando ítems...</p>
      ) : filteredItems.length === 0 ? (
        <p style={{ textAlign: 'center' }}>❌ No se encontraron ítems.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
          {filteredItems.slice(0, 50).map((item) => {
            const nombre = item.LocalizedNames['ES-ES'];
            const icon = `https://render.albiononline.com/v1/item/${item.UniqueName}.png`;
            const precios = preciosMap[item.UniqueName];

            return (
              <div key={item.UniqueName} style={{
                backgroundColor: '#1a1a1a',
                padding: '10px',
                borderRadius: '10px',
                boxShadow: '0 0 5px #444',
                textAlign: 'center'
              }}>
                <Image src={icon} alt={nombre} width={64} height={64} />
                <h3 style={{ fontSize: '16px', margin: '10px 0' }}>{nombre}</h3>
                {precios ? (
                  <div>
                    <p style={{ margin: '5px 0' }}>
                      <span style={{ color: 'limegreen' }}>🟢 Compra: {precios.buy.price.toLocaleString()} ({precios.buy.city})</span>
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <span style={{ color: 'tomato' }}>🔴 Venta: {precios.sell.price.toLocaleString()} ({precios.sell.city})</span>
                    </p>
                    <p style={{ marginTop: '5px', color: 'gold' }}>💰 Margen: {precios.margen.toLocaleString()}</p>
                  </div>
                ) : (
                  <p style={{ color: '#888' }}>Cargando precios...</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
