import { firestoreProvider as firestore } from '../../lib/firebaseProvider';

export const FeedbackService = {
  async getFeedbackByBooking(bookingId: string) {
    const snapshot = await firestore().collection('feedback')
      .where('bookingId', '==', bookingId)
      .limit(1)
      .get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  },

  async submitFeedback(userId: string, bookingId: string, rating: number, comment: string, templeId?: string) {
    const fbRef = firestore().collection('feedback').doc();
    await fbRef.set({
      id: fbRef.id,
      userId,
      bookingId,
      templeId: templeId || null,
      rating,
      comment,
      status: 'PENDING',
      isDeleted: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    await firestore().collection('systemEvents').add({
      eventType: 'feedback.created',
      entityId: fbRef.id,
      entityType: 'feedback',
      payload: { feedbackId: fbRef.id, userId, bookingId, templeId: templeId || null },
      status: 'PENDING',
      createdAt: firestore.FieldValue.serverTimestamp()
    });

    return fbRef.id;
  },

  async getUserFeedback(userId: string) {
    const snapshot = await firestore().collection('feedback')
      .where('userId', '==', userId)
      .where('isDeleted', '==', false)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

