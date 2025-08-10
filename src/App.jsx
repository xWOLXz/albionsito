import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AlbionProvider } from "./context/AlbionContext";
import Market from "./pages/Market";

function App() {
  return (
    <AlbionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Market />} />
        </Routes>
      </Router>
    </AlbionProvider>
  );
}

export default App;
