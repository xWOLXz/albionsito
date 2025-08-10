import React, { useState } from "react";

export default function Market() {
  const [itemId, setItemId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!itemId.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Cambia esta URL por la de tu nuevo backend Market en Vercel o Render
      const res = await fetch(`https://TU_BACKEND_MARKET_URL/api/market/${itemId}`);
      if (!res.ok) throw new Error("Error al obtener datos");

      const json = await res.json();
      setData(json.results);
    } catch (err) {
      setError("No se pudo obtener información del mercado");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📦 Market Albion</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Ej: T4_BAG"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {loading && <p>⏳ Cargando datos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data && (
        <div>
          {data.map((ciudad) => (
            <div key={ciudad.city} className="mb-6 border p-4 rounded">
              <h2 className="font-bold text-lg mb-2">{ciudad.city}</h2>

              <div>
                <h3 className="font-semibold">🛒 Últimos 5 precios de venta:</h3>
                <ul className="list-disc ml-5">
                  {ciudad.sellPrices.length > 0 ? (
                    ciudad.sellPrices.map((p, i) => (
                      <li key={i}>
                        {p.price} plata — {new Date(p.timestamp).toLocaleString()}
                      </li>
                    ))
                  ) : (
                    <li>No hay datos</li>
                  )}
                </ul>
              </div>

              <div className="mt-3">
                <h3 className="font-semibold">💰 Últimos 5 precios de compra:</h3>
                <ul className="list-disc ml-5">
                  {ciudad.buyPrices.length > 0 ? (
                    ciudad.buyPrices.map((p, i) => (
                      <li key={i}>
                        {p.price} plata — {new Date(p.timestamp).toLocaleString()}
                      </li>
                    ))
                  ) : (
                    <li>No hay datos</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
