const API_URL = 'https://west.albion-online-data.com/api/v2/stats/prices';

const fallbackCities = [
  'Bridgewatch',
  'Martlock',
  'Thetford',
  'Fort Sterling',
  'Lymhurst',
  'Caerleon',
  'Brecilien',
];

export default async function fetchItemPrices(itemId) {
  try {
    const url = `${API_URL}/${itemId}.json?locations=${fallbackCities.join(',')}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const filtered = data
      .filter((entry) => fallbackCities.includes(entry.city))
      .map((entry) => ({
        city: entry.city,
        sell_price_min: entry.sell_price_min || 0,
        buy_price_min: entry.buy_price_min || 0,
      }));

    return filtered.length > 0 ? filtered : null;
  } catch (error) {
    console.error('❌ Error al obtener precios:', error);
    return null;
  }
}
