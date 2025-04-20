import { API_URL } from '../config/api';
import { Sponsor } from '../types/SponsorTypes';

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

class SponsorsService {
  async getSponsors(): Promise<Sponsor[]> {
    try {
      const response = await fetch(`${API_URL}/sponsors/`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error al obtener sponsors:', error);
      throw error;
    }
  }

  async getSponsorsByType(type: string): Promise<Sponsor[]> {
    try {
      const response = await fetch(`${API_URL}/sponsors/by_type/?type=${type}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error al obtener sponsors de tipo ${type}:`, error);
      throw error;
    }
  }

  async addSponsor(sponsor: Omit<Sponsor, 'id'>): Promise<number> {
    try {
      // Procesar logo si es base64
      let logoUrl = sponsor.logo;
      if (sponsor.logo && typeof sponsor.logo === 'string' && sponsor.logo.startsWith('data:image')) {
        logoUrl = await this.uploadLogo(sponsor.logo);
      }
      
      const sponsorData = {
        ...sponsor,
        logo: logoUrl
      };
      
      const response = await fetch(`${API_URL}/sponsors/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsorData)
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const newSponsor = await response.json();
      return newSponsor.id;
    } catch (error) {
      console.error('Error al añadir sponsor:', error);
      throw error;
    }
  }

  async updateSponsor(sponsor: Sponsor): Promise<void> {
    try {
      // Procesar logo si es base64
      let logoUrl = sponsor.logo;
      if (sponsor.logo && typeof sponsor.logo === 'string' && sponsor.logo.startsWith('data:image')) {
        logoUrl = await this.uploadLogo(sponsor.logo);
      }
      
      const sponsorData = {
        ...sponsor,
        logo: logoUrl
      };
      
      const response = await fetch(`${API_URL}/sponsors/${sponsor.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsorData)
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al actualizar sponsor:', error);
      throw error;
    }
  }

  async deleteSponsor(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/sponsors/${id}/`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al eliminar sponsor:', error);
      throw error;
    }
  }

  async updateSponsorsOrder(sponsors: Pick<Sponsor, 'id' | 'order'>[]): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/sponsors/bulk_update_order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsors)
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al actualizar orden de sponsors:', error);
      throw error;
    }
  }

  private async uploadLogo(logoBase64: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/upload-logo/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logo: logoBase64 })
      });
      
      if (!response.ok) {
        throw new Error(`Error al subir logo: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error subiendo logo:', error);
      throw error;
    }
  }
}

export default new SponsorsService();