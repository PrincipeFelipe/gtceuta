// URL base para la API
const API_URL = 'http://localhost:4000/api';

export interface Sponsor {
  id: number;
  name: string;
  logo: string;
  url: string;
  description: string;
  tier: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Función para subir una imagen al servidor
async function uploadImage(imageBase64: string): Promise<string> {
  try {
    // Si ya es una URL, no es necesario subirla
    if (!imageBase64 || !imageBase64.startsWith('data:image')) {
      return imageBase64;
    }
    
    const response = await fetch(`${API_URL}/upload/sponsor-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 })
    });
    
    if (!response.ok) {
      throw new Error(`Error al subir la imagen: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }
}

class SponsorsService {
  // Obtener todos los patrocinadores
  async getAllSponsors(): Promise<Sponsor[]> {
    try {
      const response = await fetch(`${API_URL}/sponsors`);
      if (!response.ok) {
        throw new Error(`Error al obtener los patrocinadores: ${response.statusText}`);
      }
      
      const sponsors = await response.json();
      return sponsors;
    } catch (error) {
      console.error('Error en getAllSponsors:', error);
      throw error;
    }
  }

  // Obtener un patrocinador por ID
  async getSponsorById(id: number): Promise<Sponsor | null> {
    try {
      const response = await fetch(`${API_URL}/sponsors/${id}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Error al obtener el patrocinador: ${response.statusText}`);
      }
      
      const sponsor = await response.json();
      return sponsor;
    } catch (error) {
      console.error('Error en getSponsorById:', error);
      throw error;
    }
  }

  // Añadir un nuevo patrocinador
  async addSponsor(sponsor: Omit<Sponsor, 'id'>): Promise<Sponsor> {
    try {
      // Primero subir la imagen del logo si es base64
      let logoUrl = sponsor.logo;
      if (sponsor.logo && sponsor.logo.startsWith('data:image')) {
        logoUrl = await uploadImage(sponsor.logo);
      }
      
      const sponsorData = {
        ...sponsor,
        logo: logoUrl
      };
      
      const response = await fetch(`${API_URL}/sponsors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsorData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al crear el patrocinador: ${response.statusText}`);
      }
      
      const newSponsor = await response.json();
      return newSponsor;
    } catch (error) {
      console.error('Error en addSponsor:', error);
      throw error;
    }
  }

  // Actualizar un patrocinador existente
  async updateSponsor(sponsor: Sponsor): Promise<Sponsor> {
    try {
      // Subir la imagen del logo si es base64
      let logoUrl = sponsor.logo;
      if (sponsor.logo && sponsor.logo.startsWith('data:image')) {
        logoUrl = await uploadImage(sponsor.logo);
      }
      
      const sponsorData = {
        ...sponsor,
        logo: logoUrl
      };
      
      const response = await fetch(`${API_URL}/sponsors/${sponsor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsorData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al actualizar el patrocinador: ${response.statusText}`);
      }
      
      // Obtener el patrocinador actualizado
      const updatedSponsor = await this.getSponsorById(sponsor.id);
      if (!updatedSponsor) {
        throw new Error('No se pudo obtener el patrocinador actualizado');
      }
      
      return updatedSponsor;
    } catch (error) {
      console.error('Error en updateSponsor:', error);
      throw error;
    }
  }

  // Eliminar un patrocinador
  async deleteSponsor(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/sponsors/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al eliminar el patrocinador: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en deleteSponsor:', error);
      throw error;
    }
  }
  
  // Importar patrocinadores
  async importSponsors(sponsors: Sponsor[]): Promise<{ created: number; updated: number; errors: number }> {
    try {
      const response = await fetch(`${API_URL}/sponsors/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsors)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al importar los patrocinadores: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.results || { created: 0, updated: 0, errors: 0 };
    } catch (error) {
      console.error('Error en importSponsors:', error);
      throw error;
    }
  }

  // Inicializar datos por defecto
  public async initializeDefaultSponsors(): Promise<void> {
    try {
      console.log('Intentando inicializar patrocinadores predeterminados...');
      
      try {
        // Verificar si ya hay patrocinadores en la API
        const existingSponsors = await this.getAllSponsors();
        
        if (existingSponsors.length === 0) {
          console.log('No hay patrocinadores existentes, procediendo con la inicialización...');
          
          // Datos predeterminados en caso de que falle la importación
          const defaultSponsorsData = [
            {
              id: 1,
              name: "Ceuta Social",
              logo: "/sponsors/ceuta-social.png",
              url: "https://www.ceuta.es/social",
              description: "Consejería de Servicios Sociales de la Ciudad Autónoma de Ceuta",
              tier: "platinum",
              active: true
            },
            {
              id: 2,
              name: "Universidad de Granada",
              logo: "/sponsors/ugr.png",
              url: "https://www.ugr.es/",
              description: "Universidad de Granada - Campus de Ceuta",
              tier: "gold",
              active: true
            },
            {
              id: 3,
              name: "Fundación Progreso y Cultura",
              logo: "/sponsors/fundacion-progreso.png",
              url: "https://www.fundacionprogreso.es/",
              description: "Fundación para el desarrollo cultural y educativo",
              tier: "silver",
              active: true
            }
          ];
          
          try {
            // Intentar importar los datos iniciales del archivo
            console.log('Intentando cargar datos iniciales desde archivo...');
            const initialData = await import('../data/initialSponsorsData');
            const fileSponsors = initialData.initialSponsorsData || [];
            console.log(`Datos cargados correctamente: ${fileSponsors.length} patrocinadores`);
            
            // Usar los datos del archivo si están disponibles
            if (fileSponsors.length > 0) {
              console.log('Importando patrocinadores desde archivo...');
              await this.importSponsors(fileSponsors.map(sponsor => ({
                ...sponsor,
                id: sponsor.id || 0 // Usar el ID existente o 0
              })));
            } else {
              console.log('No hay patrocinadores en el archivo, usando datos predeterminados...');
              await this.importSponsors(defaultSponsorsData.map(sponsor => ({
                ...sponsor,
                id: 0 // ID temporal que será reemplazado por la base de datos
              })));
            }
          } catch (importError) {
            console.error('Error al cargar archivo de patrocinadores:', importError);
            console.log('Usando datos predeterminados fallback...');
            
            // Si falla la importación, usar los datos predeterminados
            await this.importSponsors(defaultSponsorsData.map(sponsor => ({
              ...sponsor,
              id: 0 // ID temporal que será reemplazado por la base de datos
            })));
          }
          
          console.log('Patrocinadores inicializados correctamente');
        } else {
          console.log(`Ya existen ${existingSponsors.length} patrocinadores, omitiendo inicialización`);
        }
      } catch (apiError) {
        console.error('Error al verificar patrocinadores existentes:', apiError);
        throw new Error('No se pudo verificar si existen patrocinadores');
      }
    } catch (error) {
      console.error('Error inicializando patrocinadores predeterminados:', error);
      throw error;
    }
  }
}

// Exportamos una instancia del servicio para uso global
const sponsorsService = new SponsorsService();
export default sponsorsService;