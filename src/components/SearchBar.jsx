import React, { useEffect, useState, useRef } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Buscar ítem...' }) {
  const [value, setValue] = useState('');
  const timer = useRef(null);

  // Debounce 3s
  useEffect(() => {
    if (!value || value.trim().length < 1) {
      // don't search empty
      onSearch('');
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onSearch(value.trim());
    }, 3000);

    return () => clearTimeout(timer.current);
  }, [value]);

  return (
    <div style={{display:'flex', gap:8}}>
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
