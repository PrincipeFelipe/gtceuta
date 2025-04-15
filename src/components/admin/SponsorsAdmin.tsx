import React, { useEffect, useState } from 'react';
import { Sponsor } from '../../types/SponsorTypes';
import SponsorsService from '../../services/SponsorsService';
import SponsorForm from './SponsorForm';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Trash2, Edit, Eye, EyeOff, Plus, Save, Upload, Download } from 'lucide-react';
import { toast } from 'react-toastify';

const SponsorsAdmin: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState<'patrocinador' | 'colaborador' | 'medio'>('patrocinador');
  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      setIsLoading(true);
      const allSponsors = await SponsorsService.getAllSponsors();
      setSponsors(allSponsors);
    } catch (error) {
      console.error('Error al cargar patrocinadores:', error);
      toast.error('Error al cargar patrocinadores');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter(
    (sponsor) => sponsor.type === activeType
  ).sort((a, b) => a.order - b.order);

  const handleCreateSponsor = () => {
    setEditingSponsor(null);
    setShowForm(true);
  };

  const handleEditSponsor = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setShowForm(true);
  };

  const handleDeleteSponsor = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este patrocinador?')) {
      try {
        await SponsorsService.deleteSponsor(id);
        toast.success('Patrocinador eliminado correctamente');
        loadSponsors();
      } catch (error) {
        console.error('Error al eliminar patrocinador:', error);
        toast.error('Error al eliminar patrocinador');
      }
    }
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    try {
      await SponsorsService.updateSponsor(sponsor.id, {
        name: sponsor.name,
        image: sponsor.image,
        description: sponsor.description,
        url: sponsor.url,
        type: sponsor.type,
        active: !sponsor.active,
      });
      toast.success(`Patrocinador ${sponsor.active ? 'desactivado' : 'activado'} correctamente`);
      loadSponsors();
    } catch (error) {
      console.error('Error al actualizar patrocinador:', error);
      toast.error('Error al actualizar patrocinador');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSponsor(null);
  };

  const handleFormSubmit = async () => {
    loadSponsors();
    handleFormClose();
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filteredSponsors);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar órdenes localmente
    const updatedSponsors = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    // Actualizar la lista localmente
    setSponsors(
      sponsors.map(
        (s) =>
          updatedSponsors.find((us) => us.id === s.id) || s
      )
    );

    // Enviar actualización al servicio
    try {
      await SponsorsService.bulkUpdateOrder(
        updatedSponsors.map((s) => ({ id: s.id, order: s.order }))
      );
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el orden:', error);
      toast.error('Error al actualizar el orden');
      loadSponsors(); // Recargar el estado original en caso de error
    }
  };

  const handleExport = async () => {
    try {
      const data = await SponsorsService.exportSponsors();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gt-ceuta-sponsors-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar patrocinadores:', error);
      toast.error('Error al exportar patrocinadores');
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    setFileInput(input);

    input.onchange = async (e) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            await SponsorsService.importSponsors(content);
            toast.success('Patrocinadores importados correctamente');
            loadSponsors();
          } catch (error) {
            console.error('Error al procesar el archivo:', error);
            toast.error('Error al procesar el archivo');
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Error al importar patrocinadores:', error);
        toast.error('Error al importar patrocinadores');
      }
    };

    input.click();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gestión de Patrocinadores</h2>
        
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
          >
            <Download size={18} />
            Exportar
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition"
          >
            <Upload size={18} />
            Importar
          </button>
        </div>
      </div>

      <div className="bg-gray-700 p-1 rounded-lg flex mb-6">
        <button
          onClick={() => setActiveType('patrocinador')}
          className={`flex-1 py-2 px-4 rounded ${
            activeType === 'patrocinador'
              ? 'bg-red-600 text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          Patrocinadores
        </button>
        <button
          onClick={() => setActiveType('colaborador')}
          className={`flex-1 py-2 px-4 rounded ${
            activeType === 'colaborador'
              ? 'bg-red-600 text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          Colaboradores
        </button>
        <button
          onClick={() => setActiveType('medio')}
          className={`flex-1 py-2 px-4 rounded ${
            activeType === 'medio'
              ? 'bg-red-600 text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          Blogs y Medios
        </button>
      </div>

      <button
        onClick={handleCreateSponsor}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mb-6 flex items-center gap-2"
      >
        <Plus size={18} />
        Añadir {activeType === 'patrocinador' ? 'Patrocinador' : activeType === 'colaborador' ? 'Colaborador' : 'Medio'}
      </button>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : filteredSponsors.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No hay {activeType === 'patrocinador' ? 'patrocinadores' : activeType === 'colaborador' ? 'colaboradores' : 'medios'} registrados
        </p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sponsors">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {filteredSponsors.map((sponsor, index) => (
                  <Draggable key={sponsor.id} draggableId={sponsor.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-gray-700 p-4 rounded-lg flex items-center gap-4 ${
                          !sponsor.active ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={sponsor.image}
                            alt={sponsor.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold text-white">
                            {sponsor.name}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-1">
                            {sponsor.description}
                          </p>
                          <a
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-xs hover:underline"
                          >
                            {sponsor.url}
                          </a>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(sponsor)}
                            title={sponsor.active ? 'Desactivar' : 'Activar'}
                            className={`p-2 rounded ${
                              sponsor.active
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {sponsor.active ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            onClick={() => handleEditSponsor(sponsor)}
                            title="Editar"
                            className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteSponsor(sponsor.id)}
                            title="Eliminar"
                            className="bg-red-600 hover:bg-red-700 p-2 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingSponsor ? 'Editar' : 'Crear nuevo'} 
              {activeType === 'patrocinador' ? ' Patrocinador' : activeType === 'colaborador' ? ' Colaborador' : ' Medio'}
            </h3>
            <SponsorForm
              initialData={editingSponsor || { type: activeType } as any}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorsAdmin;