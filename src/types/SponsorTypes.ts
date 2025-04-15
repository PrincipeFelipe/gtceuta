export type SponsorType = 'patrocinador' | 'colaborador' | 'medio';

export interface Sponsor {
  id: string;
  name: string;
  image: string;
  description: string;
  url: string;
  type: SponsorType;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SponsorFormData {
  name: string;
  image: string | File;
  description: string;
  url: string;
  type: SponsorType;
  active: boolean;
}