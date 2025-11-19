import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import LocationModal from '../components/LocationModal';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null); // Para editar

  // Hook para cargar datos al montar
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/locations');
      setLocations(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      console.error("Error response:", err.response);
      console.error("Error request:", err.request);
      
      let errorMessage = "No se pudieron cargar los datos. ";
      
      if (err.response) {
        // El servidor respondió con un código de error
        errorMessage += `Error ${err.response.status}: ${err.response.data?.error || err.response.statusText}`;
      } else if (err.request) {
        // La petición se hizo pero no hubo respuesta
        errorMessage += "No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:5000";
      } else {
        // Error al configurar la petición
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (location = null) => {
    setCurrentLocation(location); // Si location es null, es "Crear Nuevo"
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLocation(null);
  };

  const handleSave = async (locationData) => {
    try {
      if (currentLocation) {
        // Actualizar (PUT)
        await api.put(`/locations/${currentLocation.id}`, locationData);
      } else {
        // Crear (POST)
        await api.post('/locations', locationData);
      }
      fetchData(); // Recargar la lista
      handleCloseModal();
    } catch (err) {
      console.error("Error saving location:", err);
      alert("Error al guardar la ubicación: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta ubicación?")) {
      try {
        await api.delete(`/locations/${id}`);
        fetchData(); // Recargar la lista
      } catch (err) {
        console.error("Error deleting location:", err);
        alert("Error al eliminar: " + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-turi-blue-dark">Gestión de Ubicaciones</h2>
          <p className="text-gray-600 mt-1">Administra las ubicaciones y puntos de venta</p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-turi-green-dark hover:bg-turi-green-light text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
        >
          <Plus size={20} className="mr-2" />
          Crear Ubicación
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-turi-blue-dark mb-4"></div>
            <p className="text-gray-600">Cargando ubicaciones...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de Ubicaciones */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-lg">No hay ubicaciones registradas</p>
                      <p className="text-gray-400 text-sm mt-1">Haz clic en "Crear Ubicación" para agregar una nueva</p>
                    </td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-turi-green-100 rounded-full flex items-center justify-center">
                            <MapPin size={24} className="text-turi-green-dark" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">#{location.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{location.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {location.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => handleOpenModal(location)} 
                          className="inline-flex items-center px-3 py-1.5 bg-turi-blue-dark hover:bg-turi-blue-light text-white rounded-lg transition-colors mr-2"
                          title="Editar ubicación"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(location.id)} 
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Eliminar ubicación"
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
      )}

      {/* Modal para Crear/Editar */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        location={currentLocation}
      />
    </div>
  );
};

export default LocationsPage;
