import React from 'react';

const ItemCard = ({ item, onSelect }) => {
  if (!item) return null;

  // Datos seguros para evitar "undefined"
  const nombre = item.nombre || item.item_id || 'Ítem desconocido';
  const icono = item.icon_url || `https://render.albiononline.com/v1/item/${item.item_id}.png`;
  const calidad = item.calidad || 'Base';
  const encantamiento = item.encantamiento || 'Base';

  const venta = item.minSellPrice || 0;
  const compra = item.maxBuyPrice || 0;
  const ciudadVenta = item.ciudadMinSell || '—';
  const ciudadCompra = item.ciudadMaxBuy || '—';

  // Margen de ganancia
  const margen = venta && compra ? (venta - compra) : 0;
  const margenColor = margen > 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div
      className="bg-gray-900 text-white rounded-lg shadow-lg p-4 flex flex-col items-center hover:bg-gray-800 cursor-pointer transition"
      onClick={() => onSelect(item)}
    >
      <img src={icono} alt={nombre} className="w-16 h-16 mb-2" />
      <h3 className="font-bold text-center">{nombre}</h3>
      <p className="text-sm text-gray-400">Encantamiento: {encantamiento}</p>
      <p className="text-sm text-gray-400">Calidad: {calidad}</p>

      <div className="mt-2 w-full">
        <p>💰 Venta más baja: {venta.toLocaleString()} <span className="text-xs">({ciudadVenta})</span></p>
        <p>🛒 Compra más alta: {compra.toLocaleString()} <span className="text-xs">({ciudadCompra})</span></p>
        <p className={`${margenColor} font-bold`}>📈 Margen: {margen.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ItemCard;
