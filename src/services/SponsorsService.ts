import ApiService from './ApiService';
import { API_URL } from '../config/api';

export interface Sponsor {
  id?: number;
  name: string;
  description: string;
  logo?: string | File;
  website: string;
  sponsor_type: string;
  is_active: boolean;
  order: number;
}

export type SponsorFormData = Omit<Sponsor, 'id'>;

class SponsorsService {
  async getAllSponsors(): Promise<Sponsor[]> {
    return ApiService.get('/api/sponsors/');
  }

  async getSponsorsByType(type: string): Promise<Sponsor[]> {
    return ApiService.get(`/api/sponsors/?sponsor_type=${type}&active=true`);
  }

  async getSponsorById(id: number): Promise<Sponsor> {
    return ApiService.get(`/api/sponsors/${id}/`);
  }

  async addSponsor(sponsor: SponsorFormData): Promise<Sponsor> {
    // Usar FormData si hay un archivo
    if (sponsor.logo instanceof File) {
      const formData = new FormData();
      
      Object.entries(sponsor).forEach(([key, value]) => {
        if (key === 'logo') {
          formData.append(key, value as File);
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      return ApiService.post('/api/sponsors/', formData, { isFormData: true });
    }
    
    return ApiService.post('/api/sponsors/', sponsor);
  }

  async updateSponsor(sponsor: Sponsor): Promise<Sponsor> {
    // Similar al addSponsor, manejar FormData si hay File
    if (sponsor.logo instanceof File) {
      const formData = new FormData();
      
      Object.entries(sponsor).forEach(([key, value]) => {
        if (key === 'logo') {
          formData.append(key, value as File);
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      return ApiService.put(`/api/sponsors/${sponsor.id}/`, formData, { isFormData: true });
    }
    
    return ApiService.put(`/api/sponsors/${sponsor.id}/`, sponsor);
  }

  async deleteSponsor(id: number): Promise<void> {
    return ApiService.delete(`/api/sponsors/${id}/`);
  }
  
  async updateOrder(sponsors: { id: number, order: number }[]): Promise<any> {
    return ApiService.post('/api/sponsors/bulk_update_order/', sponsors);
  }

  async exportSponsors(): Promise<string> {
    const data = await ApiService.get<Sponsor[]>('/api/sponsors/export_sponsors/');
    return JSON.stringify(data, null, 2);
  }
}

export default new SponsorsService();