import { PoojaCategory } from '../enums/category.enums';
import { SoftDelete } from './common.types';

export interface Pooja extends SoftDelete {
  id: string;
  name: string;
  description: string;
  templeId: string;
  category: PoojaCategory;
  price: number;
  durationMinutes: number;
  benefits?: string[];
  requirements?: string[];
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
