import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import CategoryModal from '../components/CategoryModal';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Primero traemos las ubicaciones
      const locRes = await api.get('/locations');
      const locationsData = locRes.data;
      setLocations(locationsData);

      // 2. Por cada ubicación, traemos sus categorías en paralelo
      const categoriesPromises = locationsData.map(loc => 
        api.get(`/categories/location/${loc.id}`)
          .then(res => res.data.map(cat => ({ ...cat, location_name: loc.name })))
          .catch(err => {
            console.warn(`No se pudieron cargar categorías para la ubicación ${loc.id}`, err);
            return []; // Retornamos vacío si una ubicación falla
          })
      );

      const categoriesResults = await Promise.all(categoriesPromises);
      
      // 3. Aplanamos los resultados en un solo array
      const allCategories = categoriesResults.flat();
      setCategories(allCategories);
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("No se pudieron cargar los datos básicos (ubicaciones).");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
  };

  const handleSave = async (categoryData) => {
    try {
      if (currentCategory) {
        await api.put(`/categories/${currentCategory.id}`, categoryData);
      } else {
        // Validación de seguridad: máximo 4 categorías
        if (categories.length >= 4) {
          alert("No puedes crear más de 4 categorías. El límite ha sido alcanzado.");
          return;
        }
        await api.post('/categories', categoryData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Error al guardar la categoría: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de desactivar esta categoría? (Baja lógica)")) {
      try {
        await api.delete(`/categories/${id}`);
        fetchData();
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("Error al desactivar: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const isLimitReached = categories.length >= 4;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-turi-blue-dark">Gestión de Categorías</h2>
          <p className="text-gray-600 mt-1">Organiza tus productos por categorías y ubicaciones</p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          disabled={isLimitReached}
          className={`font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-md ${
            isLimitReached 
              ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
              : 'bg-turi-green-dark hover:bg-turi-green-light text-white'
          }`}
        >
          <Plus size={20} className="mr-2" />
          {isLimitReached ? 'Límite alcanzado (4)' : 'Crear Categoría'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-turi-blue-dark mb-4"></div>
            <p className="text-gray-600">Cargando categorías...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Vista Desktop */}
          <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ubicación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Color</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <FolderTree size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 text-lg">No hay categorías registradas</p>
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {cat.icon_base64 ? (
                              <img src={cat.icon_base64} alt="" className="w-10 h-10 rounded shadow-sm mr-3 object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                                <FolderTree size={20} className="text-gray-400" />
                              </div>
                            )}
                            <div className="text-sm font-semibold text-gray-900">{cat.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{cat.location_name || `ID: ${cat.location_id}`}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2 border border-gray-200" 
                              style={{ backgroundColor: cat.color_hex || '#3498db' }}
                            ></div>
                            <span className="text-xs font-mono text-gray-500 uppercase">{cat.color_hex || '#3498db'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={() => handleOpenModal(cat)} 
                            className="inline-flex items-center px-3 py-1.5 bg-turi-blue-dark hover:bg-turi-blue-light text-white rounded-lg transition-colors mr-2"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id)} 
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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

          {/* Vista Mobile */}
          <div className="md:hidden space-y-4">
            {categories.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-100">
                <FolderTree size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-lg">No hay categorías</p>
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-3">
                    {cat.icon_base64 ? (
                      <img src={cat.icon_base64} alt="" className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <FolderTree size={24} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">{cat.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: cat.color_hex || '#3498db' }}
                        ></div>
                        {cat.location_name || 'Sin ubicación'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(cat)}
                      className="flex-1 bg-turi-blue-dark text-white py-2 rounded-lg flex items-center justify-center text-sm font-semibold"
                    >
                      <Edit size={16} className="mr-2" /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg flex items-center justify-center text-sm font-semibold"
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        category={currentCategory}
        locations={locations}
      />
    </div>
  );
};

export default CategoriesPage;
