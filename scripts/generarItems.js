// scripts/generarItems.js

const fetch = require('node-fetch');
const fs = require('fs');

const API_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json';

const obtenerItemsCompletos = async () => {
  try {
    console.log('Descargando datos de Albion...');

    const res = await fetch(API_URL);
    const data = await res.json();

    const itemsFiltrados = data.filter(item => {
      // Solo ítems comerciables y no del mercado negro
      return (
        item.UniqueName &&
        !item.UniqueName.includes('SKIN_') &&
        !item.UniqueName.includes('QUESTITEM') &&
        !item.UniqueName.includes('TUTORIAL') &&
        !item.UniqueName.includes('MOA_MECHANIC') &&
        !item.UniqueName.includes('FISHING_GEAR') &&
        !item.UniqueName.includes('BLACKMARKET') &&
        item.LocalizedNames &&
        item.LocalizedNames['ES-ES']
      );
    });

    const resultado = itemsFiltrados.map(item => ({
      id: item.UniqueName,
      name: item.LocalizedNames['ES-ES']
    }));

    // Guardar en public/items.json
    fs.writeFileSync('public/items.json', JSON.stringify(resultado, null, 2));
    console.log(`✅ ${resultado.length} ítems guardados en public/items.json`);
  } catch (err) {
    console.error('❌ Error al obtener los ítems:', err.message);
  }
};

obtenerItemsCompletos();
