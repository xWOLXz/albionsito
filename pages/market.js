// pages/market.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';

const API_URL = 'https://albionsito-backend.kevin.repl.co/precios'; // Replit API tuya
const ITEM_NAMES_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json';

const Market = () => {
  const [datos, setDatos] = useState([]);
  const [nombres, setNombres] = useState({});
  const [cargando, setCargando] = useState(false);

  const getNombreItem = (itemId) => {
    const entry = nombres[itemId];
    return entry && entry.LocalizedNames && entry.LocalizedNames['ES-ES']
      ? entry.LocalizedNames['ES-ES']
      : itemId.replace(/_/g, ' ').toLowerCase();
  };

  const obtenerDatos = async () => {
    setCargando(true);
    try {
      const [preciosRes, nombresRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(ITEM_NAMES_URL),
      ]);

      const nombresMap = {};
      nombresRes.data.forEach(item => {
        if (item.UniqueName) {
          nombresMap[item.UniqueName] = item;
        }
      });

      setNombres(nombresMap);

      const procesado = preciosRes.data.map(item => {
        const precios = item.precios;

        const minVenta = precios.reduce((acc, p) =>
          (p.sell_price_min > 0 && (acc.sell_price_min === 0 || p.sell_price_min < acc.sell_price_min)) ? p : acc
        );

        const maxCompra = precios.reduce((acc, p) =>
          (p.buy_price_max > acc.buy_price_max) ? p : acc
        );

        const ganancia = minVenta.sell_price_min - maxCompra.buy_price_max;

        return {
          id: item.item,
          nombre: getNombreItem(item.item),
          icono: `https://render.albiononline.com/v1/item/${item.item}.png`,
          ciudadVenta: minVenta.city,
          ciudadCompra: maxCompra.city,
          venta: minVenta.sell_price_min,
          compra: maxCompra.buy_price_max,
          ganancia
        };
      });

      const ordenado = procesado
        .filter(e => e.compra > 0 && e.venta > 0 && e.ganancia > 0)
        .sort((a, b) => b.ganancia - a.ganancia)
        .slice(0, 30);

      setDatos(ordenado);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setCargando(false);
    }
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
};

export default Market;
