import React from 'react';

function ItemTable({ items }) {
  const formatear = (num) => num?.toLocaleString('es-CO');

  const agrupados = {};

  items.forEach(item => {
    const id = item.item_id;
    if (!agrupados[id]) {
      agrupados[id] = {
        item_id: id,
        lowestSell: item.sell_price_min,
        lowestCity: item.city,
        highestBuy: item.buy_price_max,
        highestCity: item.city,
        margin: item.sell_price_min - item.buy_price_max
      };
    } else {
      if (item.sell_price_min < agrupados[id].lowestSell) {
        agrupados[id].lowestSell = item.sell_price_min;
        agrupados[id].lowestCity = item.city;
      }
      if (item.buy_price_max > agrupados[id].highestBuy) {
        agrupados[id].highestBuy = item.buy_price_max;
        agrupados[id].highestCity = item.city;
      }
      agrupados[id].margin = agrupados[id].lowestSell - agrupados[id].highestBuy;
    }
  });

  const lista = Object.values(agrupados)
    .filter(i => i.lowestSell > 0 && i.highestBuy > 0)
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 30);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Item ID</th>
            <th className="p-2 border">Venta + Barata</th>
            <th className="p-2 border">Ciudad</th>
            <th className="p-2 border">Compra + Cara</th>
            <th className="p-2 border">Ciudad</th>
            <th className="p-2 border">Ganancia</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((item, idx) => (
            <tr key={idx} className="text-center">
              <td className="p-2 border">{item.item_id}</td>
              <td className="p-2 border">{formatear(item.lowestSell)}₰</td>
              <td className="p-2 border">{item.lowestCity}</td>
              <td className="p-2 border">{formatear(item.highestBuy)}₰</td>
              <td className="p-2 border">{item.highestCity}</td>
              <td className="p-2 border font-bold text-green-600">{formatear(item.margin)}₰</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ItemTable;
