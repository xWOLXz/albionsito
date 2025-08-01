// scripts/generarItems.js
const fs = require('fs').promises;
const fetch = require('node-fetch');

const endpoints = [
  'https://api.openalbion.com/api/v3/weapons',
  'https://api.openalbion.com/api/v3/consumables',
  'https://api.openalbion.com/api/v3/mounts'
  // puedes agregar armaduras, herramientas, etc.
];

(async () => {
  const all = [];

  for (const url of endpoints) {
    const res = await fetch(url);
    const j = await res.json();
    j.data.forEach(item => {
      all.push({
        id: item.identifier,
        name: item.name,
        tier: item.tier,
        icon: item.icon
      });
    });
  }

  await fs.writeFile('items.json', JSON.stringify(all, null, 2));
  console.log('items.json generado con', all.length, 'ítems');
})();
