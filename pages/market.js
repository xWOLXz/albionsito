import { useEffect, useState } from 'react';

export default function MarketPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch('https://raw.githubusercontent.com/madorin/albion-data/main/items.json');
      const data = await res.json();

      const itemsFiltrados = data.filter((item) => item.UniqueName && item.LocalizedNames?.['ES-ES']);
      const itemsConImagen = itemsFiltrados.map((item) => ({
        id: item.UniqueName,
        nombre: item.LocalizedNames['ES-ES'],
        icono: `https://render.albiononline.com/v1/item/${item.UniqueName}.png`,
      }));

      setItems(itemsConImagen);
    };

    fetchItems();
  }, []);

  const [precios, setPrecios] = useState({});

  const fetchPrecio = async (itemId) => {
    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/precios?itemId=${itemId}`);
      const data = await res.json();
      setPrecios((prev) => ({ ...prev, [itemId]: data }));
    } catch (error) {
      console.error('Error cargando precios para', itemId, error);
    }
  };

  const itemsFiltrados = items.filter((item) =>
    item.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', background: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>Market General</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar ítem..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 10, fontSize: 16, width: '300px', borderRadius: 8 }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 20
      }}>
        {itemsFiltrados.map((item) => (
          <div key={item.id} style={{
            background: '#222',
            padding: 16,
            borderRadius: 12,
            textAlign: 'center'
          }}>
            <img
              src={item.icono}
              alt={item.nombre}
              width={80}
              height={80}
              onLoad={() => fetchPrecio(item.id)}
              onError={(e) => e.currentTarget.style.display = 'none'}
              style={{ marginBottom: 10 }}
            />
            <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>{item.nombre}</div>

            {precios[item.id] ? (
              <>
                <div style={{ fontSize: 13 }}>
                  <strong>Compra:</strong> {precios[item.id].buy.price.toLocaleString()}  
                  <br />({precios[item.id].buy.city})
                </div>
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  <strong>Venta:</strong> {precios[item.id].sell.price.toLocaleString()}  
                  <br />({precios[item.id].sell.city})
                </div>
                <div style={{
                  fontSize: 14,
                  marginTop: 8,
                  color: precios[item.id].margen >= 0 ? '#0f0' : '#f55'
                }}>
                  <strong>Margen:</strong> {precios[item.id].margen.toLocaleString()}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#999' }}>Cargando precios...</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
                }
