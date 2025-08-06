import React from 'react'

const ItemCard = ({ item }) => {
  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      marginBottom: '1rem',
      padding: '1rem',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <img src={item.image} alt={item.name} width={50} height={50} />
      <div>
        <h3>{item.name}</h3>
        <p>Precio de Venta: {item.sellPrice.toLocaleString()} plata ({item.sellCity})</p>
        <p>Precio de Compra: {item.buyPrice.toLocaleString()} plata ({item.buyCity})</p>
        <p>Ganancia: {item.profit.toLocaleString()} plata</p>
      </div>
    </div>
  )
}

export default ItemCard
