import { SoftDelete } from './common.types';
import { SlotStatus } from '../enums/status.enums';

export interface Slot extends SoftDelete {
  id: string;
  templeId: string;
  poojaId: string;
  priestId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number;
  availableSeats: number;
  status: SlotStatus;
  createdAt: Date;
  updatedAt: Date;
}
