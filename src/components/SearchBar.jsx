import React, { useState, useContext, useEffect } from "react";
import { AlbionContext } from "../context/AlbionContext";

const SearchBar = () => {
  const { searchItems } = useContext(AlbionContext);
  const [query, setQuery] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (query.trim() === "") {
      searchItems("");
      return;
    }

    const timeout = setTimeout(() => {
      searchItems(query);
    }, 3000); // espera 3 segundos después de dejar de escribir

    setDebounceTimeout(timeout);
  }, [query]);

  return (
    <input
      type="text"
      placeholder="Buscar ítem..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full p-2 border rounded"
    />
  );
};

export default SearchBar;
