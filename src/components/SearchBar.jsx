import { useState, useEffect } from 'react';

export default function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(term);
    }, 3000); // 3 segundos

    return () => clearTimeout(delayDebounce);
  }, [term]);

  return (
    <input
      type="text"
      value={term}
      onChange={(e) => setTerm(e.target.value)}
      placeholder="Buscar ítem..."
      className="w-full p-2 border rounded text-center"
    />
  );
}
