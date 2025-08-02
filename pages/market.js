// pages/market.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';

const CITIES = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst'];
const ITEMS_POR_PAGINA = 30;

const traducirNombre = (nombre) => {
  return nombre
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace('T4 ', 'Tier 4 ')
    .replace('T5 ', 'Tier 5 ')
    .replace('T6 ', 'Tier 6 ')
    .replace('T7 ', 'Tier 7 ')
    .replace('T8 ', 'Tier 8 ');
};

const Market = () => {
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const ITEMS = [
    // Lista de ítems ejemplo (debes expandir con más desde albion2d si quieres más)
    "T4_BAG", "T4_CAPE", "T4_HEAD_PLATE_SET1", "T4_ARMOR_PLATE_SET1", "T4_SHOES_PLATE_SET1",
    "T4_HEAD_LEATHER_SET1", "T4_ARMOR_LEATHER_SET1", "T4_SHOES_LEATHER_SET1", "T4_HEAD_CLOTH_SET1", "T4_ARMOR_CLOTH_SET1",
    "T4_SHOES_CLOTH_SET1", "T4_2H_BOW", "T4_2H_SWORD", "T4_2H_FIRESTAFF", "T4_2H_CROSSBOW",
    "T4_2H_HALBERD", "T4_2H_CURSEDSTAFF", "T4_2H_HOLYSTAFF", "T4_2H_QUARTERSTAFF", "T4_2H_NATURESTAFF",
    "T4_2H_HAMMER", "T4_2H_AXE", "T4_2H_DAGGER", "T4_2H_SPEAR", "T4_2H_MACE",
    "T4_MAIN_SWORD", "T4_MAIN_FIRESTAFF", "T4_MAIN_CURSEDSTAFF", "T4_MAIN_NATURESTAFF", "T4_MAIN_DAGGER"
  ];

  const obtenerDatos = async () => {
    try {
      setCargando(true);

      const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
      const actual = ITEMS.slice(inicio, inicio + ITEMS_POR_PAGINA);

      const res = await axios.get(`https://www.albion-online-data.com/api/v2/stats/prices/${actual.join(',')}?locations=${CITIES.join(',')}&qualities=1`);
      const precios = res.data;

      const agrupados = actual.map((item) => {
        const preciosItem = precios.filter(p => p.item_id === item);

        const minVenta = preciosItem.reduce((acc, val) =>
          val.sell_price_min > 0 && (acc.sell_price_min === 0 || val.sell_price_min < acc.sell_price_min) ? val : acc,
          { sell_price_min: 0 }
        );

        const maxCompra = preciosItem.reduce((acc, val) =>
          val.buy_price_max > acc.buy_price_max ? val : acc,
          { buy_price_max: 0 }
        );

        const ganancia = minVenta.sell_price_min - maxCompra.buy_price_max;

        return {
          id: item,
          nombre: traducirNombre(item),
          icono: `https://render.albiononline.com/v1/item/${item}.png`,
          venta: minVenta.sell_price_min,
          compra: maxCompra.buy_price_max,
          ciudadVenta: minVenta.city,
          ciudadCompra: maxCompra.city,
          ganancia
        };
      });

      const ordenados = agrupados
        .filter(item => item.venta > 0 && item.compra > 0 && item.ganancia > 0)
        .sort((a, b) => b.ganancia - a.ganancia);

      setDatos(ordenados);
      setCargando(false);
    } catch (err) {
      console.error("Error al cargar precios:", err);
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, [pagina]);

  return (
    <div className="p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Market General</h1>
        <button onClick={obtenerDatos} className="hover:text-yellow-300 transition">
          <RefreshCw />
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center items-center h-64">
          <img src="/albion-loader.gif" alt="Cargando..." className="w-20 h-20" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-4 py-2 text-left">Ítem</th>
                  <th className="px-4 py-2 text-right">Compra ↑</th>
                  <th className="px-4 py-2 text-right">Venta ↓</th>
                  <th className="px-4 py-2 text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((item, i) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <img src={item.icono} alt={item.nombre} className="w-6 h-6" />
                      {item.nombre}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {item.compra.toLocaleString()} <br />
                      <span className="text-xs text-gray-400">{item.ciudadCompra}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {item.venta.toLocaleString()} <br />
                      <span className="text-xs text-gray-400">{item.ciudadVenta}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-green-400">
                      {item.ganancia.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4 gap-2">
            <button
              className="bg-gray-700 px-4 py-1 rounded hover:bg-yellow-500 transition"
              onClick={() => setPagina(p => Math.max(p - 1, 1))}
              disabled={pagina === 1}
            >
              Anterior
            </button>
            <span className="px-4 py-1">{pagina}</span>
            <button
              className="bg-gray-700 px-4 py-1 rounded hover:bg-yellow-500 transition"
              onClick={() => setPagina(p => p + 1)}
              disabled={(pagina * ITEMS_POR_PAGINA) >= ITEMS.length}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Market;
