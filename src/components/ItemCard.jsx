import React, { useState, useEffect } from 'react';

export default function ItemCard({ itemId, itemName, itemIcon, quality, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/prices?item=${itemId}&quality=${quality || 1}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error obteniendo datos del backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId, quality]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-lg mx-auto relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        ✕
      </button>

      <div className="flex items-center space-x-4">
        <img
          src={itemIcon}
          alt={itemName}
          className="w-12 h-12 object-contain"
        />
        <h2 className="text-xl font-bold">{itemName}</h2>
      </div>

      {loading ? (
        <div className="text-center py-4">Buscando precios...</div>
      ) : data && Object.keys(data).length > 0 ? (
        <div className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold">💹 Comparativa por ciudad</h3>

          <table className="w-full border border-gray-700 text-sm">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 px-2 py-1">Ciudad</th>
                <th className="border border-gray-700 px-2 py-1">Venta más barata</th>
                <th className="border border-gray-700 px-2 py-1">Compra más cara</th>
                <th className="border border-gray-700 px-2 py-1">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([city, info]) => (
                <tr key={city} className="text-center">
                  <td className="border border-gray-700 px-2 py-1">{city}</td>
                  <td className="border border-gray-700 px-2 py-1">
                    {info.orden_venta?.[0]?.precio
                      ? `${info.orden_venta[0].precio.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {info.orden_compra?.[0]?.precio
                      ? `${info.orden_compra[0].precio.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {info.actualizado
                      ? new Date(info.actualizado).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4">No se encontraron precios</div>
      )}
    </div>
  );
}
