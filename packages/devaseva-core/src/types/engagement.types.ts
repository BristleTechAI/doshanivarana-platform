import { NotificationType, RecipientType } from '../enums/category.enums';
import { SoftDelete } from './common.types';

export interface Notification extends SoftDelete {
  id: string;
  recipientId: string;
  recipientType: RecipientType;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface Feedback extends SoftDelete {
  id: string;
  bookingId: string;
  userId: string;
  poojaId: string;
  priestId?: string;
  rating: number; // 1 to 5
  reviewText?: string;
  isPublished: boolean;
  createdAt: Date;
}

export interface Festival extends SoftDelete {
  id: string;
  name: string;
  description: string;
  date: string; // ISO Date string
  associatedPoojas: string[]; // poojaIds
  isActive: boolean;
}
