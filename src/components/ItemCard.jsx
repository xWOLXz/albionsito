export default function ItemCard({ item, prices }) {
  if (prices.length === 0) return <p>No hay datos de precios.</p>;

  const sell = prices.filter((p) => p.sell_price_min > 0);
  const buy = prices.filter((p) => p.buy_price_max > 0);

  const bestSell = sell.reduce((min, p) => (p.sell_price_min < min.sell_price_min ? p : min), sell[0]);
  const bestBuy = buy.reduce((max, p) => (p.buy_price_max > max.buy_price_max ? p : max), buy[0]);

  const profit = bestSell && bestBuy ? bestSell.sell_price_min - bestBuy.buy_price_max : 0;

  return (
    <div className="border p-4 rounded shadow">
      <div className="flex items-center gap-4">
        <img
          src={`https://render.albiononline.com/v1/item/${item.uniqueName}.png`}
          alt={item.name}
          className="w-16 h-16"
        />
        <div>
          <p><strong>Nombre:</strong> {item.name}</p>
          {bestSell && (
            <p>
              <strong>Venta más baja:</strong> {bestSell.sell_price_min.toLocaleString()} en {bestSell.city}
            </p>
          )}
          {bestBuy && (
            <p>
              <strong>Compra más alta:</strong> {bestBuy.buy_price_max.toLocaleString()} en {bestBuy.city}
            </p>
          )}
          {profit > 0 && (
            <p className="text-green-600 font-bold">
              Ganancia potencial: {profit.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
