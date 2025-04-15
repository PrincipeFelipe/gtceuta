import React, { useState } from 'react';
import { Sponsor, SponsorFormData } from '../../types/SponsorTypes';
import SponsorsService from '../../services/SponsorsService';
import { toast } from 'react-toastify';
import { Upload, Save, X } from 'lucide-react';

interface SponsorFormProps {
  initialData: Partial<Sponsor>;
  onSubmit: () => void;
  onCancel: () => void;
}

const SponsorForm: React.FC<SponsorFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<SponsorFormData>({
    name: initialData.name || '',
    image: initialData.image || '',
    description: initialData.description || '',
    url: initialData.url || '',
    type: initialData.type || 'patrocinador',
    active: initialData.active !== undefined ? initialData.active : true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData.image || null
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = 'id' in initialData;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Crear una URL de vista previa
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.image || !formData.url || !formData.description) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditing && initialData.id) {
        await SponsorsService.updateSponsor(initialData.id, formData);
        toast.success('Patrocinador actualizado correctamente');
      } else {
        await SponsorsService.createSponsor(formData);
        toast.success('Patrocinador creado correctamente');
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error al guardar el patrocinador:', error);
      toast.error('Error al guardar el patrocinador');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nombre del patrocinador"
            className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            URL del sitio web
          </label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://..."
            className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Descripción del patrocinador..."
          rows={3}
          className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Tipo
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="patrocinador">Patrocinador principal</option>
            <option value="colaborador">Colaborador</option>
            <option value="medio">Blog o Medio</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Estado
          </label>
          <div className="flex items-center h-full pt-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-red-600 rounded focus:ring-red-500 bg-gray-700 border-gray-600"
            />
            <span className="ml-2 text-gray-300">Activo</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Imagen / Logo
        </label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-700 rounded-md overflow-hidden">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="flex-grow">
            <label className="flex items-center gap-2 bg-gray-700 text-gray-300 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-600">
              <Upload size={18} />
              <span>Seleccionar imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Formatos recomendados: PNG, JPG. Tamaño máximo: 1MB.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition"
        >
          <X size={18} />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
        >
          <Save size={18} />
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default SponsorForm;