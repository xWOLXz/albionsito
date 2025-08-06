import React from 'react'

const Loader = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <img src="/albion-loader.gif" alt="Cargando..." width={100} />
      <p>Cargando datos del mercado...</p>
    </div>
  )
}

export default Loader
