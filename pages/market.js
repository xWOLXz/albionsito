// pages/market.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';

const CITIES = ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Caerleon'];
const IMAGE_URL = id => `https://render.albiononline.com/v1/item/${id}.png`;
const API_URL = (itemId) =>
  `https://www.albion-online-data.com/api/v2/stats/prices/${itemId}.json?locations=${CITIES.join(',')}`;

const ITEMS = [
  'T4_BAG', 'T5_BAG', 'T6_BAG', 'T7_BAG', 'T8_BAG',
  'T4_CAPE', 'T5_CAPE', 'T6_CAPE', 'T7_CAPE', 'T8_CAPE',
  'T4_MOUNT_HORSE', 'T5_MOUNT_HORSE', 'T6_MOUNT_OX',
  'T4_MEAL_SOUP', 'T5_MEAL_SOUP', 'T6_MEAL_SOUP',
  'T4_POTION_HEAL', 'T5_POTION_HEAL', 'T6_POTION_HEAL'
];

export default function Market() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const obtenerDatos = async () => {
    setCargando(true);
    const resultados = [];

    for (const item of ITEMS) {
      try {
        const res = await axios.get(API_URL(item));
        const precios = res.data;

        const minVenta = precios.reduce((acc, p) =>
          p.sell_price_min > 0 && (acc.sell_price_min === 0 || p.sell_price_min < acc.sell_price_min) ? p : acc,
          { sell_price_min: 0 }
        );

        const maxCompra = precios.reduce((acc, p) =>
          p.buy_price_max > acc.buy_price_max ? p : acc,
          { buy_price_max: 0 }
        );

        const ganancia = minVenta.sell_price_min - maxCompra.buy_price_max;

        if (maxCompra.buy_price_max > 0 && minVenta.sell_price_min > 0 && ganancia > 0) {
          resultados.push({
            id: item,
            nombre: item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            icono: IMAGE_URL(item),
            venta: minVenta.sell_price_min,
            ciudadVenta: minVenta.city,
            compra: maxCompra.buy_price_max,
            ciudadCompra: maxCompra.city,
            ganancia
          });
        }
      } catch (err) {
        console.error(`Error con ${item}:`, err.message);
      }
    }

    setDatos(resultados.sort((a, b) => b.ganancia - a.ganancia));
    setCargando(false);
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Market General</h1>
        <button onClick={obtenerDatos} className="text-white hover:text-yellow-300 transition">
          <RefreshCw />
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center items-center h-64">
          <img src="/albion-loader.gif" alt="Cargando..." className="w-24 h-24" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead>
              <tr className="bg-gray-800">
                <th className="px-4 py-2 text-left">Ítem</th>
                <th className="px-4 py-2 text-right">Compra ↑</th>
                <th className="px-4 py-2 text-right">Venta ↓</th>
                <th className="px-4 py-2 text-right">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-800 transition">
                  <td className="flex items-center gap-2 px-4 py-2">
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
      )}
    </div>
  );
}
