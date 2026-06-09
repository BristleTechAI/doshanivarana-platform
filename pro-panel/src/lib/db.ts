// TypeScript interfaces for entities

export interface Booking {
  id: string;
  devoteeName: string;
  gotra: string;
  nakshatra: string;
  mobile: string;
  email: string;
  poojaName: string;
  temple: string;
  dateTime: string; // e.g. "09 Jun 2026, 10:00 AM"
  paymentStatus: 'Confirmed' | 'Pending';
  amount: string;
  paymentMethod: string;
  orderId: string;
  pujari: string;
  delivery: 'Yes' | 'No';
  deliveryAddress: string;
  deliveryStatus: 'Not Applicable' | 'Booked' | 'Packed' | 'Dispatched' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  streamStatus: 'Not Started' | 'In Progress' | 'Ended';
  recordingStatus: 'Not Available' | 'Processing' | 'Available';
  feedback: string | null;
  maxBookings: number;
  currentBookings: number;
  tab: 'upcoming' | 'completed';
  deliveryDaysPending?: number;
  deliveryIsUrgent?: boolean;
  deliveryWeight?: string;
  deliveryLength?: string;
  deliveryWidth?: string;
  deliveryHeight?: string;
  deliveryContents?: string;
  deliveryCourier?: string;
  deliveryTrackingNumber?: string;
  deliveryDispatchDate?: string;
  deliveryEstimatedDelivery?: string;
}

export interface PoojaSlot {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  bookings: number;
  maxBookings: number;
  availability: 'Open' | 'Full';
  status: boolean; // true = Active, false = Inactive
}

export interface Pujari {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  specializations: string[];
  experience: string;
  bookingsCount: number;
  avatarText: string;
  avatarBg: string;
  contact?: string;
}

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
}

export interface Recording {
  id: string;
  poojaName: string;
  slotDate: string;
  duration: string;
  autoSaved: 'Yes' | 'No';
  status: 'Processing' | 'Ready to Publish' | 'Published' | 'Upload Required';
  bookingsCount: number;
}

export interface ChecklistItem {
  id: string;
  name: string;
  ready: boolean;
  notes?: string;
}

export interface Stage3Checklist {
  videoClear: boolean;
  audioClear: boolean;
  streamKeyWorking: boolean;
  playbackTested: boolean;
}

export interface Stage4Checklist {
  finalSignalCheck: boolean;
  latencyChecked: boolean;
  pujariMicSecured: boolean;
}

export interface StreamReadinessData {
  currentStage: 3 | 4 | 5;
  stage3: Stage3Checklist;
  stage4: Stage4Checklist;
}

export interface ProfileSettingsData {
  fullName: string;
  mobile: string;
  email: string;
  prefEmail1: boolean;
  prefEmail2: boolean;
  prefEmail3: boolean;
  prefSMS1: boolean;
  prefSMS2: boolean;
  prefPush1: boolean;
  prefPush2: boolean;
}

// LocalStorage Keys
const KEYS = {
  BOOKINGS: 'doshanivarana_bookings',
  SLOTS: 'doshanivarana_slots',
  PUJARIS: 'doshanivarana_pujaris',
  QUERIES: 'doshanivarana_queries',
  FEEDBACK: 'doshanivarana_feedback',
  RECORDINGS: 'doshanivarana_recordings',
  READINESS: 'doshanivarana_readiness',
  STREAM_READINESS: 'doshanivarana_stream_readiness',
  PROFILE: 'doshanivarana_profile',
};

// Default Checklist Items
const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', name: 'Turmeric (Pasupu)', ready: false, notes: 'Need to procure' },
  { id: '2', name: 'Kumkum', ready: false },
  { id: '3', name: 'Panchamrutam Ingredients', ready: false },
  { id: '4', name: 'Pooja Plate (Thamboolam)', ready: false },
  { id: '5', name: 'Flowers', ready: true },
  { id: '6', name: 'Coconut', ready: true },
  { id: '7', name: 'Banana', ready: true },
  { id: '8', name: 'Incense Sticks', ready: true },
  { id: '9', name: 'Camphor', ready: true },
  { id: '10', name: 'Sacred Thread', ready: true },
  { id: '11', name: 'Betel Leaves', ready: true },
  { id: '12', name: 'Ghee', ready: true },
];

