import React, { createContext, useContext, useState } from 'react';

const AlbionContext = createContext();

export const useAlbion = () => useContext(AlbionContext);

export function AlbionProvider({ children }) {
  const [backend1Ready, setBackend1Ready] = useState(false);
  const [backend2Ready, setBackend2Ready] = useState(false);

  return (
    <AlbionContext.Provider value={{ backend1Ready, setBackend1Ready, backend2Ready, setBackend2Ready }}>
      {children}
    </AlbionContext.Provider>
  );
}
