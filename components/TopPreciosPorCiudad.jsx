// components/TopPreciosPorCiudad.jsx
import { useEffect, useState } from 'react';

const ciudades = ["Caerleon", "Bridgewatch", "Lymhurst", "Martlock", "Thetford", "Fort Sterling", "Brecilien"];
const backends = [
  "https://albionsito-backend.onrender.com/items",
  "https://albionsito-backend2.onrender.com/items"
];

export default function TopPreciosPorCiudad() {
  const [itemsData, setItemsData] = useState([]);
  const [precios, setPrecios] = useState([]);

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [itemsRes, preciosRes] = await Promise.all([
          fetch('/items.json'),
          fetchDatosDesdeBackend()
        ]);

        const itemsJson = await itemsRes.json();
        console.log('✅ items.json cargado:', itemsJson.length);
        setItemsData(itemsJson);

        const preciosFiltrados = preciosRes.filter(entry => ciudades.includes(entry.city));
        console.log('📦 Datos filtrados desde backend:', preciosFiltrados.length);
        setPrecios(preciosFiltrados);
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
      }
    };

    cargarTodo();
  }, []);

  const fetchDatosDesdeBackend = async () => {
    for (const url of backends) {
      try {
        console.log(`🌐 Consultando: ${url}`);
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log(`✅ Datos recibidos de ${url}:`, data.length);
            return data;
          }
        } else {
          console.warn(`⚠️ ${url} respondió con error: ${res.status}`);
        }
      } catch (err) {
        console.error(`❌ Error al consultar ${url}:`, err);
      }
    }
    return [];
  };

  const obtenerNombreEImagen = (id) => {
    const item = itemsData.find(it => it.id === id);
    return item ? { nombre: item.nombre, imagen: item.imagen } : { nombre: id, imagen: '' };
  };

  const renderTopItems = (ciudad) => {
    const datosCiudad = precios.filter(item => item.city === ciudad);

    const topVenta = [...datosCiudad]
      .filter(i => i.sell_price_min > 0)
      .sort((a, b) => b.sell_price_min - a.sell_price_min)
      .slice(0, 5);

    const topCompra = [...datosCiudad]
      .filter(i => i.buy_price_max > 0)
      .sort((a, b) => b.buy_price_max - a.buy_price_max)
      .slice(0, 5);

    return (
      <div key={ciudad} style={{ marginBottom: 30 }}>
        <h2>📍 {ciudad}</h2>

        <h3>🛒 Top 5 en venta</h3>
        {topVenta.map((item, idx) => {
          const { nombre, imagen } = obtenerNombreEImagen(item.item_id);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
              <img src={imagen} alt={nombre} width={30} height={30} style={{ marginRight: 10 }} />
              <span>{nombre}: {item.sell_price_min.toLocaleString()} 🪙</span>
            </div>
          );
        })}

        <h3>💰 Top 5 en compra</h3>
        {topCompra.map((item, idx) => {
          const { nombre, imagen } = obtenerNombreEImagen(item.item_id);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
              <img src={imagen} alt={nombre} width={30} height={30} style={{ marginRight: 10 }} />
              <span>{nombre}: {item.buy_price_max.toLocaleString()} 🪙</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🏙️ Top precios por ciudad</h1>
      {ciudades.map(ciudad => renderTopItems(ciudad))}
    </div>
  );
}
