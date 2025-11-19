import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const LocationModal = ({ isOpen, onClose, onSave, location }) => {
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
  });

  // Cargar datos de la ubicación cuando se abre para editar
  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        is_active: location.is_active,
      });
    } else {
      // Resetear para "Crear Nuevo"
      setFormData({
        name: '',
        is_active: true,
      });
    }
  }, [location, isOpen]); // Depender de isOpen para resetear el form

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
              {location ? 'Editar Ubicación' : 'Crear Nueva Ubicación'}
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
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la Ubicación</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
                placeholder="Ej: Sala Principal, Bar, Terraza"
              />
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

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Las ubicaciones se utilizan para organizar items y asignar usuarios. 
                    Los usuarios necesitan una ubicación asignada para poder hacer login.
                  </p>
                </div>
              </div>
            </div>
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

export default LocationModal;
