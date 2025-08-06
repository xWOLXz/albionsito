import React from 'react'

const SearchBar = ({ onSearch }) => {
  return (
    <input
      type="text"
      placeholder="Buscar ítem..."
      onChange={(e) => onSearch(e.target.value)}
      style={{ width: '100%', marginBottom: '1rem' }}
    />
  )
}

export default SearchBar
