import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ItemDetail() {
  const router = useRouter();
  const { itemId } = router.query;
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`https://albion-data-api.vercel.app/api/prices/${itemId}`);
        const data = await res.json();

        const validData = data.filter(entry => entry.sell_price_min > 0 && entry.buy_price_max > 0);

        if (validData.length === 0) {
          setItemData(null);
          setLoading(false);
          return;
        }

        const minSell = validData.reduce((a, b) => (a.sell_price_min < b.sell_price_min ? a : b));
        const maxBuy = validData.reduce((a, b) => (a.buy_price_max > b.buy_price_max ? a : b));

        setItemData({
          itemId,
          imagen: `https://render.albiononline.com/v1/item/${itemId}.png`,
          minSell,
          maxBuy,
          margen: (minSell.sell_price_min - maxBuy.buy_price_max)
        });
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
      setLoading(false);
    }

    fetchData();
  }, [itemId]);

  if (loading) return <p style={{ color: 'white' }}>Cargando información...</p>;
  if (!itemData) return <p style={{ color: 'white' }}>No hay datos disponibles.</p>;

  return (
    <div style={{ padding: 20, color: 'white' }}>
      <button onClick={() => router.back()} style={{ marginBottom: 20 }}>← Volver</button>
      <h1>{itemId}</h1>
      <img src={itemData.imagen} alt={itemId} width={100} />
      <p><strong>Precio más barato (venta):</strong> {itemData.minSell.sell_price_min} en {itemData.minSell.city}</p>
      <p><strong>Precio más caro (compra):</strong> {itemData.maxBuy.buy_price_max} en {itemData.maxBuy.city}</p>
      <p><strong>Margen de ganancia:</strong> {itemData.margen} de plata</p>
    </div>
  );
    }
