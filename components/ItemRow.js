import React from 'react';

const ItemRow = ({ item }) => {
  const {
    item_id,
    name,
    image,
    minSellPrice,
    minSellCity,
    maxBuyPrice,
    maxBuyCity,
    profit,
  } = item;

  return (
    <tr className="text-sm border-b border-gray-700 hover:bg-gray-800 transition duration-150">
      <td className="px-2 py-2 flex items-center gap-2">
        <img src={image} alt={name} className="w-6 h-6" />
        <span>{name}</span>
      </td>
      <td className="px-2 py-2 text-center">
        <span>{minSellPrice.toLocaleString()}₳</span><br />
        <small className="text-gray-400">{minSellCity}</small>
      </td>
      <td className="px-2 py-2 text-center">
        <span>{maxBuyPrice.toLocaleString()}₳</span><br />
        <small className="text-gray-400">{maxBuyCity}</small>
      </td>
      <td className={`px-2 py-2 text-center font-bold ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {profit.toLocaleString()}₳
      </td>
    </tr>
  );
};

export default ItemRow;
