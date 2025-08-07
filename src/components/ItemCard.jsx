import React from 'react';

export default function ItemCard({ item, onSelect }) {
  return (
    <div className="card" style={{display:'flex', gap:10, alignItems:'center', cursor:'pointer'}} onClick={() => onSelect(item)}>
      <img src={item.imagen || item.icon || `https://render.albiononline.com/v1/item/${item.id || item.UniqueName}.png`} alt={item.nombre || item.UniqueName} width={48} height={48} />
      <div>
        <div style={{fontWeight:700}}>{item.nombre || item.LocalizedNames?.['ES-ES'] || item.UniqueName}</div>
        <div className="small">{item.id || item.UniqueName}</div>
      </div>
    </div>
  );
}
