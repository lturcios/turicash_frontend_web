import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const UserModal = ({ isOpen, onClose, onSave, user, locations }) => {
  const [formData, setFormData] = useState({
    username: '',
    pin: '',
    full_name: '',
    location_id: '',
    is_active: true,
  });
  const [showPinWarning, setShowPinWarning] = useState(false);

  // Cargar datos del usuario cuando se abre para editar
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        pin: '', // No mostramos el PIN actual por seguridad
        full_name: user.full_name,
        location_id: user.location_id || '',
        is_active: user.is_active,
      });
      setShowPinWarning(false);
    } else {
      // Resetear para "Crear Nuevo"
      setFormData({
        username: '',
        pin: '',
        full_name: '',
        location_id: '',
        is_active: true,
      });
      setShowPinWarning(false);
    }
  }, [user, isOpen]); // Depender de isOpen para resetear el form

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación: si estamos editando y no se ingresó PIN, mostrar advertencia
    if (user && !formData.pin) {
      if (!showPinWarning) {
        setShowPinWarning(true);
        return;
      }
    }

    // Validación: si estamos creando, el PIN es obligatorio
    if (!user && !formData.pin) {
      alert('El PIN es obligatorio para crear un nuevo usuario');
      return;
    }

    // Validación: el PIN debe tener al menos 4 dígitos
    if (formData.pin && formData.pin.length < 4) {
      alert('El PIN debe tener al menos 4 dígitos');
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <form onSubmit={handleSubmit}>
          {/* Cabecera del Modal */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-semibold text-turi-blue-dark">
              {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cuerpo del Formulario */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
                placeholder="Nombre de usuario único"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                PIN {user && <span className="text-xs text-gray-500">(dejar vacío para mantener el actual)</span>}
              </label>
              <input
                type="password"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                required={!user}
                minLength="4"
                maxLength="6"
                pattern="[0-9]*"
                inputMode="numeric"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
                placeholder={user ? "Nuevo PIN (opcional)" : "PIN de 4-6 dígitos"}
              />
              {user && formData.pin && (
                <p className="mt-1 text-xs text-amber-600">
                  <AlertCircle size={12} className="inline mr-1" />
                  Se actualizará el PIN del usuario
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
                placeholder="Nombre completo del usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ubicación</label>
              <select
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
              >
                <option value="">Sin asignar</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Los usuarios deben tener una ubicación asignada para poder hacer login
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-turi-blue-dark border-gray-300 rounded focus:ring-turi-blue-dark"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Activo</label>
            </div>

            {/* Advertencia cuando no se ingresa PIN en edición */}
            {showPinWarning && user && !formData.pin && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      No se ingresó un nuevo PIN. El PIN actual del usuario se mantendrá sin cambios.
                      Haz clic en "Guardar" nuevamente para confirmar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pie del Modal */}
          <div className="flex items-center justify-end p-4 border-t bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg border border-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-turi-blue-dark hover:bg-turi-blue-light text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
