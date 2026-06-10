import { SoftDelete } from './common.types';

export interface Priest extends SoftDelete {
  id: string;
  userId: string;
  name: string;
  templeId: string;
  experienceYears: number;
  languages: string[];
  specialties: string[];
  isVerified: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}
