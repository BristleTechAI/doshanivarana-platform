// @ts-nocheck
import { firestoreProvider as firestore } from '../../lib/firebaseProvider';
import { Slot } from '@devaseva/core/src/types/slot.types';

function toDateObj(ts: any): Date {
  if (!ts) return new Date();
  if (ts.toDate) return ts.toDate();
  if (ts.seconds !== undefined) return new Date(ts.seconds * 1000);
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

function getSlotStartDateTime(slot: any): Date {
  const startTs = slot.startTime;
  if (startTs && typeof startTs !== 'string') {
    return toDateObj(startTs);
  }
  
  const dateStr = slot.date;
  const timeStr = typeof startTs === 'string' ? startTs : '';
  
  let hours = 0;
  let minutes = 0;
  if (timeStr) {
    const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }
  
  if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day, hours, minutes, 0, 0);
    }
  }
  
  return new Date();
}

function isSlotPast(slot: any): boolean {
  if (!slot) return true;
  const startDateTime = getSlotStartDateTime(slot);
  return startDateTime.getTime() < Date.now();
}

function normalizeSlot(rawSlot: any): any {
  if (!rawSlot) return null;
  
  // 1. Get Date object from startTime
  const startTs = rawSlot.startTime;
  let dateObj = new Date();
  let startTimeStr = '';
  
  if (startTs) {
    if (typeof startTs === 'string') {
      startTimeStr = startTs;
      if (rawSlot.date) {
        dateObj = new Date(rawSlot.date);
      }
    } else {
      dateObj = toDateObj(startTs);
      
      // Format start time string (e.g. "07:00 AM")
      let hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      startTimeStr = `${hours}:${minutesStr} ${ampm}`;
    }
  }
  
  // 2. Format date string (YYYY-MM-DD)
  let dateStr = rawSlot.date;
  if (!dateStr && dateObj) {
    const offset = dateObj.getTimezoneOffset();
    const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
    dateStr = localDate.toISOString().split('T')[0];
  }
  
  // 3. Calculate availableSeats
  const capacity = rawSlot.capacity || 0;
  const bookedCount = rawSlot.bookedCount || 0;
  const availableSeats = rawSlot.availableSeats !== undefined ? rawSlot.availableSeats : (capacity - bookedCount);
  
  return {
    ...rawSlot,
    date: dateStr || '',
    startTime: startTimeStr,
    availableSeats: availableSeats,
  };
}

export const SlotsService = {
  async getAvailableSlots() {
    const snapshot = await firestore().collection('slots')
      .where('isDeleted', '==', false)
      .where('status', 'in', ['AVAILABLE', 'Available'])
      .get();
    return snapshot.docs
      .map(doc => normalizeSlot({ id: doc.id, ...doc.data() }) as Slot)
      .filter(slot => slot && !isSlotPast(slot));
  },

  async getSlotsByPooja(poojaId: string) {
    const snapshot = await firestore().collection('slots')
      .where('isDeleted', '==', false)
      .where('poojaId', '==', poojaId)
      .where('status', 'in', ['AVAILABLE', 'Available'])
      .get();
    return snapshot.docs
      .map(doc => normalizeSlot({ id: doc.id, ...doc.data() }) as Slot)
      .filter(slot => slot && !isSlotPast(slot));
  },

  subscribeToSlotsByPooja(poojaId: string, callback: (slots: Slot[]) => void) {
    return firestore().collection('slots')
      .where('isDeleted', '==', false)
      .where('poojaId', '==', poojaId)
      .where('status', 'in', ['AVAILABLE', 'Available'])
      .onSnapshot((snapshot: any) => {
        if (snapshot) {
          const list = snapshot.docs
            .map((doc: any) => normalizeSlot({ id: doc.id, ...doc.data() }) as Slot)
            .filter(slot => slot && !isSlotPast(slot));
          callback(list);
        }
      });
  },

  async getSlotsByTemple(templeId: string) {
    const snapshot = await firestore().collection('slots')
      .where('isDeleted', '==', false)
      .where('templeId', '==', templeId)
      .where('status', 'in', ['AVAILABLE', 'Available'])
      .get();
    return snapshot.docs
      .map(doc => normalizeSlot({ id: doc.id, ...doc.data() }) as Slot)
      .filter(slot => slot && !isSlotPast(slot));
  }
};
