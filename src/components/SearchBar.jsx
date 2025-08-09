import React, { useState, useEffect, useRef } from 'react';

export default function SearchBar({ onSearch, placeholder, items, onSelect, selected }) {
  const [inputValue, setInputValue] = useState('');
  const [showList, setShowList] = useState(false);
  const containerRef = useRef(null);

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(inputValue.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue, onSearch]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowList(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When external selected changes, update input text
  useEffect(() => {
    if (selected) {
      const name = selected.nombre || selected.LocalizedNames?.['ES-ES'] || selected.id || '';
      setInputValue(name);
      setShowList(false);
    }
  }, [selected]);

  const handleSelect = (item) => {
    onSelect(item);
    setShowList(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', maxWidth: 400 }}>
      <input
        type="text"
        value={inputValue}
        placeholder={placeholder || 'Buscar...'}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowList(true);
          onSelect(null); // clear selection on typing
        }}
        onFocus={() => setShowList(true)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #555',
          backgroundColor: '#111',
          color: '#fff',
          fontSize: 16,
        }}
        spellCheck={false}
        autoComplete="off"
      />

      {showList && items && items.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: 250,
            overflowY: 'auto',
            backgroundColor: '#222',
            borderRadius: 8,
            boxShadow: '0 0 8px rgba(0,0,0,0.6)',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            zIndex: 9999,
          }}
        >
          {items.slice(0, 50).map((item) => {
            const name = item.nombre || item.LocalizedNames?.['ES-ES'] || item.id || item.UniqueName || '';
            const isSelected = selected && (selected.id === item.id || selected.UniqueName === item.UniqueName);
            return (
              <li
                key={item.id || item.UniqueName || name}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#555' : 'transparent',
                  color: '#eee',
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelect(item);
                }}
              >
                {name}
              </li>
            );
          })}
        </ul>
      )}

      {showList && items && items.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#222',
            borderRadius: 8,
            padding: 12,
            color: '#aaa',
            fontStyle: 'italic',
          }}
        >
          No hay resultados
        </div>
      )}
    </div>
  );
}
