import { useState, useEffect } from "react";

export default function Market() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    fetch("/items.json")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        console.log("✅ Items cargados:", data.length);
      })
      .catch((err) => console.error("Error cargando items.json:", err));
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setFiltered([]);
      return;
    }

    const resultados = items.filter((item) =>
      item.nombre.toLowerCase().includes(query.toLowerCase())
    );

    setFiltered(resultados);
  }, [query, items]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    fetch(
      `https://www.albion-online-data.com/api/v2/stats/prices/${item.id}.json`
    )
      .then((res) => res.json())
      .then((data) => {
        const sell = data
          .filter((d) => d.sell_price_min > 0)
          .sort((a, b) => a.sell_price_min - b.sell_price_min)[0];

        const buy = data
          .filter((d) => d.buy_price_max > 0)
          .sort((a, b) => b.buy_price_max - a.buy_price_max)[0];

        const margen =
          sell && buy ? sell.sell_price_min - buy.buy_price_max : null;

        setPrices({
          venta: sell?.sell_price_min || "—",
          ciudadVenta: sell?.city || "—",
          compra: buy?.buy_price_max || "—",
          ciudadCompra: buy?.city || "—",
          margen: margen ?? "—",
        });
      })
      .catch((err) => {
        console.error("Error consultando precios:", err);
        setPrices(null);
      });
  };

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">
        🔍 Buscar Ítem (desde items.json)
      </h1>

      <input
        type="text"
        className="w-full p-2 mb-4 text-black rounded"
        placeholder="Espada, capa, montura..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.slice(0, 30).map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className="bg-gray-800 hover:bg-gray-700 cursor-pointer p-2 rounded"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                loading="lazy"
                onError={(e) =>
                  (e.target.src = "/no-image.png") // Imagen fallback si no carga
                }
                className="w-full h-20 object-contain mb-2"
              />
              <p className="text-sm text-center">{item.nombre}</p>
            </div>
          ))}
        </div>
      )}

      {selectedItem && prices && (
        <div className="mt-8 bg-gray-900 p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">{selectedItem.nombre}</h2>
          <img
            src={selectedItem.imagen}
            alt={selectedItem.nombre}
            loading="lazy"
            onError={(e) => (e.target.src = "/no-image.png")}
            className="w-24 h-24 mb-2"
          />
          <p>
            💰 <strong>Venta más baja:</strong> {prices.venta} (
            {prices.ciudadVenta})
          </p>
          <p>
            🛒 <strong>Compra más alta:</strong> {prices.compra} (
            {prices.ciudadCompra})
          </p>
          <p>
            📈 <strong>Margen estimado:</strong>{" "}
            <span
              className={
                prices.margen > 0
                  ? "text-green-400"
                  : prices.margen < 0
                  ? "text-red-400"
                  : "text-white"
              }
            >
              {prices.margen}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
