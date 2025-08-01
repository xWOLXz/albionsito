// /pages/market.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';

const CIUDADES = ['Bridgewatch', 'Martlock', 'Fort Sterling', 'Thetford', 'Lymhurst', 'Caerleon', 'Brecilien'];
const URL_BASE = 'https://west.albion-online-data.com/api/v2/stats/prices';
const IMAGE_URL = id => `https://render.albiononline.com/v1/item/${id}.png`;

export default function Market() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);

  const obtenerDatos = async () => {
    try {
      setCargando(true);

      // Lista base de ítems que quieres mostrar (puedes expandir)
      const idsBase = [
        'T4_BAG', 'T5_BAG', 'T6_BAG', 'T7_BAG', 'T8_BAG',
        'T4_CAPE', 'T5_CAPE', 'T6_CAPE', 'T7_CAPE', 'T8_CAPE',
        'T4_MAIN_SWORD', 'T5_MAIN_SWORD', 'T6_MAIN_SWORD',
        'T4_ARMOR_CLOTH_SET1', 'T5_ARMOR_CLOTH_SET1', 'T6_ARMOR_CLOTH_SET1',
        'T4_HEAD_CLOTH_SET1', 'T5_HEAD_CLOTH_SET1', 'T6_HEAD_CLOTH_SET1'
      ];

      const query = `${URL_BASE}/${idsBase.join(',')}?locations=${CIUDADES.join(',')}&qualities=1`;
      const res = await axios.get(query);
      const precios = res.data;

      const agrupado = {};

      precios.forEach(entry => {
        const id = entry.item_id;
        if (!agrupado[id]) agrupado[id] = [];
        agrupado[id].push(entry);
      });

      const procesado = Object.entries(agrupado).map(([id, data]) => {
        const minVenta = data.reduce((a, b) =>
          (b.sell_price_min > 0 && (a.sell_price_min === 0 || b.sell_price_min < a.sell_price_min)) ? b : a
        );
        const maxCompra = data.reduce((a, b) =>
          (b.buy_price_max > a.buy_price_max) ? b : a
        );
        const ganancia = minVenta.sell_price_min - maxCompra.buy_price_max;

        return {
          id,
          nombre: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icono: IMAGE_URL(id),
          ciudadVenta: minVenta.city,
          ciudadCompra: maxCompra.city,
          venta: minVenta.sell_price_min,
          compra: maxCompra.buy_price_max,
          ganancia
        };
      });

      const ordenado = procesado
        .filter(e => e.compra > 0 && e.venta > 0 && e.ganancia > 0)
        .sort((a, b) => b.ganancia - a.ganancia);

      setItems(ordenado);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const filtrados = items.filter(i =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-white">Market General</h1>
        <button onClick={obtenerDatos} className="text-white hover:text-yellow-300">
          <RefreshCw />
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar ítem..."
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <div className="flex justify-center items-center h-48">
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
              {filtrados.map((item, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-800">
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
