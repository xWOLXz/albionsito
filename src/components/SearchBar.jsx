import React, { useEffect, useState, useRef } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Buscar ítem...' }) {
  const [value, setValue] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    if (!value || value.trim().length < 1) {
      onSearch('');
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(value.trim()), 800); // 800ms debounce (más responsivo)
    return () => clearTimeout(timer.current);
  }, [value]);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
