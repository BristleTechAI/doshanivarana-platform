import type { Booking as CoreBooking, Slot as CoreSlot, Priest as CorePriest, BookingStatus, PaymentStatus, SlotStatus } from '@devaseva/core';

export interface Booking extends CoreBooking {
  dateTime?: string;
  pujari?: string;
  tab?: string;
  currentBookings?: number;
  maxBookings?: number;
  streamStatus?: string;
  recordingStatus?: string;
  deliveryTrackingNumber?: string;
  deliveryDispatchDate?: string;
  deliveryEstimatedDelivery?: string;
  devoteeName?: string;
}

export interface PoojaSlot extends CoreSlot {
  time?: string;
  bookings?: number;
  maxBookings?: number;
  name?: string;
}

export interface Pujari extends CorePriest {
  status?: string;
  photoUrl?: string;
  avatarBg?: string;
  avatarText?: string;
  experience?: string | number;
  specializations?: string[];
}

export type { BookingStatus, PaymentStatus, SlotStatus };

export const AVAILABLE_SPECIALIZATIONS = [
  'Satyanarayana Pooja',
  'Rudrabhishekam',
  'Chandi Homa',
  'Navagraha Shanti',
  'Vivaha (Marriage)',
  'Gruhapravesha',
  'Namakarana',
  'Annaprashana',
  'Upanayana'
];

export const AVAILABLE_LANGUAGES = [
  'Sanskrit',
  'Hindi',
  'Telugu',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Odia'
];

export interface DevoteeQuery {
  id: string;
  name: string;
  query: string;
  date: string;
  status: 'Open' | 'Resolved';
}

export interface ProProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  templeId: string;
  templeName: string;
  joinedDate: string;
  status: 'Active' | 'Inactive';
}

// Data store
let bookings: Booking[] = [];
let slots: PoojaSlot[] = [];
let pujaris: Pujari[] = [];

let queries: DevoteeQuery[] = [
  {
    id: 'Q-001',
    name: 'Suresh Kumar',
    query: 'Is the prasad delivery available for international addresses?',
    date: '08 Jun 2026',
    status: 'Open'
  },
  {
    id: 'Q-002',
    name: 'Anita Desai',
    query: 'Can we change the gotra details after booking?',
    date: '07 Jun 2026',
    status: 'Resolved'
  }
];

let profile: ProProfile = {
  id: 'PRO-1001',
  fullName: 'Ravi Shankar',
  email: 'ravi.shankar@devaseva.com',
  phone: '+91 9876543210',
  role: 'PRO',
  templeId: 'T-101',
  templeName: 'Sri Venkateswara Swamy Temple',
  joinedDate: '15 Jan 2026',
  status: 'Active'
};

export const db = {
  getBookings: () => [...bookings],
  getSlots: () => [...slots],
  getPujaris: () => [...pujaris],
  getQueries: () => [...queries],
  getProfile: () => ({...profile}),

  addBooking: (b: Booking) => { bookings.unshift(b); },
  updateBooking: (id: string, update: Partial<Booking>) => {
    bookings = bookings.map(b => b.id === id ? { ...b, ...update } : b);
  },

  addSlot: (s: PoojaSlot) => { slots.unshift(s); },
  updateSlot: (id: string, update: Partial<PoojaSlot>) => {
    slots = slots.map(s => s.id === id ? { ...s, ...update } : s);
  },
  deleteSlot: (id: string) => {
    slots = slots.filter(s => s.id !== id);
  },

  addPujari: (p: Pujari) => { pujaris.unshift(p); },
  updatePujari: (id: string, update: Partial<Pujari>) => {
    pujaris = pujaris.map(p => p.id === id ? { ...p, ...update } : p);
  },
  deletePujari: (id: string) => {
    pujaris = pujaris.filter(p => p.id !== id);
  },

  resolveQuery: (id: string) => {
    queries = queries.map(q => q.id === id ? { ...q, status: 'Resolved' } : q);
  },

  updateProfile: (update: Partial<ProProfile>) => {
    profile = { ...profile, ...update };
  }
};
