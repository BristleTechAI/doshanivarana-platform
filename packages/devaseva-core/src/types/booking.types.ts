import { BookingStatus, PaymentStatus } from '../enums/status.enums';
import { SoftDelete } from './common.types';

export interface Booking extends SoftDelete {
  id: string;
  userId: string;
  poojaId: string;
  poojaName: string; // Snapshot
  templeId?: string; // Implicitly needed since we have templeName snapshot
  templeName: string; // Snapshot
  priestId?: string;
  priestName?: string; // Snapshot
  scheduledDate: string;
  scheduledTime?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  devoteeDetails: {
    name: string;
    gotra?: string;
    nakshatra?: string;
  };
  hasPrasadDelivery: boolean;
  createdAt: Date;
  updatedAt: Date;
}
