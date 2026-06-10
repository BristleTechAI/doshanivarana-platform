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

export interface ChatMessage {
  sender: 'devotee' | 'admin';
  senderName: string;
  avatarText: string;
  time: string;
  text: string;
}

export interface DevoteeQuery {
  id: string;
  bookingId: string;
  devoteeName: string;
  timeAgo: string;
  subject: string;
  snippet: string;
  status: 'Open' | 'Replied' | 'Closed';
  thread: ChatMessage[];
}

export interface Review {
  id: string;
  devoteeName: string;
  avatarText: string;
  avatarBg: string;
  poojaName: string;
  date: string;
  rating: number;
  submittedTime: string;
  comment: string;
  flagged?: boolean;
  status?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  ready: boolean;
  category?: string;
}

export interface StreamReadinessData {
  currentStage: 3 | 4 | 5;
  stage3: {
    videoClear: boolean;
    audioClear: boolean;
    streamKeyWorking: boolean;
    playbackTested: boolean;
  };
  stage4: {
    finalSignalCheck: boolean;
    latencyChecked: boolean;
    pujariMicSecured: boolean;
  };
}

export interface ProProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  mobile?: string;
  photoUrl?: string;
  role: string;
  templeId: string;
  templeName: string;
  joinedDate: string;
  status: 'Active' | 'Inactive';
  password?: string;
  prefEmail1?: boolean;
  prefEmail2?: boolean;
  prefEmail3?: boolean;
  prefSMS1?: boolean;
  prefSMS2?: boolean;
  prefPush1?: boolean;
  prefPush2?: boolean;
}

// ─── Default Checklist ───────────────────────────────────────────────────────
const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', label: 'Confirm pooja items are ready', ready: false, category: 'Preparation' },
  { id: 'c2', label: 'Prasad packed and labelled', ready: false, category: 'Preparation' },
  { id: 'c3', label: 'Pujari informed about schedule', ready: false, category: 'Communication' },
  { id: 'c4', label: 'Camera & tripod set up', ready: false, category: 'Equipment' },
  { id: 'c5', label: 'Microphone checked', ready: false, category: 'Equipment' },
  { id: 'c6', label: 'Internet connection stable', ready: false, category: 'Equipment' },
  { id: 'c7', label: 'Devotee notified of timing', ready: false, category: 'Communication' },
];

// ─── Data store (in-memory) ──────────────────────────────────────────────────
let bookings: Booking[] = [];
let slots: PoojaSlot[] = [];
let pujaris: Pujari[] = [];

