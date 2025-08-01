// utils/itemsMarketFromAlbion2D.js

import itemsSeleccionados from './itemsSeleccionados27bloques';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function procesarEnLotes(lista, tamanoLote, procesarFn) {
  const resultados = [];

  for (let i = 0; i < lista.length; i += tamanoLote) {
    const lote = lista.slice(i, i + tamanoLote);
    const resultadosLote = await Promise.all(lote.map(procesarFn));
    resultados.push(...resultadosLote.filter(Boolean));
    await delay(1200); // Espera 1.2 segundos entre cada lote
  }

  return resultados;
}

export async function obtenerItemsMarket() {
  const ciudades = ["Bridgewatch", "Martlock", "Thetford", "Fort Sterling", "Lymhurst"];
  const calidad = 1;

  const resultados = await procesarEnLotes(items, 5, async (item) => {
    try {
      const ciudadDatos = await Promise.all(
        ciudades.map(async (ciudad) => {
          const res = await fetch(
            `https://west.albion-online-data.com/api/v2/stats/prices/${item.id}.json?locations=${ciudad.toLowerCase()}&qualities=${calidad}`
          );
          return await res.json();
        })
      );

      const todos = ciudadDatos.flat();
      const ventas = todos.filter((d) => d.sell_price_min > 0);
      const compras = todos.filter((d) => d.buy_price_max > 0);

      if (ventas.length === 0 || compras.length === 0) return null;

      const ventaMax = ventas.reduce((prev, curr) =>
        prev.sell_price_min > curr.sell_price_min ? prev : curr
      );
      const compraMin = compras.reduce((prev, curr) =>
        prev.buy_price_max < curr.buy_price_max ? prev : curr
      );

      const ganancia = ventaMax.sell_price_min - compraMin.buy_price_max;

      return {
        nombre: item.nombre,
        id: item.id,
        imagen: `https://render.albiononline.com/v1/item/${item.id}.png`,
        ciudadVenta: ventaMax.city,
        ciudadCompra: compraMin.city,
        precioVenta: ventaMax.sell_price_min,
        precioCompra: compraMin.buy_price_max,
        ganancia,
      };
    } catch (error) {
      console.error(`Error con el item ${item.id}:`, error);
      return null;
    }
  });

  const ordenados = resultados.sort((a, b) => b.ganancia - a.ganancia);
  return ordenados.slice(0, 100);
}
