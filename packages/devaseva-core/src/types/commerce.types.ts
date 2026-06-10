import { PaymentStatus, DeliveryStatus, RefundStatus } from '../enums/status.enums';
import { RefundMethod } from '../enums/category.enums';
import { SoftDelete } from './common.types';

export interface Payment extends SoftDelete {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionId?: string;
  paymentGateway: string;
  createdAt: Date;
}

export interface Delivery extends SoftDelete {
  id: string;
  bookingId: string;
  userId: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber?: string;
  courierPartner?: string;
  status: DeliveryStatus;
  estimatedDeliveryDate?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Refund extends SoftDelete {
  id: string;
  bookingId: string;
  userId: string;
  paymentId: string;
  amount: number;
  reason: string;
  method: RefundMethod;
  status: RefundStatus;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
