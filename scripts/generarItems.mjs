import fetch from 'node-fetch';
import fs from 'fs';

async function generarItems() {
  console.log('📦 Descargando datos de Albion...');

  try {
    const response = await fetch('https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json');
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('❌ Error: la respuesta no es un array. Recibido:', data);
      return;
    }

    const itemsFiltrados = data.filter((item) =>
      item.UniqueName &&
      !item.UniqueName.includes("SKIN") &&
      !item.UniqueName.includes("TOKEN") &&
      !item.UniqueName.includes("JOURNAL") &&
      !item.UniqueName.includes("TROPHY") &&
      !item.UniqueName.includes("FARMABLE") &&
      !item.UniqueName.includes("AVATAR") &&
      !item.UniqueName.includes("FISH") &&
      !item.UniqueName.includes("QUEST") &&
      !item.UniqueName.includes("LABORER") &&
      !item.UniqueName.includes("GUILD") &&
      !item.UniqueName.includes("EXAMPLE") &&
      !item.UniqueName.includes("D_UNNAMED") &&
      !item.UniqueName.includes("CHEST") &&
      !item.UniqueName.includes("F_")
    );

    const itemsSimplificados = itemsFiltrados.map((item) => ({
      id: item.UniqueName,
      nombre: item.LocalizedNames?.["ES-ES"] || item.LocalizedNames?.["EN-US"] || item.UniqueName,
      imagen: `https://render.albiononline.com/v1/item/${item.UniqueName}.png`,
    }));

    fs.writeFileSync('./utils/items.json', JSON.stringify(itemsSimplificados, null, 2));
    console.log('✅ Archivo items.json generado correctamente.');
  } catch (error) {
    console.error('❌ Error al obtener los items:', error);
  }
}

generarItems();
