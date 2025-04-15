import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { Sponsor, SponsorFormData, SponsorType } from '../types/SponsorTypes';

const DB_NAME = 'gtceuta_sponsors_db';
const DB_VERSION = 1;
const STORE_NAME = 'sponsors';

class SponsorsService {
  private async getDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-type', 'type', { unique: false });
          store.createIndex('by-active', 'active', { unique: false });
          store.createIndex('by-order', 'order', { unique: false });
        }
      },
    });
  }

  public async getAllSponsors(): Promise<Sponsor[]> {
    try {
      const db = await this.getDB();
      return await db.getAll(STORE_NAME);
    } catch (error) {
      console.error('Error al obtener patrocinadores:', error);
      return [];
    }
  }

  public async getSponsorsByType(type: SponsorType): Promise<Sponsor[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const index = tx.store.index('by-type');
      const sponsors = await index.getAll(type);
      
      // Ordenar por el campo order
      return sponsors.sort((a, b) => a.order - b.order).filter(s => s.active);
    } catch (error) {
      console.error(`Error al obtener patrocinadores de tipo ${type}:`, error);
      return [];
    }
  }

  public async getSponsorById(id: string): Promise<Sponsor | undefined> {
    try {
      const db = await this.getDB();
      return await db.get(STORE_NAME, id);
    } catch (error) {
      console.error('Error al obtener patrocinador por ID:', error);
      return undefined;
    }
  }

  public async createSponsor(formData: SponsorFormData): Promise<Sponsor> {
    try {
      const db = await this.getDB();
      
      // Obtener el último orden para este tipo
      const allSponsors = await this.getSponsorsByType(formData.type);
      const maxOrder = allSponsors.length > 0 
        ? Math.max(...allSponsors.map(s => s.order)) 
        : 0;
      
      // Manejar la imagen si es un File
      let imageUrl = formData.image as string;
      if (formData.image instanceof File) {
        imageUrl = await this.processImage(formData.image);
      }

      const now = new Date().toISOString();
      const sponsor: Sponsor = {
        id: uuidv4(),
        name: formData.name,
        image: imageUrl,
        description: formData.description,
        url: formData.url,
        type: formData.type,
        active: formData.active,
        order: maxOrder + 1,
        createdAt: now,
        updatedAt: now,
      };

      await db.add(STORE_NAME, sponsor);
      return sponsor;
    } catch (error) {
      console.error('Error al crear patrocinador:', error);
      throw error;
    }
  }

  public async updateSponsor(id: string, formData: SponsorFormData): Promise<Sponsor> {
    try {
      const db = await this.getDB();
      const existingSponsor = await this.getSponsorById(id);
      
      if (!existingSponsor) {
        throw new Error('Patrocinador no encontrado');
      }

      // Manejar la imagen si es un File
      let imageUrl = formData.image as string;
      if (formData.image instanceof File) {
        imageUrl = await this.processImage(formData.image);
      }

      const updatedSponsor: Sponsor = {
        ...existingSponsor,
        name: formData.name,
        image: imageUrl,
        description: formData.description,
        url: formData.url,
        type: formData.type,
        active: formData.active,
        updatedAt: new Date().toISOString(),
      };

      await db.put(STORE_NAME, updatedSponsor);
      return updatedSponsor;
    } catch (error) {
      console.error('Error al actualizar patrocinador:', error);
      throw error;
    }
  }

  public async deleteSponsor(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await db.delete(STORE_NAME, id);
    } catch (error) {
      console.error('Error al eliminar patrocinador:', error);
      throw error;
    }
  }

  public async updateSponsorOrder(sponsorId: string, newOrder: number): Promise<void> {
    try {
      const db = await this.getDB();
      const sponsor = await this.getSponsorById(sponsorId);
      
      if (!sponsor) {
        throw new Error('Patrocinador no encontrado');
      }

      const updatedSponsor = {
        ...sponsor,
        order: newOrder,
        updatedAt: new Date().toISOString(),
      };

      await db.put(STORE_NAME, updatedSponsor);
    } catch (error) {
      console.error('Error al actualizar orden del patrocinador:', error);
      throw error;
    }
  }

  public async bulkUpdateOrder(reorderedSponsors: { id: string; order: number }[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');

      for (const item of reorderedSponsors) {
        const sponsor = await tx.store.get(item.id);
        if (sponsor) {
          sponsor.order = item.order;
          sponsor.updatedAt = new Date().toISOString();
          await tx.store.put(sponsor);
        }
      }

      await tx.done;
    } catch (error) {
      console.error('Error al actualizar orden de patrocinadores:', error);
      throw error;
    }
  }

  // Función para procesar y almacenar la imagen
  private async processImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  // Método para cargar datos iniciales
  public async initializeDefaultSponsors(): Promise<void> {
    try {
      const sponsors = await this.getAllSponsors();
      
      if (sponsors.length === 0) {
        console.log('Inicializando patrocinadores por defecto...');
        
        const defaultSponsors: SponsorFormData[] = [
          {
            name: 'Consejería de Turismo de Ceuta',
            image: '/images/sponsors/logo_turismo_ceuta.png',
            description: 'Entidad pública dedicada a la promoción de Ceuta como un destino atractivo para visitantes y eventos.',
            url: 'https://turismodeceuta.com/',
            type: 'patrocinador',
            active: true
          },
          {
            name: 'Consejería de Educación y Cultura de Ceuta',
            image: '/images/sponsors/logo_cultura.jpg',
            description: 'Organismo que impulsa la formación, el conocimiento y las actividades culturales en nuestra ciudad.',
            url: 'https://www.ceuta.es/ceuta/',
            type: 'colaborador',
            active: true
          },
          {
            name: 'Zonelan',
            image: '/images/sponsors/logo_zonelan.png',
            description: 'Proveedor local de servicios de internet de alta velocidad por fibra óptica, televisión y telefonía móvil y fija',
            url: 'https://zonelan.es/',
            type: 'colaborador',
            active: true
          },
          {
            name: 'Astrategas Wargames',
            image: '/images/sponsors/astrategas.jpg',
            description: 'Portal especializado en análisis tácticos, reseñas y cobertura de torneos de Warhammer 40.000 a nivel mundial.',
            url: 'https://astrategaswargames.com/',
            type: 'medio',
            active: true
          }
        ];
        
        for (let i = 0; i < defaultSponsors.length; i++) {
          await this.createSponsor(defaultSponsors[i]);
        }
        
        console.log('Patrocinadores inicializados correctamente');
      }
    } catch (error) {
      console.error('Error inicializando patrocinadores por defecto:', error);
    }
  }

  // Método para exportar todos los patrocinadores
  public async exportSponsors(): Promise<string> {
    try {
      const sponsors = await this.getAllSponsors();
      return JSON.stringify(sponsors, null, 2);
    } catch (error) {
      console.error('Error exportando patrocinadores:', error);
      throw error;
    }
  }

  // Método para importar patrocinadores
  public async importSponsors(jsonData: string): Promise<void> {
    try {
      const sponsors = JSON.parse(jsonData) as Sponsor[];
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      
      // Limpiar la tienda actual
      await tx.store.clear();
      
      // Añadir los patrocinadores importados
      for (const sponsor of sponsors) {
        await tx.store.add(sponsor);
      }
      
      await tx.done;
      console.log(`Importados ${sponsors.length} patrocinadores`);
    } catch (error) {
      console.error('Error importando patrocinadores:', error);
      throw error;
    }
  }
}

export default new SponsorsService();