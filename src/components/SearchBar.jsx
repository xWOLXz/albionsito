import React, { useState, useEffect } from 'react';

export default function SearchBar({ items, onSearch, placeholder }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!input) {
      setSuggestions([]);
      onSearch('');
      return;
    }
    const lower = input.toLowerCase();
    const filtered = items.filter(item => {
      const name = item.nombre?.toLowerCase() || item.LocalizedNames?.['ES-ES']?.toLowerCase() || '';
      return name.includes(lower);
    });
    setSuggestions(filtered.slice(0, 10)); // máximo 10 sugerencias
  }, [input, items, onSearch]);

  function handleSelect(item) {
    setInput(item.nombre || item.LocalizedNames?.['ES-ES'] || '');
    setSuggestions([]);
    onSearch(item.id || item.UniqueName || '');
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{ width: '100%', padding: '8px', borderRadius: 6, background: '#111', color: '#eee', border: '1px solid #444' }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            backgroundColor: '#222',
            width: '100%',
            maxHeight: 200,
            overflowY: 'auto',
            borderRadius: 6,
            padding: 0,
            margin: 0,
            listStyle: 'none',
            zIndex: 100,
            border: '1px solid #444',
          }}
        >
          {suggestions.map(item => (
            <li
              key={item.id || item.UniqueName}
              onClick={() => handleSelect(item)}
              style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #333' }}
              onMouseDown={e => e.preventDefault()} // para evitar que input pierda foco antes del click
            >
              {item.nombre || item.LocalizedNames?.['ES-ES'] || item.id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
