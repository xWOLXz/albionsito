// pages/api/market.js
export default async function handler(req, res) {
  const response = await fetch('https://www.albion-online-data.com/api/v2/stats/prices/T4_BAG?locations=Bridgewatch,Martlock,FortSterling,Lymhurst,Thetford');
  const data = await response.json();
  res.status(200).json(data);
}
