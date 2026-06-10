import { SoftDelete } from './common.types';

export interface UserProfile extends SoftDelete {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nakshatra?: string;
  gotra?: string;
  rasi?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
