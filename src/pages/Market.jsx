import React, { useEffect, useState } from 'react'
import ItemCard from '../components/ItemCard'
import Loader from '../components/Loader'
import SearchBar from '../components/SearchBar'

const Market = () => {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resItems = await fetch('/items.json')
        const allItems = await resItems.json()

        const itemIds = allItems.map((item) => item.id).join(',')
        const resPrices = await fetch(`https://west.albion-online-data.com/api/v2/stats/prices/${itemIds}?locations=Caerleon,Bridgewatch,Martlock,FortSterling,Lymhurst,Thetford`)
        const priceData = await resPrices.json()

        const enrichedItems = allItems.map((item) => {
          const related = priceData.filter(p => p.item_id === item.id)

          const sell = related.filter(e => e.sell_price_min > 0)
          const buy = related.filter(e => e.buy_price_max > 0)

          const bestSell = sell.sort((a, b) => a.sell_price_min - b.sell_price_min)[0]
          const bestBuy = buy.sort((a, b) => b.buy_price_max - a.buy_price_max)[0]

          const profit = (bestBuy?.buy_price_max || 0) - (bestSell?.sell_price_min || 0)

          return {
            ...item,
            sellPrice: bestSell?.sell_price_min || 0,
            sellCity: bestSell?.city || '',
            buyPrice: bestBuy?.buy_price_max || 0,
            buyCity: bestBuy?.city || '',
            profit
          }
        })

        const sorted = enrichedItems
          .filter(e => e.sellPrice > 0 && e.buyPrice > 0 && e.profit > 0)
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 30)

        setItems(sorted)
        setFilteredItems(sorted)
        setLoading(false)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (query) => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredItems(filtered)
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Market General - Albion</h1>
      <SearchBar onSearch={handleSearch} />
      {loading ? (
        <Loader />
      ) : (
        filteredItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))
      )}
    </div>
  )
}

export default Market
