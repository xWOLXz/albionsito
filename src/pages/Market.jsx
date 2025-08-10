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
    setData(null);

    try {
      const res = await fetch(`https://albionsito-backend.onrender.com/api/market/${itemId}`);
      if (!res.ok) throw new Error("Error al obtener datos");

      const json = await res.json();

      if (!json || json.length === 0) {
        setError("No se encontró información para ese ítem.");
        setData(null);
      } else {
        // Convertir cities object a array con ciudad incluida
        const citiesObj = json[0].cities || {};
        const citiesArray = Object.entries(citiesObj).map(([city, prices]) => ({
          city,
          sellPrices: prices.sellPrices || [],
          buyPrices: prices.buyPrices || [],
        }));

        setData(citiesArray);
      }
    } catch (err) {
      setError("No se pudo obtener información del mercado");
      console.error(err);
      setData(null);
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

      {data && data.length > 0 && (
        <div>
          {data.map(({ city, sellPrices, buyPrices }) => (
            <div key={city} className="mb-6 border p-4 rounded">
              <h2 className="font-bold text-lg mb-2">{city}</h2>

              <div>
                <h3 className="font-semibold">🛒 Últimos 5 precios de venta:</h3>
                <ul className="list-disc ml-5">
                  {sellPrices.length > 0 ? (
                    sellPrices.map((p, i) => (
                      <li key={i}>
                        {p.price} plata — {new Date(p.date).toLocaleString()}
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
                  {buyPrices.length > 0 ? (
                    buyPrices.map((p, i) => (
                      <li key={i}>
                        {p.price} plata — {new Date(p.date).toLocaleString()}
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
