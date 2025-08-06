import { useEffect, useState } from 'react';

const Busqueda = () => {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [datosItem, setDatosItem] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Cargar items.json desde /public
  useEffect(() => {
    const cargarItems = async () => {
      try {
        const respuesta = await fetch('/items.json');
        const data = await respuesta.json();
        setItems(data);
      } catch (error) {
        console.error('Error cargando items.json:', error);
      }
    };
    cargarItems();
  }, []);

  // Buscar ítems por nombre
  useEffect(() => {
    if (busqueda.length === 0) {
      setResultados([]);
      return;
    }

    const filtrados = items.filter((item) =>
      item.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setResultados(filtrados.slice(0, 10)); // mostrar solo los 10 primeros
  }, [busqueda, items]);

  const seleccionarItem = async (item) => {
    setItemSeleccionado(item);
    setBusqueda(item.nombre);
    setResultados([]);
    setCargando(true);
    try {
      const respuesta = await fetch(`https://albionsito-backend2.vercel.app/api/precios?id=${item.id}`);
      const data = await respuesta.json();
      setDatosItem(data);
    } catch (error) {
      console.error('Error consultando precios:', error);
      setDatosItem(null);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Búsqueda de Ítems</h1>

      <input
        type="text"
        placeholder="Escribe el nombre del ítem en español..."
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setItemSeleccionado(null);
          setDatosItem(null);
        }}
        className="w-full p-2 border rounded mb-2"
      />

      {resultados.length > 0 && (
        <ul className="border rounded mb-4 bg-white max-h-60 overflow-y-auto">
          {resultados.map((item) => (
            <li
              key={item.id}
              className="p-2 cursor-pointer hover:bg-gray-200 flex items-center"
              onClick={() => seleccionarItem(item)}
            >
              <img src={item.imagen} alt={item.nombre} className="w-6 h-6 mr-2" />
              {item.nombre}
            </li>
          ))}
        </ul>
      )}

      {cargando && (
        <div className="text-center my-4">
          <img src="/albion-loader.gif" alt="Cargando..." className="w-16 h-16 mx-auto" />
          <p>Cargando precios...</p>
        </div>
      )}

      {datosItem && (
        <div className="bg-gray-100 p-4 rounded shadow mt-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <img
              src={itemSeleccionado?.imagen}
              alt={itemSeleccionado?.nombre}
              className="w-8 h-8 mr-2"
            />
            {itemSeleccionado?.nombre}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">📉 Precio de venta más bajo:</p>
              <p>{datosItem.sell_price_min?.toLocaleString() || 'N/A'} plata</p>
              <p className="text-sm text-gray-600">Ciudad: {datosItem.sell_price_min_city || 'N/A'}</p>
            </div>

            <div>
              <p className="font-medium">📈 Precio de compra más alto:</p>
              <p>{datosItem.buy_price_max?.toLocaleString() || 'N/A'} plata</p>
              <p className="text-sm text-gray-600">Ciudad: {datosItem.buy_price_max_city || 'N/A'}</p>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <p className="font-medium">💰 Margen de ganancia:</p>
              <p>
                {datosItem.margen !== undefined
                  ? `${datosItem.margen.toLocaleString()} plata`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Busqueda;
