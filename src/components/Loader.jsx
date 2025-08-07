import React from 'react';
export default function Loader() {
  return (
    <div style={{textAlign:'center', padding:20}}>
      <img src="/albion-loader.gif" alt="cargando" style={{width:72}} />
      <div className="small">Cargando...</div>
    </div>
  );
}
