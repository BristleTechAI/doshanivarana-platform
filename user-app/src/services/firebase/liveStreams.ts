import { firestoreProvider as firestore } from '../../lib/firebaseProvider';

export const LiveStreamsService = {
  async getUserLiveStreams(userId: string) {
    const bookingsSnap = await firestore().collection('bookings')
      .where('userId', '==', userId)
      .get();
    const bookingIds = bookingsSnap.docs.map(doc => doc.id);
    if (bookingIds.length === 0) return [];

    const snapshot = await firestore().collection('liveStreams')
      .where('isDeleted', '==', false)
      .get();
      
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter((stream: any) => bookingIds.includes(stream.bookingId));
  },

  async getLiveStreamByBooking(bookingId: string) {
    const snapshot = await firestore().collection('liveStreams')
      .where('bookingId', '==', bookingId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      status: data.streamStatus || data.status // Adapter pattern applied
    };
  },

  // Real-time listener for a specific booking's stream
  subscribeToLiveStreamByBooking(bookingId: string, callback: (stream: any | null) => void) {
    return firestore().collection('liveStreams')
      .where('bookingId', '==', bookingId)
      .limit(1)
      .onSnapshot((snapshot: any) => {
        if (snapshot && !snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          callback({
            id: doc.id,
            ...data,
            status: data.streamStatus || data.status
          });
        } else {
          callback(null);
        }
      });
  },

  // Real-time listener for all active live streams
  subscribeToActiveStreams(callback: (streams: any[]) => void) {
    return firestore().collection('liveStreams')
      .where('isDeleted', '==', false)
      .onSnapshot((snapshot: any) => {
        if (snapshot) {
          const streams = snapshot.docs
            .map((doc: any) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                status: data.streamStatus || data.status
              };
            })
            .filter((s: any) =>
              s.streamStatus === 'Live' ||
              s.status === 'LIVE' ||
              s.status === 'Live'
            );
          callback(streams);
        }
      });
  },

  async getActiveStreams() {
    const snapshot = await firestore().collection('liveStreams')
      .where('isDeleted', '==', false)
      .get();
      
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter((s: any) => s.status === 'LIVE' || s.streamStatus === 'LIVE');
  }
};

