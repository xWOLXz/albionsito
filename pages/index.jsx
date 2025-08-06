// pages/index.jsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-3xl font-bold mb-4">Albionsito App</h1>
      <p className="mb-6">Elige una sección:</p>
      <div className="space-y-4">
        <Link href="/market">
          <div className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 cursor-pointer">
            📊 Market General
          </div>
        </Link>
        <Link href="/busqueda">
          <div className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 cursor-pointer">
            🔍 Búsqueda
          </div>
        </Link>
        <Link href="/top-ganancias">
          <div className="bg-yellow-500 text-white px-6 py-2 rounded-lg shadow hover:bg-yellow-600 cursor-pointer">
            💰 Top Ganancias
          </div>
        </Link>
        <Link href="/black-market">
          <div className="bg-gray-800 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-900 cursor-pointer">
            🏴 Black Market
          </div>
        </Link>
      </div>
    </div>
  );
}
