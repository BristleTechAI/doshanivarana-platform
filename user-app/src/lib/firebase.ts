import AsyncStorage from '@react-native-async-storage/async-storage';

// --- MOCK TIMESTAMP IMPLEMENTATION ---
export class MockTimestamp {
  seconds: number;
  nanoseconds: number;

  constructor(date: Date = new Date()) {
    this.seconds = Math.floor(date.getTime() / 1000);
    this.nanoseconds = (date.getTime() % 1000) * 1e6;
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
  }

  toMillis(): number {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6);
  }

  valueOf(): number {
    return this.toMillis();
  }

  static now(): MockTimestamp {
    return new MockTimestamp();
  }
}

import { poojaCatalog, getTempleKey } from '../old_app/constants/catalog';

// --- IN-MEMORY DATABASE STATE ---
const STORAGE_KEY = 'doshanivarana_mock_firestore';

const initialTemples: Record<string, any> = {
  'rameshwaram': { id: 'rameshwaram', name: 'Rameshwaram Temple', city: 'Tamil Nadu', imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080' },
  'tirumala': { id: 'tirumala', name: 'Tirumala Temple', city: 'Tirupati', imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  'madurai': { id: 'madurai', name: 'Madurai Temple', city: 'Tamil Nadu', imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  'siddhiVinayak': { id: 'siddhiVinayak', name: 'Siddhi Vinayak Temple', city: 'Mumbai', imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080' },
  'varanasi': { id: 'varanasi', name: 'Varanasi Temple', city: 'Uttar Pradesh', imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080' }
};

const initialPoojas: Record<string, any> = {};
const initialSlots: Record<string, any> = {};

poojaCatalog.forEach((p) => {
  const pId = p.id.toString();
  const tKey = getTempleKey(p.temple);
  
  initialPoojas[pId] = {
    id: pId,
    name: p.title,
    templeId: tKey,
    deity: p.deity,
    price: parseInt(p.price.replace(/[^0-9]/g, '')) || 1000,
    prasad: true,
    imageUrl: p.imageUrl,
    duration: p.duration,
    purpose: p.purpose,
    category: p.category
  };

  // Seed 2 available slots for every single pooja dynamically
  initialSlots[`slot_${pId}_1`] = {
    id: `slot_${pId}_1`,
    poojaId: pId,
    templeId: tKey,
    date: '2026-06-18',
    startTime: '09:00 AM',
    availableSeats: 10,
    status: 'AVAILABLE',
    isDeleted: false
  };

  initialSlots[`slot_${pId}_2`] = {
    id: `slot_${pId}_2`,
    poojaId: pId,
    templeId: tKey,
    date: '2026-06-19',
    startTime: '11:00 AM',
    availableSeats: 5,
    status: 'AVAILABLE',
    isDeleted: false
  };
});

const initialBookings: Record<string, any> = {
  'BK-1007': {
    id: 'BK-1007',
    poojaId: '1',
    poojaName: 'Rudrabhishekam',
    templeId: 'rameshwaram',
    templeName: 'Rameshwaram Temple',
    scheduledDate: '2026-06-05',
    scheduledTime: '10:00 AM',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    amountPaid: 1200,
    userId: 'anonymous_user',
    createdAt: new MockTimestamp(new Date('2026-06-05T10:00:00Z')),
    imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    isDeleted: false,
    recordingStatus: 'Available',
    recordingUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    streamStatus: 'Ended'
  },
  'BK-0990': {
    id: 'BK-0990',
    poojaId: '16',
    poojaName: 'Satyanarayana Vratam',
    templeId: 'tirumala',
    templeName: 'Tirumala Temple',
    scheduledDate: '2026-06-01',
    scheduledTime: '08:00 AM',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    amountPaid: 1800,
    userId: 'anonymous_user',
    createdAt: new MockTimestamp(new Date('2026-06-01T08:00:00Z')),
    imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    isDeleted: false,
    recordingStatus: 'Available',
    recordingUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    streamStatus: 'Ended'
  }
};

const initialNotifications: Record<string, any> = {
  'notif_1': {
    id: 'notif_1',
    recipientId: 'anonymous_user',
    recipientType: 'USER',
    type: 'SYSTEM',
    title: 'Welcome to Doshanivarana',
    message: 'You can now view live stream links and manage your bookings.',
    isRead: false,
    isDeleted: false,
    createdAt: new MockTimestamp()
  }
};

let dbState: Record<string, Record<string, any>> = {
  poojas: initialPoojas,
  temples: initialTemples,
  slots: initialSlots,
  bookings: initialBookings,
  notifications: initialNotifications,
  feedback: {},
  systemEvents: {},
  users: {},
  userSessions: {},
  deliveries: {},
  refunds: {},
  liveStreams: {},
  recordings: {}
};

// Listeners tracking
interface Listener {
  id: string;
  collection: string;
  docId?: string;
  queryFn?: () => any[];
  isDocListener?: boolean;
  callback: (snapshot: any) => void;
}
let dbListeners: Listener[] = [];

const notifyAllListeners = () => {
  for (const listener of dbListeners) {
    if (listener.isDocListener) {
      triggerDocListener(listener);
    } else {
      triggerQueryListener(listener);
    }
  }
};

const triggerDocListener = (listener: Listener) => {
  const colData = dbState[listener.collection] || {};
  const docData = colData[listener.docId || ''];
  listener.callback({
    id: listener.docId,
    exists: !!docData,
    data: () => docData ? { ...docData } : null
  });
};

const triggerQueryListener = (listener: Listener) => {
  const docsArray = listener.queryFn ? listener.queryFn() : [];
  listener.callback({
    empty: docsArray.length === 0,
    docs: docsArray.map(doc => ({
      id: doc.id,
      exists: true,
      data: () => ({ ...doc })
    }))
  });
};

// Async load from AsyncStorage
AsyncStorage.getItem(STORAGE_KEY).then((data) => {
  if (data) {
    try {
      const parsed = JSON.parse(data);
      for (const colKey in parsed) {
        if (!dbState[colKey]) dbState[colKey] = {};
        for (const docKey in parsed[colKey]) {
          const docVal = parsed[colKey][docKey];
          // Restore MockTimestamp instances
          for (const fieldKey in docVal) {
            const field = docVal[fieldKey];
            if (field && typeof field === 'object' && 'seconds' in field && 'nanoseconds' in field) {
              const d = new Date(field.seconds * 1000 + field.nanoseconds / 1e6);
              docVal[fieldKey] = new MockTimestamp(d);
            }
          }
          dbState[colKey][docKey] = docVal;
        }
      }
      notifyAllListeners();
    } catch (e) {
      console.error('[Mock DB] Failed to parse AsyncStorage state', e);
    }
  }
});

const saveDbState = async () => {
  try {
    const rawStateForSaving: Record<string, any> = {};
    for (const colKey in dbState) {
      rawStateForSaving[colKey] = {};
      for (const docKey in dbState[colKey]) {
        const docVal = dbState[colKey][docKey];
        const rawDoc: Record<string, any> = {};
        for (const fieldKey in docVal) {
          const val = docVal[fieldKey];
          if (val instanceof MockTimestamp) {
            rawDoc[fieldKey] = {
              seconds: val.seconds,
              nanoseconds: val.nanoseconds
            };
          } else {
            rawDoc[fieldKey] = val;
          }
        }
        rawStateForSaving[colKey][docKey] = rawDoc;
      }
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rawStateForSaving));
  } catch (e) {
    console.error('[Mock DB] Failed to save state to AsyncStorage', e);
  }
};

// --- MOCK FIRESTORE API CLASSES ---
class MockQuery {
  collectionName: string;
  filters: Array<{ field: string; op: string; val: any }> = [];
  orderBys: Array<{ field: string; dir: 'asc' | 'desc' }> = [];
  limitCount?: number;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  where(field: string, op: string, val: any) {
    this.filters.push({ field, op, val });
    return this;
  }

  orderBy(field: string, dir: 'asc' | 'desc' = 'asc') {
    this.orderBys.push({ field, dir });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  execute(): any[] {
    const colData = dbState[this.collectionName] || {};
    let items = Object.keys(colData).map(id => ({
      id,
      ...colData[id]
    }));

    // Filter
    for (const filter of this.filters) {
      items = items.filter(item => {
        const itemVal = item[filter.field];
        if (filter.op === '==') return itemVal === filter.val;
        if (filter.op === '!=') return itemVal !== filter.val;
        if (filter.op === 'array-contains') return Array.isArray(itemVal) && itemVal.includes(filter.val);
        return true;
      });
    }

    // Order By
    for (const orderBy of this.orderBys) {
      items.sort((a, b) => {
        let valA = a[orderBy.field];
        let valB = b[orderBy.field];

        if (valA instanceof MockTimestamp) valA = valA.toMillis();
        if (valB instanceof MockTimestamp) valB = valB.toMillis();

        if (valA === undefined || valA === null) return orderBy.dir === 'asc' ? -1 : 1;
        if (valB === undefined || valB === null) return orderBy.dir === 'asc' ? 1 : -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return orderBy.dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return orderBy.dir === 'asc' ? valA - valB : valB - valA;
      });
    }

    // Limit
    if (this.limitCount !== undefined) {
      items = items.slice(0, this.limitCount);
    }

    return items;
  }

  async get() {
    const items = this.execute();
    return {
      empty: items.length === 0,
      docs: items.map(item => ({
        id: item.id,
        exists: true,
        data: () => ({ ...item })
      }))
    };
  }

  onSnapshot(callback: (snapshot: any) => void) {
    const listenerId = Math.random().toString(36).substring(7);
    const listener: Listener = {
      id: listenerId,
      collection: this.collectionName,
      queryFn: () => this.execute(),
      callback
    };
    dbListeners.push(listener);

    // Initial query trigger
    setTimeout(() => {
      if (dbListeners.some(l => l.id === listenerId)) {
        triggerQueryListener(listener);
      }
    }, 0);

    return () => {
      dbListeners = dbListeners.filter(l => l.id !== listenerId);
    };
  }
}

class MockDoc {
  collectionName: string;
  docId: string;

  constructor(collectionName: string, docId: string) {
    this.collectionName = collectionName;
    this.docId = docId;
  }

  get id() {
    return this.docId;
  }

  async get() {
    const colData = dbState[this.collectionName] || {};
    const docData = colData[this.docId];
    return {
      id: this.docId,
      exists: !!docData,
      data: () => docData ? { ...docData } : null
    };
  }

  async set(data: any, options?: { merge?: boolean }) {
    if (!dbState[this.collectionName]) {
      dbState[this.collectionName] = {};
    }

    const existing = dbState[this.collectionName][this.docId] || {};
    let finalData = { ...data };

    for (const key in finalData) {
      if (finalData[key] && finalData[key]._isServerTimestamp) {
        finalData[key] = new MockTimestamp();
      }
    }

    if (options?.merge) {
      dbState[this.collectionName][this.docId] = {
        ...existing,
        ...finalData
      };
    } else {
      dbState[this.collectionName][this.docId] = finalData;
    }

    await saveDbState();
    notifyAllListeners();
  }

  async update(data: any) {
    if (!dbState[this.collectionName]) {
      dbState[this.collectionName] = {};
    }

    const existing = dbState[this.collectionName][this.docId] || {};
    let finalData = { ...data };

    for (const key in finalData) {
      if (finalData[key] && finalData[key]._isServerTimestamp) {
        finalData[key] = new MockTimestamp();
      }
    }

    dbState[this.collectionName][this.docId] = {
      ...existing,
      ...finalData
    };

    await saveDbState();
    notifyAllListeners();
  }

  async delete() {
    if (dbState[this.collectionName]) {
      delete dbState[this.collectionName][this.docId];
    }
    await saveDbState();
    notifyAllListeners();
  }

  onSnapshot(callback: (doc: any) => void) {
    const listenerId = Math.random().toString(36).substring(7);
    const listener: Listener = {
      id: listenerId,
      collection: this.collectionName,
      docId: this.docId,
      isDocListener: true,
      callback
    };
    dbListeners.push(listener);

    setTimeout(() => {
      if (dbListeners.some(l => l.id === listenerId)) {
        triggerDocListener(listener);
      }
    }, 0);

    return () => {
      dbListeners = dbListeners.filter(l => l.id !== listenerId);
    };
  }
}

class MockCollection extends MockQuery {
  doc(id?: string) {
    const docId = id || Math.random().toString(36).substring(7);
    return new MockDoc(this.collectionName, docId);
  }

  async add(data: any) {
    const docId = Math.random().toString(36).substring(7);
    const docRef = new MockDoc(this.collectionName, docId);
    await docRef.set(data);
    return docRef;
  }
}

class MockBatch {
  ops: Array<{ type: 'set' | 'update' | 'delete'; docRef: MockDoc; data?: any; options?: any }> = [];

  set(docRef: MockDoc, data: any, options?: any) {
    this.ops.push({ type: 'set', docRef, data, options });
    return this;
  }

  update(docRef: MockDoc, data: any) {
    this.ops.push({ type: 'update', docRef, data });
    return this;
  }

  delete(docRef: MockDoc) {
    this.ops.push({ type: 'delete', docRef });
    return this;
  }

  async commit() {
    for (const op of this.ops) {
      if (op.type === 'set') {
        await op.docRef.set(op.data, op.options);
      } else if (op.type === 'update') {
        await op.docRef.update(op.data);
      } else if (op.type === 'delete') {
        await op.docRef.delete();
      }
    }
  }
}

class MockTransaction {
  async get(docRef: MockDoc) {
    return await docRef.get();
  }

  set(docRef: MockDoc, data: any, options?: any) {
    // Immediate save is safe in mock context
    docRef.set(data, options);
    return this;
  }

  update(docRef: MockDoc, data: any) {
    docRef.update(data);
    return this;
  }

  delete(docRef: MockDoc) {
    docRef.delete();
    return this;
  }
}

// --- MOCK AUTH STATE ---
let authUser: any = {
  uid: 'anonymous_user',
  email: 'anonymous_user@doshanivarana.com',
  phoneNumber: '+91 98765 43216',
  getIdTokenResult: async () => ({
    claims: { role: 'USER' }
  })
};

let authListeners: Array<(user: any) => void> = [];

const notifyAuthListeners = () => {
  for (const callback of authListeners) {
    callback(authUser);
  }
};

// --- API EXPORTS ---
export const app = {
  name: '[MockFirebaseApp]',
  options: {}
};

export const auth = () => {
  return {
    onAuthStateChanged: (callback: (user: any) => void) => {
      authListeners.push(callback);
      // Immediately invoke with active user
      setTimeout(() => callback(authUser), 0);
      return () => {
        authListeners = authListeners.filter(l => l !== callback);
      };
    },
    signInWithEmailAndPassword: async (email: string, otp: string) => {
      authUser = {
        uid: 'anonymous_user',
        email,
        phoneNumber: '+91 98765 43216',
        getIdTokenResult: async () => ({
          claims: { role: 'USER' }
        })
      };
      notifyAuthListeners();
      return { user: authUser };
    },
    createUserWithEmailAndPassword: async (email: string, otp: string) => {
      authUser = {
        uid: 'anonymous_user',
        email,
        phoneNumber: '+91 98765 43216',
        getIdTokenResult: async () => ({
          claims: { role: 'USER' }
        })
      };
      notifyAuthListeners();
      return { user: authUser };
    },
    signOut: async () => {
      authUser = null;
      notifyAuthListeners();
    },
    currentUser: authUser
  };
};

export const firestore = () => {
  return {
    collection: (name: string) => new MockCollection(name),
    runTransaction: async (callback: (transaction: MockTransaction) => Promise<any>) => {
      const transaction = new MockTransaction();
      return await callback(transaction);
    },
    batch: () => new MockBatch()
  };
};

// Attach static FieldValue and Timestamp
firestore.FieldValue = {
  serverTimestamp: () => ({ _isServerTimestamp: true })
};
firestore.Timestamp = MockTimestamp;

export default {
  app,
  auth,
  firestore
};
