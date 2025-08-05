// Procesar datos para tabla
const procesarDatos = () => {
  const resultado = filteredItems.map((item) => {
    const relacionados = backendData.filter((entry) => entry.item_id === item.id);

    let mejorCompra = null;
    let mejorVenta = null;

    relacionados.forEach((entry) => {
      if (
        entry.buy_price_max > 0 &&
        (!mejorCompra || entry.buy_price_max > mejorCompra.price)
      ) {
        mejorCompra = {
          price: entry.buy_price_max,
          city: entry.city,
        };
      }

      if (
        entry.sell_price_min > 0 &&
        (!mejorVenta || entry.sell_price_min < mejorVenta.price)
      ) {
        mejorVenta = {
          price: entry.sell_price_min,
          city: entry.city,
        };
      }
    });

    const ganancia =
      mejorCompra && mejorVenta
        ? mejorVenta.price - mejorCompra.price
        : null;

    if (ganancia !== null) {
      console.log(`📊 ${item.nombre} — Compra: ${mejorCompra?.price}, Venta: ${mejorVenta?.price}, Ganancia: ${ganancia}`);
    }

    return {
      id: item.id,
      name: item.nombre || item.id,
      icon: item.imagen || item.icon || item.id + '.png',
      compra: mejorCompra,
      venta: mejorVenta,
      ganancia,
    };
  });

  const filtrado = resultado.filter((item) => item.ganancia !== null && item.ganancia > 0);
  console.log('✅ Ítems finales a mostrar:', filtrado.length);
  return filtrado;
};
