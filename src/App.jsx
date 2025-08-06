// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MarketPage from './pages/Market'
import IndexPage from './pages/Index'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/market" element={<MarketPage />} />
    </Routes>
  )
}

export default App
