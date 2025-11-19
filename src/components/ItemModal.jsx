import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ItemModal = ({ isOpen, onClose, onSave, item, locations }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    location_id: '',
    icon_base64: null,
    is_active: true,
  });
  const [preview, setPreview] = useState(null);

  // Cargar datos del item cuando se abre para editar
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        price: item.price,
        location_id: item.location_id,
        icon_base64: null, // No reenviamos el base64 a menos que se cambie
        is_active: item.is_active,
      });
      setPreview(item.icon_base64); // Mostrar preview del ícono actual
    } else {
      // Resetear para "Crear Nuevo"
      setFormData({
        name: '',
        price: '',
        location_id: '',
        icon_base64: null,
        is_active: true,
      });
      setPreview(null);
    }
  }, [item, isOpen]); // Depender de isOpen para resetear el form

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // El resultado es un string base64
        setFormData((prev) => ({
          ...prev,
          icon_base64: reader.result,
        }));
        setPreview(reader.result); // Mostrar preview del nuevo ícono
      };
      reader.readAsDataURL(file);
    }
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
              {item ? 'Editar Item' : 'Crear Nuevo Item'}
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
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                name="price"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ubicación</label>
              <select
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
              >
                <option value="">Seleccione una ubicación</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ícono</label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-turi-blue-50 file:text-turi-blue-dark hover:file:bg-turi-blue-100"
              />
              {preview && (
                <div className="mt-2">
                  <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                  {item && !formData.icon_base64 && <span className="text-xs text-gray-500">Ícono actual. Seleccione un archivo para cambiarlo.</span>}
                </div>
              )}
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

export default ItemModal;