import { SoftDelete } from './common.types';

export interface Temple extends SoftDelete {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  state: string;
  deity: string;
  established?: string;
  timings?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
