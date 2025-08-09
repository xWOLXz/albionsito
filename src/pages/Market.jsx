import { useState, useEffect } from 'react';
import { useAlbion } from '../context/AlbionContext';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import ItemCard from '../components/ItemCard';

export default function Market() {
  const { itemsData, pricesBackend, prices2D, loading } = useAlbion();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedEnchant, setSelectedEnchant] = useState('0');

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
    setSelectedItem(null);
  };

  const results = itemsData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm) &&
    !item.uniqueName.includes('@') // Solo tier base
  );

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSelectedEnchant('0');
  };

  const filteredPrices = (uniqueName) => {
    const fullName = `${uniqueName}${selectedEnchant !== '0' ? `@${selectedEnchant}` : ''}`;
    const fromBackend1 = pricesBackend.filter((p) => p.item_id === fullName);
    const fromBackend2 = prices2D.filter((p) => p.item_id === fullName);
    return [...fromBackend1, ...fromBackend2];
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <SearchBar onSearch={handleSearch} />

      {selectedItem && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">{selectedItem.name}</h2>
          <div className="flex gap-2 mb-4">
            {['0', '1', '2', '3'].map((e) => (
              <button
                key={e}
                onClick={() => setSelectedEnchant(e)}
                className={`px-3 py-1 rounded border ${
                  selectedEnchant === e ? 'bg-yellow-400' : 'bg-gray-200'
                }`}
              >
                {e === '0' ? 'Base' : `.${e}`}
              </button>
            ))}
          </div>
          <ItemCard item={selectedItem} prices={filteredPrices(selectedItem.uniqueName)} />
        </div>
      )}

      {!selectedItem && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {results.map((item) => (
            <div
              key={item.uniqueName}
              className="cursor-pointer hover:scale-105 transition"
              onClick={() => handleItemClick(item)}
            >
              <img
                src={`https://render.albiononline.com/v1/item/${item.uniqueName}.png`}
                alt={item.name}
                className="w-full"
              />
              <p className="text-center text-sm">{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