let queries: DevoteeQuery[] = [
  {
    id: 'Q-101',
    bookingId: 'BK-1001',
    devoteeName: 'Rajesh Kumar',
    timeAgo: '2 hours ago',
    subject: 'Can I reschedule my pooja date?',
    snippet: 'Namaste, I have booked Satyanarayana Pooja...',
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Rajesh Kumar',
        avatarText: 'RK',
        time: '10 Jun 2026, 08:30 AM',
        text: 'Namaste, I have booked the Satyanarayana Pooja for today. Due to a family emergency I need to know if there is any option to move it to a different date. Please help. Thank you.'
      }
    ]
  },
  {
    id: 'Q-102',
    bookingId: 'BK-1002',
    devoteeName: 'Priya Sharma',
    timeAgo: '5 hours ago',
    subject: 'When will recording be available?',
    snippet: 'I watched the pooja live but wanted to download...',
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Priya Sharma',
        avatarText: 'PS',
        time: '10 Jun 2026, 05:15 AM',
        text: 'I watched the pooja live but wanted to download the high quality recording file to share with my relatives. Will it be sent via email or is it available inside the portal?'
      }
    ]
  },
  {
    id: 'Q-103',
    bookingId: 'BK-1003',
    devoteeName: 'Anand Reddy',
    timeAgo: 'Yesterday',
    subject: 'Prasad delivery status',
    snippet: 'My parcel was dispatched 3 days ago but has not...',
    status: 'Open',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Anand Reddy',
        avatarText: 'AR',
        time: '9 Jun 2026, 04:20 PM',
        text: 'My parcel was dispatched 3 days ago according to the notification, but the tracking ID is not updating on BlueDart. Can you check if it was picked up?'
      }
    ]
  },
  {
    id: 'Q-104',
    bookingId: 'BK-1004',
    devoteeName: 'Sunita Devi',
    timeAgo: '2 days ago',
    subject: 'Booking confirmation not received',
    snippet: 'I completed payment but did not get confirmation...',
    status: 'Replied',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Sunita Devi',
        avatarText: 'SD',
        time: '8 Jun 2026, 09:10 AM',
        text: 'I completed payment of Rs.1500 on UPI but did not get any booking confirmation email or slot details. Please verify payment.'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: '8 Jun 2026, 11:30 AM',
        text: 'Namaste Sunita Devi, we checked our system and confirmed your payment for Booking BK-1004. You should have received the notification on the app now. Let us know if you need more assistance.'
      }
    ]
  },
  {
    id: 'Q-105',
    bookingId: 'BK-1005',
    devoteeName: 'Kiran Patel',
    timeAgo: '3 days ago',
    subject: 'Pujari name for my pooja',
    snippet: 'Who is the pujari assigned for Satyanarayana?',
    status: 'Replied',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Kiran Patel',
        avatarText: 'KP',
        time: '7 Jun 2026, 02:40 PM',
        text: 'Who is the pujari assigned for our Satyanarayana Pooja booking? We would like to connect with him beforehand.'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: '7 Jun 2026, 04:00 PM',
        text: 'Namaste Kiran Patel, Pt. Sharma Ji has been assigned to your pooja. You can see his profile details and specialization inside the bookings tab.'
      }
    ]
  },
  {
    id: 'Q-106',
    bookingId: 'BK-1006',
    devoteeName: 'Gopal Das',
    timeAgo: '4 days ago',
    subject: 'System login issues',
    snippet: 'I am not able to login using OTP...',
    status: 'Closed',
    thread: [
      {
        sender: 'devotee',
        senderName: 'Gopal Das',
        avatarText: 'GD',
        time: '6 Jun 2026, 01:10 PM',
        text: 'I am not able to login using OTP. It shows verification timed out. Can you please check?'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: '6 Jun 2026, 03:00 PM',
        text: 'Namaste Gopal, there was a temporary gateway timeout which has now been fixed. Please try logging in again.'
      }
    ]
  }
];

let reviews: Review[] = [
  {
    id: '1',
    devoteeName: 'Rajesh Kumar',
    avatarText: 'R',
    avatarBg: 'bg-tertiary-container text-on-tertiary-container',
    poojaName: 'Satyanarayana Pooja',
    date: '9 Jun 2026',
    rating: 5,
    submittedTime: '9:00 AM',
    comment: '"The pooja was conducted beautifully by Pt. Sharma Ji. The live stream quality was excellent and we could participate fully from Bangalore. The prasad also arrived on time. Highly recommended!"',
    status: 'PUBLISHED'
  },
  {
    id: '2',
    devoteeName: 'Priya Sharma',
    avatarText: 'P',
    avatarBg: 'bg-secondary-container text-on-secondary-container',
    poojaName: 'Ganapathi Homam',
    date: '9 Jun 2026',
    rating: 4,
    submittedTime: '6:30 PM',
    comment: '"Very well organized. The recording was available quickly after the pooja. Would have liked a better camera angle during the main ritual."',
    status: 'PUBLISHED'
  },
  {
    id: '3',
    devoteeName: 'Anand Reddy',
    avatarText: 'A',
    avatarBg: 'bg-[#e8def8] text-[#1d192b]',
    poojaName: 'Lakshmi Pooja',
    date: '8 Jun 2026',
    rating: 5,
    submittedTime: '10:15 AM',
    comment: '"Excellent experience. First time using Doshanivarana and very impressed with the seamless process from booking to delivery."',
    status: 'PUBLISHED'
  },
  {
    id: '4',
    devoteeName: 'Sunita Devi',
    avatarText: 'S',
    avatarBg: 'bg-[#f8bd00] text-white',
    poojaName: 'Navagraha Pooja',
    date: '7 Jun 2026',
    rating: 3,
    submittedTime: '4:00 PM',
    comment: '"The stream went offline for about 10 minutes in the middle of the pooja. Please ensure stable internet connection."',
    status: 'PENDING'
  },
  {
    id: '5',
    devoteeName: 'Unknown User',
    avatarText: 'U',
    avatarBg: 'bg-surface-variant text-on-surface-variant',
    poojaName: 'Special Archana',
    date: '5 Jun 2026',
    rating: 1,
    submittedTime: '1:00 PM',
    comment: 'This feedback has been flagged by Admin for review',
    flagged: true,
    status: 'HIDDEN'
  }
];