// Date generation helpers
const getRelativeDateStr = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const getRelativeDateTimeStr = (daysOffset: number, timeStr: string): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${formattedDate}, ${timeStr}`;
};

const getRelativeFeedbackTimeStr = (daysOffset: number, timeStr: string): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  return `Submitted ${formattedDate} ${timeStr}`;
};

// Seed/Initial Data
const initialBookings: Booking[] = [
  {
    id: 'BK-1001',
    devoteeName: 'Rajesh Kumar',
    gotra: 'Kashyapa',
    nakshatra: 'Rohini',
    mobile: '+91 98765 43210',
    email: 'rajesh@email.com',
    poojaName: 'Satyanarayana Pooja',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(0, '10:00 AM'), // Today 10:00 AM
    paymentStatus: 'Confirmed',
    amount: '₹1,500',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00891',
    pujari: 'Not Assigned',
    delivery: 'Yes',
    deliveryAddress: '42 MG Road, Bangalore, Karnataka 560001',
    deliveryStatus: 'Packed',
    streamStatus: 'Not Started',
    recordingStatus: 'Not Available',
    feedback: null,
    maxBookings: 15,
    currentBookings: 12,
    tab: 'upcoming',
    deliveryDaysPending: 2,
    deliveryIsUrgent: false,
    deliveryWeight: '0.8',
    deliveryLength: '25',
    deliveryWidth: '20',
    deliveryHeight: '15',
    deliveryContents: 'Prasad items: coconut, flowers, sacred thread, tilak powder',
    deliveryCourier: 'Delhivery',
    deliveryTrackingNumber: 'DL2026051098765',
    deliveryDispatchDate: getRelativeDateTimeStr(0, '10:00 AM').split(',')[0],
    deliveryEstimatedDelivery: getRelativeDateTimeStr(3, '06:00 PM').split(',')[0]
  },
  {
    id: 'BK-1002',
    devoteeName: 'Priya Sharma',
    gotra: 'Bharadwaja',
    nakshatra: 'Arudra',
    mobile: '+91 98765 43211',
    email: 'priya@email.com',
    poojaName: 'Ganapathi Homam',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(0, '02:00 PM'), // Today 02:00 PM
    paymentStatus: 'Confirmed',
    amount: '₹2,500',
    paymentMethod: 'Netbanking',
    orderId: 'RZP-2026-00892',
    pujari: 'Not Assigned',
    delivery: 'No',
    deliveryAddress: 'N/A',
    deliveryStatus: 'Not Applicable',
    streamStatus: 'Not Started',
    recordingStatus: 'Not Available',
    feedback: null,
    maxBookings: 5,
    currentBookings: 3,
    tab: 'upcoming'
  },
  {
    id: 'BK-1003',
    devoteeName: 'Anand Reddy',
    gotra: 'Vashishta',
    nakshatra: 'Anuradha',
    mobile: '+91 98765 43212',
    email: 'anand@email.com',
    poojaName: 'Lakshmi Pooja',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(1, '09:00 AM'), // Tomorrow 09:00 AM
    paymentStatus: 'Confirmed',
    amount: '₹3,000',
    paymentMethod: 'Credit Card',
    orderId: 'RZP-2026-00893',
    pujari: 'Not Assigned',
    delivery: 'Yes',
    deliveryAddress: '128 Jayanagar, Bangalore, Karnataka 560041',
    deliveryStatus: 'Booked',
    streamStatus: 'Not Started',
    recordingStatus: 'Not Available',
    feedback: null,
    maxBookings: 10,
    currentBookings: 8,
    tab: 'upcoming',
    deliveryDaysPending: 1,
    deliveryIsUrgent: false,
    deliveryWeight: '0.5',
    deliveryLength: '20',
    deliveryWidth: '15',
    deliveryHeight: '10',
    deliveryContents: 'Prasad items: kumkum, turmeric, sweet prasadam packet',
    deliveryCourier: 'BlueDart',
    deliveryTrackingNumber: '',
    deliveryDispatchDate: getRelativeDateTimeStr(0, '09:00 AM').split(',')[0],
    deliveryEstimatedDelivery: getRelativeDateTimeStr(4, '06:00 PM').split(',')[0]
  },
  {
    id: 'BK-1004',
    devoteeName: 'Sunita Devi',
    gotra: 'Shandilya',
    nakshatra: 'Pushya',
    mobile: '+91 98765 43213',
    email: 'sunita@email.com',
    poojaName: 'Navagraha Pooja',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(2, '11:00 AM'),
    paymentStatus: 'Confirmed',
    amount: '₹1,500',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00894',
    pujari: 'Ravi Pandit',
    delivery: 'No',
    deliveryAddress: 'N/A',
    deliveryStatus: 'Not Applicable',
    streamStatus: 'Not Started',
    recordingStatus: 'Not Available',
    feedback: 'Very serene and well conducted Pooja. Thanks to the temple authorities.',
    maxBookings: 15,
    currentBookings: 10,
    tab: 'upcoming'
  },
  {
    id: 'BK-1005',
    devoteeName: 'Kiran Patel',
    gotra: 'Gautama',
    nakshatra: 'Revati',
    mobile: '+91 98765 43214',
    email: 'kiran@email.com',
    poojaName: 'Satyanarayana Pooja',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(5, '10:00 AM'),
    paymentStatus: 'Confirmed',
    amount: '₹1,500',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00895',
    pujari: 'Not Assigned',
    delivery: 'Yes',
    deliveryAddress: 'Block C, Flat 402, Powai, Mumbai, Maharashtra 400076',
    deliveryStatus: 'Booked',
    streamStatus: 'Not Started',
    recordingStatus: 'Not Available',
    feedback: null,
    maxBookings: 15,
    currentBookings: 3,
    tab: 'upcoming',
    deliveryDaysPending: 3,
    deliveryIsUrgent: true,
    deliveryWeight: '0.9',
    deliveryLength: '30',
    deliveryWidth: '20',
    deliveryHeight: '15',
    deliveryContents: 'Prasad items: holy water, coconut, dry fruits, flowers',
    deliveryCourier: 'DTDC',
    deliveryTrackingNumber: '',
    deliveryDispatchDate: getRelativeDateTimeStr(0, '10:00 AM').split(',')[0],
    deliveryEstimatedDelivery: getRelativeDateTimeStr(3, '06:00 PM').split(',')[0]
  },
  {
    id: 'BK-1006',
    devoteeName: 'Meena Iyer',
    gotra: 'Kashyapa',
    nakshatra: 'Krittika',
    mobile: '+91 98765 43215',
    email: 'meena@email.com',
    poojaName: 'Ganapathi Homam',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(5, '02:00 PM'),
    paymentStatus: 'Confirmed',
    amount: '₹2,500',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00896',
    pujari: 'Sharma Ji',
    delivery: 'No',
    deliveryAddress: 'N/A',
    deliveryStatus: 'Not Applicable',
    streamStatus: 'Not Started',
    recordingStatus: 'Not Available',
    feedback: null,
    maxBookings: 10,
    currentBookings: 8,
    tab: 'upcoming'
  },
  {
    id: 'BK-1007',
    devoteeName: 'Suresh Raina',
    gotra: 'Bharadwaja',
    nakshatra: 'Swati',
    mobile: '+91 98765 43216',
    email: 'suresh@email.com',
    poojaName: 'Rudra Abhishekam',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(-5, '10:00 AM'),
    paymentStatus: 'Confirmed',
    amount: '₹1,500',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00790',
    pujari: 'Sharma Ji',
    delivery: 'Yes',
    deliveryAddress: '12 Ram Nagar, Ghaziabad, Uttar Pradesh 201001',
    deliveryStatus: 'Packed',
    streamStatus: 'Ended',
    recordingStatus: 'Available',
    feedback: 'The Rudra Abhishekam was performed with absolute devotion. Prasad reached on time and was very fresh. Thank you Pt. Sharma Ji!',
    maxBookings: 10,
    currentBookings: 10,
    tab: 'completed',
    deliveryDaysPending: 1,
    deliveryIsUrgent: false,
    deliveryWeight: '0.6',
    deliveryLength: '22',
    deliveryWidth: '18',
    deliveryHeight: '12',
    deliveryContents: 'Prasad items: honey, dry fruits, sacred ash, rudraksha',
    deliveryCourier: 'Delhivery',
    deliveryTrackingNumber: 'DL2026050511223',
    deliveryDispatchDate: getRelativeDateTimeStr(-5, '10:00 AM').split(',')[0],
    deliveryEstimatedDelivery: getRelativeDateTimeStr(-2, '06:00 PM').split(',')[0]
  },
  {
    id: 'BK-1008',
    devoteeName: 'Amit Shah',
    gotra: 'Kashyapa',
    nakshatra: 'Pushya',
    mobile: '+91 98765 43217',
    email: 'amit@email.com',
    poojaName: 'Ganapathi Homam',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(-2, '02:00 PM'),
    paymentStatus: 'Confirmed',
    amount: '₹2,500',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00791',
    pujari: 'Venkat Sastry',
    delivery: 'Yes',
    deliveryAddress: '5 Corporate Circle, Ahmedabad, Gujarat 380001',
    deliveryStatus: 'Dispatched',
    streamStatus: 'Ended',
    recordingStatus: 'Available',
    feedback: 'Perfect stream quality. Thank you.',
    maxBookings: 10,
    currentBookings: 10,
    tab: 'completed',
    deliveryDaysPending: 2,
    deliveryIsUrgent: false,
    deliveryWeight: '0.7',
    deliveryLength: '24',
    deliveryWidth: '18',
    deliveryHeight: '14',
    deliveryContents: 'Prasad items: turmeric, kumkum, sweet modak packet',
    deliveryCourier: 'Delhivery',
    deliveryTrackingNumber: 'DL2026050844556',
    deliveryDispatchDate: getRelativeDateTimeStr(-2, '02:00 PM').split(',')[0],
    deliveryEstimatedDelivery: getRelativeDateTimeStr(1, '06:00 PM').split(',')[0]
  },
  {
    id: 'BK-1009',
    devoteeName: 'Rahul G',
    gotra: 'Vashishta',
    nakshatra: 'Punarvasu',
    mobile: '+91 98765 43218',
    email: 'rahul@email.com',
    poojaName: 'Lakshmi Pooja',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(-2, '09:00 AM'),
    paymentStatus: 'Confirmed',
    amount: '₹3,000',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00792',
    pujari: 'Narasimha Bhat',
    delivery: 'Yes',
    deliveryAddress: 'Hill View Bungalow, Wayanad, Kerala 670645',
    deliveryStatus: 'In Transit',
    streamStatus: 'Ended',
    recordingStatus: 'Available',
    feedback: null,
    maxBookings: 10,
    currentBookings: 10,
    tab: 'completed',
    deliveryDaysPending: 1,
    deliveryIsUrgent: false,
    deliveryWeight: '0.5',
    deliveryLength: '20',
    deliveryWidth: '15',
    deliveryHeight: '10',
    deliveryContents: 'Prasad items: sacred thread, turmeric, sweet prasadam',
    deliveryCourier: 'BlueDart',
    deliveryTrackingNumber: 'BD998877665',
    deliveryDispatchDate: getRelativeDateTimeStr(-2, '09:00 AM').split(',')[0],
    deliveryEstimatedDelivery: getRelativeDateTimeStr(1, '06:00 PM').split(',')[0]
  },
  {
    id: 'BK-1010',
    devoteeName: 'Arvind K',
    gotra: 'Shandilya',
    nakshatra: 'Hasta',
    mobile: '+91 98765 43219',
    email: 'arvind@email.com',
    poojaName: 'Navagraha Pooja',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(-3, '11:00 AM'),
    paymentStatus: 'Confirmed',
    amount: '₹1,500',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00793',
    pujari: 'Narasimha Bhat',
    delivery: 'Yes',
    deliveryAddress: '1 Civil Lines, New Delhi, Delhi 110054',
    deliveryStatus: 'In Transit',
    streamStatus: 'Ended',
    recordingStatus: 'Available',
    feedback: null,
    maxBookings: 8,
    currentBookings: 8,
    tab: 'completed',
    deliveryDaysPending: 3,
    deliveryIsUrgent: false,
    deliveryWeight: '0.6',
    deliveryLength: '22',
    deliveryWidth: '16',
    deliveryHeight: '12',
    deliveryContents: 'Prasad items: navagraha thread, tilak, dry fruits',
    deliveryCourier: 'BlueDart',
    deliveryTrackingNumber: 'BD443322110',
    deliveryDispatchDate: getRelativeDateTimeStr(-3, '11:00 AM').split(',')[0],
    deliveryEstimatedDelivery: getRelativeDateTimeStr(0, '06:00 PM').split(',')[0]
  },
  {
    id: 'BK-0990',
    devoteeName: 'Suresh Raina',
    gotra: 'Bharadwaja',
    nakshatra: 'Swati',
    mobile: '+91 98765 43216',
    email: 'suresh@email.com',
    poojaName: 'Rudra Abhishekam',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(-5, '10:00 AM'),
    paymentStatus: 'Confirmed',
    amount: '₹1,500',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00790',
    pujari: 'Sharma Ji',
    delivery: 'Yes',
    deliveryAddress: '12 Ram Nagar, Ghaziabad, Uttar Pradesh 201001',
    deliveryStatus: 'Delivered',
    streamStatus: 'Ended',
    recordingStatus: 'Available',
    feedback: 'The Rudra Abhishekam was performed with absolute devotion. Prasad reached on time and was very fresh. Thank you Pt. Sharma Ji!',
    maxBookings: 10,
    currentBookings: 10,
    tab: 'completed',
    deliveryDaysPending: 4,
    deliveryIsUrgent: false,
    deliveryWeight: '0.6',
    deliveryLength: '22',
    deliveryWidth: '18',
    deliveryHeight: '12',
    deliveryContents: 'Prasad items: honey, dry fruits, sacred ash, rudraksha',
    deliveryCourier: 'Delhivery',
    deliveryTrackingNumber: 'DL2026050511223',
    deliveryDispatchDate: getRelativeDateTimeStr(-5, '10:00 AM').split(',')[0],
    deliveryEstimatedDelivery: getRelativeDateTimeStr(-2, '06:00 PM').split(',')[0]
  },
  {
    id: 'BK-0989',
    devoteeName: 'Virat K',
    gotra: 'Kashyapa',
    nakshatra: 'Rohini',
    mobile: '+91 98765 43233',
    email: 'virat@email.com',
    poojaName: 'Ganapathi Homam',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(-6, '02:00 PM'),
    paymentStatus: 'Confirmed',
    amount: '₹2,500',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00778',
    pujari: 'Sharma Ji',
    delivery: 'Yes',
    deliveryAddress: '10 Chinnaswamy Way, Bangalore, Karnataka 560001',
    deliveryStatus: 'Delivered',
    streamStatus: 'Ended',
    recordingStatus: 'Available',
    feedback: 'Wonderful stream. Very happy with the service.',
    maxBookings: 10,
    currentBookings: 10,
    tab: 'completed',
    deliveryDaysPending: 5,
    deliveryIsUrgent: false,
    deliveryWeight: '0.7',
    deliveryCourier: 'Delhivery',
    deliveryTrackingNumber: 'DL2026050477889'
  },
  {
    id: 'BK-0988',
    devoteeName: 'Rohit S',
    gotra: 'Vashishta',
    nakshatra: 'Anuradha',
    mobile: '+91 98765 43244',
    email: 'rohit@email.com',
    poojaName: 'Lakshmi Pooja',
    temple: 'Sri Venkateswara Temple',
    dateTime: getRelativeDateTimeStr(-7, '09:00 AM'),
    paymentStatus: 'Confirmed',
    amount: '₹3,000',
    paymentMethod: 'UPI',
    orderId: 'RZP-2026-00777',
    pujari: 'Narasimha Bhat',
    delivery: 'Yes',
    deliveryAddress: 'Marine Drive Flat, Mumbai, Maharashtra 400020',
    deliveryStatus: 'Delivered',
    streamStatus: 'Ended',
    recordingStatus: 'Available',
    feedback: 'Very serene.',
    maxBookings: 10,
    currentBookings: 10,
    tab: 'completed',
    deliveryDaysPending: 6,
    deliveryIsUrgent: false,
    deliveryWeight: '0.5',
    deliveryCourier: 'BlueDart',
    deliveryTrackingNumber: 'BD554433221'
  }
];

const initialSlots: PoojaSlot[] = [
  { id: '1', name: 'Satyanarayana Pooja', date: getRelativeDateStr(0), time: '10:00 AM', bookings: 12, maxBookings: 15, availability: 'Open', status: true },
  { id: '2', name: 'Ganapathi Homam', date: getRelativeDateStr(0), time: '02:00 PM', bookings: 10, maxBookings: 10, availability: 'Full', status: true },
  { id: '3', name: 'Lakshmi Pooja', date: getRelativeDateStr(1), time: '09:00 AM', bookings: 5, maxBookings: 10, availability: 'Open', status: true },
  { id: '4', name: 'Navagraha Pooja', date: getRelativeDateStr(2), time: '11:00 AM', bookings: 8, maxBookings: 8, availability: 'Full', status: true },
  { id: '5', name: 'Satyanarayana Pooja', date: getRelativeDateStr(5), time: '10:00 AM', bookings: 3, maxBookings: 15, availability: 'Open', status: true },
  { id: '6', name: 'Ganapathi Homam', date: getRelativeDateStr(-2), time: '02:00 PM', bookings: 10, maxBookings: 10, availability: 'Full', status: false },
];

const initialPujaris: Pujari[] = [
  {
    id: 'PJ-001',
    name: 'Pt. Sharma Ji',
    status: 'Active',
    specializations: ['Satyanarayana Pooja', 'Ganapathi Homam'],
    experience: '15 years',
    bookingsCount: 24,
    avatarText: 'SJ',
    avatarBg: 'bg-primary text-on-primary'
  },
  {
    id: 'PJ-002',
    name: 'Ravi Pandit',
    status: 'Active',
    specializations: ['Lakshmi Pooja', 'Navagraha Pooja'],
    experience: '8 years',
    bookingsCount: 18,
    avatarText: 'RP',
    avatarBg: 'bg-secondary-container text-on-secondary-container'
  },
  {
    id: 'PJ-003',
    name: 'Krishna Acharya',
    status: 'Active',
    specializations: ['Rudra Abhishekam', 'Satyanarayana Pooja'],
    experience: '22 years',
    bookingsCount: 31,
    avatarText: 'KA',
    avatarBg: 'bg-tertiary text-on-tertiary'
  },
  {
    id: 'PJ-004',
    name: 'Venkat Sastry',
    status: 'Active',
    specializations: ['Ganapathi Homam'],
    experience: '5 years',
    bookingsCount: 9,
    avatarText: 'VS',
    avatarBg: 'bg-outline text-white'
  },
  {
    id: 'PJ-005',
    name: 'Narasimha Bhat',
    status: 'Active',
    specializations: ['Navagraha Pooja', 'Lakshmi Pooja'],
    experience: '12 years',
    bookingsCount: 15,
    avatarText: 'NB',
    avatarBg: 'bg-primary text-on-primary'
  },
  {
    id: 'PJ-006',
    name: 'Gopal Das',
    status: 'Inactive',
    specializations: ['Satyanarayana Pooja'],
    experience: '3 years',
    bookingsCount: 0,
    avatarText: 'GD',
    avatarBg: 'bg-surface-variant text-on-surface-variant border border-outline-variant'
  }
];

const initialQueries: DevoteeQuery[] = [
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
        time: getRelativeDateTimeStr(0, '08:30 AM'),
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
        time: getRelativeDateTimeStr(0, '05:15 AM'),
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
        time: getRelativeDateTimeStr(-1, '04:20 PM'),
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
        time: getRelativeDateTimeStr(-2, '09:10 AM'),
        text: 'I completed payment of Rs.1500 on UPI but did not get any booking confirmation email or slot details. Please verify payment.'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: getRelativeDateTimeStr(-2, '11:30 AM'),
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
        time: getRelativeDateTimeStr(-3, '02:40 PM'),
        text: 'Who is the pujari assigned for our Satyanarayana Pooja booking? We would like to connect with him beforehand.'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: getRelativeDateTimeStr(-3, '04:00 PM'),
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
        time: getRelativeDateTimeStr(-4, '01:10 PM'),
        text: 'I am not able to login using OTP. It shows verification timed out. Can you please check?'
      },
      {
        sender: 'admin',
        senderName: 'Ravi PRO',
        avatarText: 'RP',
        time: getRelativeDateTimeStr(-4, '03:00 PM'),
        text: 'Namaste Gopal, there was a temporary gateway timeout which has now been fixed. Please try logging in again.'
      }
    ]
  }
];

const initialReviews: Review[] = [
  {
    id: '1',
    devoteeName: 'Rajesh Kumar',
    avatarText: 'R',
    avatarBg: 'bg-tertiary-container text-on-tertiary-container',
    poojaName: 'Satyanarayana Pooja',
    date: getRelativeDateTimeStr(-1, '09:00 AM').split(',')[0],
    rating: 5,
    submittedTime: getRelativeFeedbackTimeStr(-1, '9:00 AM'),
    comment: '"The pooja was conducted beautifully by Pt. Sharma Ji. The live stream quality was excellent and we could participate fully from Bangalore. The prasad also arrived on time. Highly recommended!"'
  },
  {
    id: '2',
    devoteeName: 'Priya Sharma',
    avatarText: 'P',
    avatarBg: 'bg-secondary-container text-on-secondary-container',
    poojaName: 'Ganapathi Homam',
    date: getRelativeDateTimeStr(-1, '06:30 PM').split(',')[0],
    rating: 4,
    submittedTime: getRelativeFeedbackTimeStr(-1, '6:30 PM'),
    comment: '"Very well organized. The recording was available quickly after the pooja. Would have liked a better camera angle during the main ritual."'
  },
  {
    id: '3',
    devoteeName: 'Anand Reddy',
    avatarText: 'A',
    avatarBg: 'bg-[#e8def8] text-[#1d192b]',
    poojaName: 'Lakshmi Pooja',
    date: getRelativeDateTimeStr(-2, '10:15 AM').split(',')[0],
    rating: 5,
    submittedTime: getRelativeFeedbackTimeStr(-2, '10:15 AM'),
    comment: '"Excellent experience. First time using Doshanivarana and very impressed with the seamless process from booking to delivery."'
  },
  {
    id: '4',
    devoteeName: 'Sunita Devi',
    avatarText: 'S',
    avatarBg: 'bg-[#f8bd00] text-white',
    poojaName: 'Navagraha Pooja',
    date: getRelativeDateTimeStr(-3, '04:00 PM').split(',')[0],
    rating: 3,
    submittedTime: getRelativeFeedbackTimeStr(-3, '4:00 PM'),
    comment: '"The stream went offline for about 10 minutes in the middle of the pooja. Please ensure stable internet connection."'
  },
  {
    id: '5',
    devoteeName: 'Unknown User',
    avatarText: 'U',
    avatarBg: 'bg-surface-variant text-on-surface-variant',
    poojaName: 'Special Archana',
    date: getRelativeDateTimeStr(-5, '01:00 PM').split(',')[0],
    rating: 1,
    submittedTime: getRelativeFeedbackTimeStr(-5, '1:00 PM'),
    comment: 'This feedback has been flagged by Admin for review',
    flagged: true
  }
];

const initialRecordings: Recording[] = [
  { id: '1', poojaName: 'Ganapathi Homam', slotDate: getRelativeDateTimeStr(0, '02:00 PM').split(',')[0], duration: '1h 12m', autoSaved: 'Yes', status: 'Processing', bookingsCount: 15 },
  { id: '2', poojaName: 'Satyanarayana Pooja', slotDate: getRelativeDateTimeStr(-1, '10:00 AM').split(',')[0], duration: '45m', autoSaved: 'Yes', status: 'Ready to Publish', bookingsCount: 12 },
  { id: '3', poojaName: 'Lakshmi Pooja', slotDate: getRelativeDateTimeStr(-2, '09:00 AM').split(',')[0], duration: '58m', autoSaved: 'Yes', status: 'Ready to Publish', bookingsCount: 8 },
  { id: '4', poojaName: 'Navagraha Pooja', slotDate: getRelativeDateTimeStr(-3, '11:00 AM').split(',')[0], duration: '—', autoSaved: 'No', status: 'Upload Required', bookingsCount: 5 },
  { id: '5', poojaName: 'Satyanarayana Pooja', slotDate: getRelativeDateTimeStr(-5, '10:00 AM').split(',')[0], duration: '52m', autoSaved: 'Yes', status: 'Published', bookingsCount: 14 },
  { id: '6', poojaName: 'Ganapathi Homam', slotDate: getRelativeDateTimeStr(-7, '02:00 PM').split(',')[0], duration: '1h 05m', autoSaved: 'Yes', status: 'Published', bookingsCount: 9 }
];

const initialProfile: ProfileSettingsData = {
  fullName: 'Ravi Kumar',
  mobile: '+91 98765 43210',
  email: 'ravi.kumar@doshanivarana.in',
  prefEmail1: true,
  prefEmail2: true,
  prefEmail3: false,
  prefSMS1: true,
  prefSMS2: true,
  prefPush1: true,
  prefPush2: true,
};

// Database class helper to get/set with localStorage backing
class LocalStorageDB {
  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(KEYS.BOOKINGS)) {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(initialBookings));
    }
    if (!localStorage.getItem(KEYS.SLOTS)) {
      localStorage.setItem(KEYS.SLOTS, JSON.stringify(initialSlots));
    }
    if (!localStorage.getItem(KEYS.PUJARIS)) {
      localStorage.setItem(KEYS.PUJARIS, JSON.stringify(initialPujaris));
    }
    if (!localStorage.getItem(KEYS.QUERIES)) {
      localStorage.setItem(KEYS.QUERIES, JSON.stringify(initialQueries));
    }
    if (!localStorage.getItem(KEYS.FEEDBACK)) {
      localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(initialReviews));
    }
    if (!localStorage.getItem(KEYS.RECORDINGS)) {
      localStorage.setItem(KEYS.RECORDINGS, JSON.stringify(initialRecordings));
    }
    if (!localStorage.getItem(KEYS.READINESS)) {
      localStorage.setItem(KEYS.READINESS, JSON.stringify({}));
    }
    if (!localStorage.getItem(KEYS.STREAM_READINESS)) {
      localStorage.setItem(KEYS.STREAM_READINESS, JSON.stringify({}));
    }
    if (!localStorage.getItem(KEYS.PROFILE)) {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(initialProfile));
    }
  }

  // Bookings
  getBookings(): Booking[] {
    const data = localStorage.getItem(KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  }

  getBookingById(id: string): Booking | undefined {
    return this.getBookings().find(b => b.id === id);
  }

  saveBookings(bookings: Booking[]) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
  }

  updateBooking(booking: Booking) {
    const list = this.getBookings();
    const index = list.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      list[index] = booking;
      this.saveBookings(list);
    }
  }

  // Slots
  getSlots(): PoojaSlot[] {
    const data = localStorage.getItem(KEYS.SLOTS);
    return data ? JSON.parse(data) : [];
  }

  saveSlots(slots: PoojaSlot[]) {
    localStorage.setItem(KEYS.SLOTS, JSON.stringify(slots));
  }

  updateSlot(slot: PoojaSlot) {
    const list = this.getSlots();
    const index = list.findIndex(s => s.id === slot.id);
    if (index !== -1) {
      list[index] = slot;
    } else {
      list.push(slot);
    }
    this.saveSlots(list);
  }

  // Pujaris
  getPujaris(): Pujari[] {
    const data = localStorage.getItem(KEYS.PUJARIS);
    return data ? JSON.parse(data) : [];
  }

  savePujaris(pujaris: Pujari[]) {
    localStorage.setItem(KEYS.PUJARIS, JSON.stringify(pujaris));
  }

  updatePujari(pujari: Pujari) {
    const list = this.getPujaris();
    const index = list.findIndex(p => p.id === pujari.id);
    if (index !== -1) {
      list[index] = pujari;
    } else {
      list.push(pujari);
    }
    this.savePujaris(list);
  }

  // Queries
  getQueries(): DevoteeQuery[] {
    const data = localStorage.getItem(KEYS.QUERIES);
    return data ? JSON.parse(data) : [];
  }

  saveQueries(queries: DevoteeQuery[]) {
    localStorage.setItem(KEYS.QUERIES, JSON.stringify(queries));
  }

  updateQuery(query: DevoteeQuery) {
    const list = this.getQueries();
    const index = list.findIndex(q => q.id === query.id);
    if (index !== -1) {
      list[index] = query;
      this.saveQueries(list);
    }
  }

  // Reviews/Feedback
  getFeedback(): Review[] {
    const data = localStorage.getItem(KEYS.FEEDBACK);
    return data ? JSON.parse(data) : [];
  }

  saveFeedback(feedback: Review[]) {
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(feedback));
  }

  // Recordings
  getRecordings(): Recording[] {
    const data = localStorage.getItem(KEYS.RECORDINGS);
    return data ? JSON.parse(data) : [];
  }

  saveRecordings(recordings: Recording[]) {
    localStorage.setItem(KEYS.RECORDINGS, JSON.stringify(recordings));
  }

  updateRecording(recording: Recording) {
    const list = this.getRecordings();
    const index = list.findIndex(r => r.id === recording.id);
    if (index !== -1) {
      list[index] = recording;
      this.saveRecordings(list);
    }
  }

  // Readiness Checklist per booking ID
  getReadinessChecklist(bookingId: string): ChecklistItem[] {
    const data = localStorage.getItem(KEYS.READINESS);
    if (!data) return DEFAULT_CHECKLIST;
    const checklists = JSON.parse(data) as Record<string, ChecklistItem[]>;
    return checklists[bookingId] || DEFAULT_CHECKLIST;
  }

  saveReadinessChecklist(bookingId: string, items: ChecklistItem[]) {
    const data = localStorage.getItem(KEYS.READINESS);
    const checklists = data ? JSON.parse(data) : {};
    checklists[bookingId] = items;
    localStorage.setItem(KEYS.READINESS, JSON.stringify(checklists));
  }

  // Stream Readiness state per booking ID
  getStreamReadiness(bookingId: string): StreamReadinessData {
    const data = localStorage.getItem(KEYS.STREAM_READINESS);
    const defaultData: StreamReadinessData = {
      currentStage: 3,
      stage3: { videoClear: false, audioClear: false, streamKeyWorking: false, playbackTested: false },
      stage4: { finalSignalCheck: false, latencyChecked: false, pujariMicSecured: false }
    };
    if (!data) return defaultData;
    const store = JSON.parse(data) as Record<string, StreamReadinessData>;
    return store[bookingId] || defaultData;
  }

  saveStreamReadiness(bookingId: string, streamData: StreamReadinessData) {
    const data = localStorage.getItem(KEYS.STREAM_READINESS);
    const store = data ? JSON.parse(data) : {};
    store[bookingId] = streamData;
    localStorage.setItem(KEYS.STREAM_READINESS, JSON.stringify(store));
  }

  // Profile Settings
  getProfile(): ProfileSettingsData {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : initialProfile;
  }

  saveProfile(profile: ProfileSettingsData) {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }
}

export const db = new LocalStorageDB();
export { getRelativeDateStr, getRelativeDateTimeStr };
