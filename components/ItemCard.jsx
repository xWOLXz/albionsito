// components/ItemCard.jsx
export default function ItemCard({ item }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-2 flex flex-col items-center text-center">
      <img
        src={item.url || 'https://render.albiononline.com/v1/item/T4_BAG.png'}
        alt={item.nombre}
        className="w-16 h-16 mb-2"
      />
      <p className="text-sm font-semibold">{item.nombre}</p>
    </div>
  );
}
