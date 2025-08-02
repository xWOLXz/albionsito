import axios from 'axios';

let cacheItems = [];
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos
const ITEMS_URL = 'https://cdn.jsdelivr.net/gh/mildrar/albion-items-dump@main/items.json';

async function fetchItems() {
  try {
    const response = await axios.get(ITEMS_URL);
    const rawItems = response.data;

    const filtered = rawItems.filter(item =>
      item.UniqueName &&
      item.LocalizedNames &&
      item.LocalizedNames['ES-ES'] &&
      !item.UniqueName.includes("QUEST") &&
      !item.UniqueName.includes("SKIN") &&
      !item.UniqueName.includes("JOURNAL") &&
      !item.UniqueName.includes("TROPHY") &&
      !item.UniqueName.includes("BLACKMARKET")
    );

    cacheItems = filtered;
    lastFetchTime = Date.now();
  } catch (error) {
    console.error('❌ Error al obtener ítems del GitHub:', error.message);
  }
}

export default async function handler(req, res) {
  const now = Date.now();
  if (cacheItems.length === 0 || now - lastFetchTime > CACHE_DURATION) {
    await fetchItems();
  }

  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = 30;
  const start = (page - 1) * itemsPerPage;
  const paginated = cacheItems.slice(start, start + itemsPerPage);

  res.status(200).json({
    total: cacheItems.length,
    page,
    totalPages: Math.ceil(cacheItems.length / itemsPerPage),
    items: paginated
  });
}