// Per-booking checklists and stream readiness (in-memory maps)
const readinessMap: Record<string, ChecklistItem[]> = {};
const streamReadinessMap: Record<string, StreamReadinessData> = {};

let profile: ProProfile = {
  id: 'PRO-1001',
  fullName: 'Ravi Kumar',
  email: 'ravi.kumar@doshanivarana.in',
  phone: '+91 98765 43210',
  mobile: '+91 98765 43210',
  role: 'PRO',
  templeId: 'T-101',
  templeName: 'Sri Venkateswara Temple',
  joinedDate: '15 Mar 2026',
  status: 'Active',
  password: 'password',
  prefEmail1: true,
  prefEmail2: true,
  prefEmail3: false,
  prefSMS1: true,
  prefSMS2: true,
  prefPush1: true,
  prefPush2: true,
};

export const db = {
  // ─── Bookings ─────────────────────────────────────────────────────────────
  getBookings: () => [...bookings],
  getBookingById: (id: string) => bookings.find(b => b.id === id),
  addBooking: (b: Booking) => { bookings.unshift(b); },
  updateBooking: (id: string, update: Partial<Booking>) => {
    bookings = bookings.map(b => b.id === id ? { ...b, ...update } : b);
  },

  // ─── Slots ────────────────────────────────────────────────────────────────
  getSlots: () => [...slots],
  addSlot: (s: PoojaSlot) => { slots.unshift(s); },
  updateSlot: (id: string, update: Partial<PoojaSlot>) => {
    slots = slots.map(s => s.id === id ? { ...s, ...update } : s);
  },
  deleteSlot: (id: string) => {
    slots = slots.filter(s => s.id !== id);
  },

  // ─── Pujaris ──────────────────────────────────────────────────────────────
  getPujaris: () => [...pujaris],
  addPujari: (p: Pujari) => { pujaris.unshift(p); },
  updatePujari: (id: string, update: Partial<Pujari>) => {
    pujaris = pujaris.map(p => p.id === id ? { ...p, ...update } : p);
  },
  deletePujari: (id: string) => {
    pujaris = pujaris.filter(p => p.id !== id);
  },

  // ─── Queries ──────────────────────────────────────────────────────────────
  getQueries: () => [...queries],
  updateQuery: (updated: DevoteeQuery) => {
    queries = queries.map(q => q.id === updated.id ? updated : q);
  },

  // ─── Feedback / Reviews ───────────────────────────────────────────────────
  getFeedback: () => [...reviews],
  saveFeedback: (updated: Review[]) => {
    reviews = updated;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('doshanivarana_feedback_updated'));
    }
  },

  // ─── Readiness Checklist ──────────────────────────────────────────────────
  getReadinessChecklist: (bookingId: string): ChecklistItem[] => {
    return readinessMap[bookingId] ? [...readinessMap[bookingId]] : DEFAULT_CHECKLIST.map(i => ({ ...i }));
  },
  saveReadinessChecklist: (bookingId: string, items: ChecklistItem[]) => {
    readinessMap[bookingId] = items;
  },

  // ─── Stream Readiness ─────────────────────────────────────────────────────
  getStreamReadiness: (bookingId: string): StreamReadinessData => {
    return streamReadinessMap[bookingId] ?? {
      currentStage: 3,
      stage3: { videoClear: false, audioClear: false, streamKeyWorking: false, playbackTested: false },
      stage4: { finalSignalCheck: false, latencyChecked: false, pujariMicSecured: false }
    };
  },
  saveStreamReadiness: (bookingId: string, data: StreamReadinessData) => {
    streamReadinessMap[bookingId] = data;
  },

  // ─── Profile ──────────────────────────────────────────────────────────────
  getProfile: () => ({ ...profile }),
  saveProfile: (update: Partial<ProProfile>) => {
    profile = { ...profile, ...update };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('doshanivarana_profile_updated'));
    }
  }
};