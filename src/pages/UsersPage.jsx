import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import UserModal from '../components/UserModal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Para editar

  // Hook para cargar datos al montar
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar usuarios y ubicaciones en paralelo
      const [usersRes, locationsRes] = await Promise.all([
        api.get('/users'),
        api.get('/locations')
      ]);
      setUsers(usersRes.data);
      setLocations(locationsRes.data);
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

  const handleOpenModal = (user = null) => {
    setCurrentUser(user); // Si user es null, es "Crear Nuevo"
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSave = async (userData) => {
    try {
      if (currentUser) {
        // Actualizar (PUT)
        await api.put(`/users/${currentUser.id}`, userData);
      } else {
        // Crear (POST)
        await api.post('/users', userData);
      }
      fetchData(); // Recargar la lista
      handleCloseModal();
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Error al guardar el usuario: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchData(); // Recargar la lista
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Error al eliminar: " + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-turi-blue-dark">Gestión de Usuarios</h2>
          <p className="text-gray-600 mt-1">Administra los usuarios y cajeros del sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-turi-green-dark hover:bg-turi-green-light text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
        >
          <Plus size={20} className="mr-2" />
          Crear Usuario
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-turi-blue-dark mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de Usuarios */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre Completo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <User size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
                      <p className="text-gray-400 text-sm mt-1">Haz clic en "Crear Usuario" para agregar uno nuevo</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-turi-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-turi-blue-dark">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{user.location_name || 'Sin asignar'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => handleOpenModal(user)} 
                          className="inline-flex items-center px-3 py-1.5 bg-turi-blue-dark hover:bg-turi-blue-light text-white rounded-lg transition-colors mr-2"
                          title="Editar usuario"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)} 
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Eliminar usuario"
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
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        user={currentUser}
        locations={locations}
      />
    </div>
  );
};

export default UsersPage;
