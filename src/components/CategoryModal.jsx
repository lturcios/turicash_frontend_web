import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CategoryModal = ({ isOpen, onClose, onSave, category, locations }) => {
  const [formData, setFormData] = useState({
    name: '',
    location_id: '',
    color_hex: '#3498db',
    icon_base64: null,
  });
  const [preview, setPreview] = useState(null);

  // Cargar datos de la categoría cuando se abre para editar
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        location_id: category.location_id || '',
        color_hex: category.color_hex || '#3498db',
        icon_base64: null, // No reenviamos el base64 a menos que se cambie
      });
      setPreview(category.icon_base64);
    } else {
      setFormData({
        name: '',
        location_id: '',
        color_hex: '#3498db',
        icon_base64: null,
      });
      setPreview(null);
    }
  }, [category, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          icon_base64: reader.result,
        }));
        setPreview(reader.result);
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
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-semibold text-turi-blue-dark">
              {category ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la Categoría</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
                placeholder="Ej: Bebidas, Comidas, Postres"
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
              <label className="block text-sm font-medium text-gray-700">Color (Hex)</label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="color"
                  name="color_hex"
                  value={formData.color_hex}
                  onChange={handleChange}
                  className="h-10 w-10 p-1 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  name="color_hex"
                  value={formData.color_hex}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-turi-blue-light focus:border-turi-blue-light"
                  placeholder="#000000"
                />
              </div>
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
                  <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-md shadow-sm" />
                </div>
              )}
            </div>
          </div>

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

export default CategoryModal;
