import React from 'react';

const ItemCard = ({ item, onSelect }) => {
  const nombreItem =
    item.nombre ||
    item.LocalizedNames?.['ES-ES'] ||
    item.name ||
    item.id ||
    item.UniqueName ||
    'Ítem';

  const imagenItem =
    item.imagen ||
    `https://render.albiononline.com/v1/item/${item.id || item.UniqueName}.png`;

  return (
    <div
      className="bg-zinc-900 text-white p-4 rounded-xl shadow-md flex flex-col gap-2 cursor-pointer hover:bg-zinc-800 transition"
      onClick={() => onSelect && onSelect(item)}
    >
      <div className="flex items-center gap-3">
        <img src={imagenItem} alt={nombreItem} className="w-10 h-10" />
        <div>
          <h2 className="text-lg font-bold">{nombreItem}</h2>
          <div className="small">{item.id || item.UniqueName}</div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
