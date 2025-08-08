import React from 'react';

const formatNumber = (num) =>
  num?.toLocaleString('es-CO', { maximumFractionDigits: 0 }) || '—';

const ItemCard = ({ item, backend1Data, backend2Data }) => {
  const renderBackendBlock = (backendName, data, color) => {
    if (!data || !data[item.UniqueName]) return null;

    const itemData = data[item.UniqueName];

    return (
      <div className={`rounded-xl p-3 mb-2 border-2`} style={{ borderColor: color }}>
        <h3 className="text-sm font-bold" style={{ color }}>{backendName}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm mt-1">
          <div>
            <p>🟢 Compra más alta: <br />
              <span className="font-semibold">
                {formatNumber(itemData.maxBuyPrice)} ({itemData.maxBuyCity || '—'})
              </span>
            </p>
            <p>🔴 Venta más baja: <br />
              <span className="font-semibold">
                {formatNumber(itemData.minSellPrice)} ({itemData.minSellCity || '—'})
              </span>
            </p>
          </div>
          <div>
            <p>💰 Margen: <br />
              <span className="font-semibold">
                {formatNumber(itemData.margin)} (ganancia)
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-md flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <img
          src={`https://render.albiononline.com/v1/item/${item.UniqueName}.png`}
          alt={item.LocalizedNames['ES-ES']}
          className="w-10 h-10"
        />
        <h2 className="text-lg font-bold">{item.LocalizedNames['ES-ES']}</h2>
      </div>
      {renderBackendBlock('API Oficial', backend1Data, '#4ade80')}
      {renderBackendBlock('API Alternativa', backend2Data, '#60a5fa')}
    </div>
  );
};

export default ItemCard;
