import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Image as ImageIcon, MapPin } from 'lucide-react';
import ItemModal from '../components/ItemModal'; // Creamos este componente

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // Para editar

  // Hook para cargar datos al montar
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Cargamos items y ubicaciones en paralelo
      const [itemsRes, locationsRes] = await Promise.all([
        api.get('/items'),
        api.get('/locations')
      ]);
      setItems(itemsRes.data);
      const locationsData = locationsRes.data;
      setLocations(locationsData);

      // 2. Cargamos categorías por cada ubicación
      const categoriesPromises = locationsData.map(loc => 
        api.get(`/categories/location/${loc.id}`)
          .then(res => res.data)
          .catch(() => [])
      );
      const categoriesResults = await Promise.all(categoriesPromises);
      setCategories(categoriesResults.flat());

    } catch (err) {
      console.error("Error fetching data:", err);
      // ... resto del catch igual
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado
  const filteredItems = items.filter(item => {
    const matchesLocation = filterLocation === '' || item.location_id == filterLocation;
    const matchesCategory = filterCategory === '' || item.category_id == filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && item.is_active) || 
                         (filterStatus === 'inactive' && !item.is_active);
    
    return matchesLocation && matchesCategory && matchesStatus;
  });

  // Filtrar categorías disponibles según la ubicación seleccionada en el filtro
  const availableCategoriesForFilter = filterLocation 
    ? categories.filter(cat => cat.location_id == filterLocation)
    : categories;

  const handleOpenModal = (item = null) => {
    setCurrentItem(item); // Si item es null, es "Crear Nuevo"
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSave = async (itemData) => {
    try {
      if (currentItem) {
        // Actualizar (PUT)
        await api.put(`/items/${currentItem.id}`, itemData);
      } else {
        // Crear (POST)
        await api.post('/items', itemData);
      }
      fetchData(); // Recargar la lista
      handleCloseModal();
    } catch (err) {
      console.error("Error saving item:", err);
      alert("Error al guardar el item: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este item?")) {
      try {
        await api.delete(`/items/${id}`);
        fetchData(); // Recargar la lista
      } catch (err) {
        console.error("Error deleting item:", err);
        alert("Error al eliminar: " + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-turi-blue-dark">Gestión de Items</h2>
          <p className="text-gray-600 mt-1">Administra los productos y servicios disponibles</p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-turi-green-dark hover:bg-turi-green-light text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
        >
          <Plus size={20} className="mr-2" />
          Crear Item
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ubicación</label>
          <select 
            value={filterLocation}
            onChange={(e) => {
              setFilterLocation(e.target.value);
              setFilterCategory(''); // Resetear categoría si cambia ubicación
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turi-blue-light"
          >
            <option value="">Todas las ubicaciones</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Categoría</label>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turi-blue-light"
          >
            <option value="">Todas las categorías</option>
            {availableCategoriesForFilter.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name} ({cat.location_name})</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Estado</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turi-blue-light"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo Activos</option>
            <option value="inactive">Solo Inactivos</option>
          </select>
        </div>

        <button 
          onClick={() => {
            setFilterLocation('');
            setFilterCategory('');
            setFilterStatus('all');
          }}
          className="text-turi-blue-dark hover:text-turi-blue-light text-sm font-medium px-2 py-2 transition-colors"
        >
          Limpiar Filtros
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-turi-blue-dark mb-4"></div>
            <p className="text-gray-600">Cargando items...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de Items (Vista Desktop) */}
      {!loading && !error && (
        <>
          <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Icono</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ubicación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <ImageIcon size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 text-lg">No se encontraron items</p>
                        <p className="text-gray-400 text-sm mt-1">Probá cambiando los filtros o creá uno nuevo</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.icon_base64 ? (
                            <img src={item.icon_base64} alt="Icono" className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon size={24} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{item.category_name || 'Sin categoría'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-turi-green-dark">${parseFloat(item.base_price || item.price).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{item.base_quantity || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{item.location_name || 'Sin asignar'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={() => handleOpenModal(item)} 
                            className="inline-flex items-center px-3 py-1.5 bg-turi-blue-dark hover:bg-turi-blue-light text-white rounded-lg transition-colors mr-2"
                            title="Editar item"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Eliminar item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista Mobile (Cards) */}
          <div className="md:hidden space-y-4">
            {filteredItems.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-100">
                <ImageIcon size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-lg">No se encontraron items</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div className="flex-shrink-0">
                      {item.icon_base64 ? (
                        <img src={item.icon_base64} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon size={28} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-gray-900 truncate pr-8">{item.name}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                          item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.is_active ? 'Activo' : 'Baja'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{item.category_name || 'Sin categoría'}</p>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-turi-green-dark">
                          ${parseFloat(item.base_price || item.price).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Stock: {item.base_quantity || 0}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center text-xs text-gray-400">
                        <MapPin size={12} className="mr-1" />
                        {item.location_name || 'Sin asignar'}
                      </div>
                    </div>
                  </div>

                  {/* Acciones flotantes o en base */}
                  <div className="mt-4 flex gap-2 border-t pt-3">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="flex-1 bg-turi-blue-dark text-white py-2 rounded-lg flex items-center justify-center text-sm font-semibold"
                    >
                      <Edit size={16} className="mr-2" /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg flex items-center justify-center text-sm font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} className="mr-2" /> Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal para Crear/Editar */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        item={currentItem}
        locations={locations}
        categories={categories}
      />
    </div>
  );
};

export default ItemsPage;