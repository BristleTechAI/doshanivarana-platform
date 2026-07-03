import { firestoreProvider as firestore } from '../../lib/firebaseProvider';

export const DeliveriesService = {
  async getDeliveryByBooking(bookingId: string) {
    const snapshot = await firestore().collection('deliveries')
      .where('bookingId', '==', bookingId)
      .limit(1)
      .get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  },

  subscribeToDeliveryByBooking(bookingId: string, callback: (delivery: any | null) => void) {
    return firestore().collection('deliveries')
      .where('bookingId', '==', bookingId)
      .limit(1)
      .onSnapshot((snapshot: any) => {
        if (snapshot && !snapshot.empty) {
          const doc = snapshot.docs[0];
          callback({ id: doc.id, ...doc.data() });
        } else {
          callback(null);
        }
      });
  },

  async getUserDeliveries(userId: string) {
    const snapshot = await firestore().collection('deliveries')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  subscribeToUserDeliveries(userId: string, callback: (deliveries: any[]) => void) {
    return firestore().collection('deliveries')
      .where('userId', '==', userId)
      .onSnapshot((snapshot: any) => {
        if (snapshot) {
          callback(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
        }
      });
  },

  async trackDelivery(trackingId: string) {
    const snapshot = await firestore().collection('deliveries')
      .where('trackingNumber', '==', trackingId)
      .limit(1)
      .get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
};
