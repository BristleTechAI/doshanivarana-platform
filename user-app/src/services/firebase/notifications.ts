import { firestoreProvider as firestore } from '../../lib/firebaseProvider';

export const NotificationsService = {
  async getNotifications(userId: string) {
    const snapshot = await firestore().collection('notifications')
      .where('recipientId', '==', userId)
      .where('isDeleted', '==', false)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Real-time listener — fires instantly whenever a new notification arrives
  subscribeToNotifications(userId: string, callback: (notifications: any[]) => void) {
    return firestore().collection('notifications')
      .where('recipientId', '==', userId)
      .where('isDeleted', '==', false)
      .onSnapshot((snapshot: any) => {
        if (snapshot) {
          const list = snapshot.docs
            .map((doc: any) => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => {
              const aTime = a.createdAt?.toDate?.() || new Date(0);
              const bTime = b.createdAt?.toDate?.() || new Date(0);
              return bTime.getTime() - aTime.getTime();
            });
          callback(list);
        }
      });
  },

  async markAsRead(notificationId: string) {
    await firestore().collection('notifications').doc(notificationId).update({
      isRead: true,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
  },

  async markAllAsRead(userId: string) {
    const snapshot = await firestore().collection('notifications')
      .where('recipientId', '==', userId)
      .where('isRead', '==', false)
      .get();
      
    const batch = firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { 
        isRead: true,
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();
  },

  async markAsDeleted(notificationId: string) {
    await firestore().collection('notifications').doc(notificationId).update({
      isDeleted: true,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
  }
};

