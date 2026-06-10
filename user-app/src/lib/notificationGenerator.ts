import { firestore } from './firebase';

export async function processSystemEvent(eventId: string) {
  const db = firestore();
  
  try {
    const eventRef = db.collection('systemEvents').doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      console.error('System event not found:', eventId);
      return;
    }
    
    const eventData = eventDoc.data();
    if (!eventData || eventData.status === 'PROCESSED') {
      return; // Already processed
    }

    // Handle different event types
    switch (eventData.eventType) {
      case 'booking.created':
        await generateBookingCreatedNotifications(db, eventData);
        break;
      case 'booking.cancelled':
        await generateBookingCancelledNotifications(db, eventData);
        break;
      case 'reschedule.requested':
        await generateRescheduleRequestedNotifications(db, eventData);
        break;
      case 'reschedule.approved':
        await generateRescheduleApprovedNotifications(db, eventData);
        break;
      case 'reschedule.rejected':
        await generateRescheduleRejectedNotifications(db, eventData);
        break;
      case 'refund.requested':
        await generateRefundRequestedNotifications(db, eventData);
        break;
      case 'refund.approved':
        await generateRefundApprovedNotifications(db, eventData);
        break;
      case 'delivery.packed':
        await generateDeliveryPackedNotifications(db, eventData);
        break;
      case 'delivery.shipped':
        await generateDeliveryShippedNotifications(db, eventData);
        break;
      case 'delivery.out_for_delivery':
        await generateDeliveryOutNotifications(db, eventData);
        break;
      case 'delivery.delivered':
        await generateDeliveryDeliveredNotifications(db, eventData);
        break;
      case 'feedback.created':
        await generateFeedbackCreatedNotifications(db, eventData);
        break;
      case 'feedback.approved':
        await generateFeedbackApprovedNotifications(db, eventData);
        break;
      case 'feedback.rejected':
        await generateFeedbackRejectedNotifications(db, eventData);
        break;
      case 'stream.started':
        await generateStreamStartedNotifications(db, eventData);
        break;
      case 'stream.ended':
        await generateStreamEndedNotifications(db, eventData);
        break;
      case 'recording.uploaded':
        await generateRecordingUploadedNotifications(db, eventData);
        break;
      case 'recording.published':
        await generateRecordingPublishedNotifications(db, eventData);
        break;
      case 'recording.approved':
        await generateRecordingApprovedNotifications(db, eventData);
        break;
      case 'recording.rejected':
        await generateRecordingRejectedNotifications(db, eventData);
        break;
      case 'recording.archived':
        await generateRecordingArchivedNotifications(db, eventData);
        break;
      default:
        console.log('No notification generator for event:', eventData.eventType);
    }
    
    // Mark as processed
    await eventRef.update({
      status: 'PROCESSED',
      processedAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Error processing system event:', error);
  }
}

async function generateBookingCreatedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, poojaName, templeName } = payload;
  
  // 1. USER Notification
  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId,
    recipientType: 'USER',
    type: 'SYSTEM',
    title: 'Booking Confirmed',
    message: `Your booking for ${poojaName || 'Pooja'} at ${templeName || 'Temple'} has been confirmed. (ID: ${bookingId})`,
    isRead: false,
    actionUrl: `/booking/${bookingId}`,
    isDeleted: false,
    createdAt: firestore.FieldValue.serverTimestamp()
  });

  // 2. TEMPLE_ADMIN / PRO Notification
  const proNotifRef = db.collection('notifications').doc();
  batch.set(proNotifRef, {
    recipientId: templeId,
    recipientType: 'TEMPLE_ADMIN',
    type: 'SYSTEM',
    title: 'New Booking Received',
    message: `A new booking has been received for ${poojaName || 'Pooja'}. (ID: ${bookingId})`,
    isRead: false,
    actionUrl: `/bookings/${bookingId}`,
    isDeleted: false,
    createdAt: firestore.FieldValue.serverTimestamp()
  });

  // 3. ADMIN Notification
  const adminNotifRef = db.collection('notifications').doc();
  batch.set(adminNotifRef, {
    recipientId: 'admin_global', // Global identifier for admins
    recipientType: 'ADMIN',
    type: 'SYSTEM',
    title: 'New Booking Created',
    message: `A new booking (${bookingId}) was created at ${templeName || 'Temple'}.`,
    isRead: false,
    actionUrl: `/bookings/${bookingId}`,
    isDeleted: false,
    createdAt: firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();
}

async function generateBookingCancelledNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, reason } = payload;
  
  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Booking Cancelled',
    message: `Your booking (ID: ${bookingId}) has been cancelled.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp()
  });

  const proNotifRef = db.collection('notifications').doc();
  batch.set(proNotifRef, {
    recipientId: templeId, recipientType: 'TEMPLE_ADMIN', type: 'SYSTEM',
    title: 'Booking Cancelled',
    message: `Booking (ID: ${bookingId}) has been cancelled. Reason: ${reason}`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp()
  });

  const adminNotifRef = db.collection('notifications').doc();
  batch.set(adminNotifRef, {
    recipientId: 'admin_global', recipientType: 'ADMIN', type: 'SYSTEM',
    title: 'Booking Cancelled',
    message: `Booking (${bookingId}) at temple ${templeId} was cancelled.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();
}

async function generateRescheduleRequestedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, newDate, newTime } = payload;
  
  const proNotifRef = db.collection('notifications').doc();
  batch.set(proNotifRef, {
    recipientId: templeId, recipientType: 'TEMPLE_ADMIN', type: 'SYSTEM',
    title: 'Reschedule Requested',
    message: `User requested to reschedule booking ${bookingId} to ${newDate} at ${newTime}.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/bookings/${bookingId}`
  });

  await batch.commit();
}

async function generateRescheduleApprovedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, newDate, newTime } = payload;

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Reschedule Approved',
    message: `Your reschedule request for booking ${bookingId} to ${newDate} at ${newTime} has been approved.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();
}

async function generateRescheduleRejectedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId } = payload;

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Reschedule Rejected',
    message: `Your reschedule request for booking ${bookingId} was declined by the temple.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();
}

async function generateRefundRequestedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { refundId, bookingId, userId, amount } = payload;

  const adminNotifRef = db.collection('notifications').doc();
  batch.set(adminNotifRef, {
    recipientId: 'admin_global', recipientType: 'ADMIN', type: 'SYSTEM',
    title: 'Refund Requested',
    message: `A refund of ₹${amount} was requested for booking ${bookingId}.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/refunds`
  });

  await batch.commit();
}

async function generateRefundApprovedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { refundId, bookingId, userId, amount } = payload;

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Refund Approved',
    message: `Your refund of ₹${amount} for booking ${bookingId} has been approved.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();
}

async function generateDeliveryPackedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId } = payload;

  const bookingDoc = await db.collection('bookings').doc(bookingId).get();
  if (!bookingDoc.exists) return;
  const userId = bookingDoc.data().userId;

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Prasad Packed',
    message: `Your Prasad for booking ${bookingId} has been packed and is ready for dispatch.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/journey/${bookingId}`
  });

  await batch.commit();
}

async function generateDeliveryShippedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, trackingNumber, courier } = payload;

  const bookingDoc = await db.collection('bookings').doc(bookingId).get();
  if (!bookingDoc.exists) return;
  const userId = bookingDoc.data().userId;

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Prasad Shipped',
    message: `Your Prasad for booking ${bookingId} has been shipped via ${courier}. Tracking: ${trackingNumber}`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/journey/${bookingId}`
  });

  await batch.commit();
}

async function generateDeliveryOutNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId } = payload;

  const bookingDoc = await db.collection('bookings').doc(bookingId).get();
  if (!bookingDoc.exists) return;
  const userId = bookingDoc.data().userId;

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Prasad Out For Delivery',
    message: `Your Prasad for booking ${bookingId} is out for delivery today.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/journey/${bookingId}`
  });

  await batch.commit();
}

async function generateDeliveryDeliveredNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId } = payload;

  const bookingDoc = await db.collection('bookings').doc(bookingId).get();
  if (!bookingDoc.exists) return;
  const userId = bookingDoc.data().userId;

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Prasad Delivered',
    message: `Your Prasad for booking ${bookingId} has been delivered successfully.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/journey/${bookingId}`
  });

  await batch.commit();
}

async function generateFeedbackCreatedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, feedbackId } = payload;

  // USER Notif
  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Feedback Received',
    message: 'Thank you for submitting your feedback. It is pending moderation.',
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/journey/${bookingId}`
  });

  // TEMPLE_ADMIN Notif
  const proNotifRef = db.collection('notifications').doc();
  batch.set(proNotifRef, {
    recipientId: templeId, recipientType: 'TEMPLE_ADMIN', type: 'SYSTEM',
    title: 'New Feedback',
    message: `A devotee has submitted feedback for booking ${bookingId}.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/feedback`
  });

  // ADMIN Notif
  const adminNotifRef = db.collection('notifications').doc();
  batch.set(adminNotifRef, {
    recipientId: 'ADMIN', recipientType: 'ADMIN', type: 'SYSTEM',
    title: 'New Feedback Submitted',
    message: `Feedback ${feedbackId} requires moderation.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/feedback`
  });

  await batch.commit();
}

async function generateFeedbackApprovedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId } = payload;

  // USER Notif
  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Feedback Approved',
    message: 'Your feedback has been approved and is now public.',
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/journey/${bookingId}`
  });

  // TEMPLE_ADMIN Notif
  const proNotifRef = db.collection('notifications').doc();
  batch.set(proNotifRef, {
    recipientId: templeId, recipientType: 'TEMPLE_ADMIN', type: 'SYSTEM',
    title: 'Feedback Published',
    message: `New feedback has been approved for your temple.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/feedback`
  });

  await batch.commit();
}

async function generateFeedbackRejectedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { userId } = payload;

  // USER Notif
  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Feedback Hidden',
    message: 'Your recent feedback was hidden as it did not meet our community guidelines.',
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
}

async function generateStreamStartedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, streamId } = payload;

  // USER Notif
  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Live Stream Started',
    message: 'Your pooja is now broadcasting live.',
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/live/${bookingId}`
  });

  // TEMPLE_ADMIN Notif
  const proNotifRef = db.collection('notifications').doc();
  batch.set(proNotifRef, {
    recipientId: templeId, recipientType: 'TEMPLE_ADMIN', type: 'SYSTEM',
    title: 'Stream Started',
    message: `Stream ${streamId} for booking ${bookingId} is now live.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/livestream`
  });

  // ADMIN Notif
  const adminNotifRef = db.collection('notifications').doc();
  batch.set(adminNotifRef, {
    recipientId: 'ADMIN', recipientType: 'ADMIN', type: 'SYSTEM',
    title: 'Stream Started',
    message: `Stream ${streamId} started at temple.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/livestreams`
  });

  await batch.commit();
}

async function generateStreamEndedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, streamId } = payload;

  // USER Notif
  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Live Stream Ended',
    message: 'Your pooja broadcast has concluded.',
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/journey/${bookingId}`
  });

  // TEMPLE_ADMIN Notif
  const proNotifRef = db.collection('notifications').doc();
  batch.set(proNotifRef, {
    recipientId: templeId, recipientType: 'TEMPLE_ADMIN', type: 'SYSTEM',
    title: 'Stream Ended',
    message: `Stream ${streamId} has concluded.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/livestream`
  });

  // ADMIN Notif
  const adminNotifRef = db.collection('notifications').doc();
  batch.set(adminNotifRef, {
    recipientId: 'ADMIN', recipientType: 'ADMIN', type: 'SYSTEM',
    title: 'Stream Ended',
    message: `Stream ${streamId} ended.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/livestreams`
  });

  await batch.commit();
}

async function generateRecordingUploadedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, recordingId } = payload;

  const adminNotifRef = db.collection('notifications').doc();
  batch.set(adminNotifRef, {
    recipientId: 'ADMIN', recipientType: 'ADMIN', type: 'SYSTEM',
    title: 'Recording Uploaded',
    message: `A new recording ${recordingId} has been uploaded and is ready for review.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/recordings`
  });

  await batch.commit();
}

async function generateRecordingPublishedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, recordingId } = payload;

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Pooja Recording Available',
    message: 'The recording of your pooja is now available to watch.',
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/live/${bookingId}`
  });

  await batch.commit();
}

async function generateRecordingApprovedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, recordingId } = payload;

  const proNotifRef = db.collection('notifications').doc();
  batch.set(proNotifRef, {
    recipientId: templeId, recipientType: 'TEMPLE_ADMIN', type: 'SYSTEM',
    title: 'Recording Approved',
    message: `Your recording for booking ${bookingId} has been approved and published.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/recordings`
  });

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Pooja Recording Available',
    message: 'The recording of your pooja is now available to watch.',
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/live/${bookingId}`
  });

  await batch.commit();
}

async function generateRecordingRejectedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, recordingId } = payload;

  const proNotifRef = db.collection('notifications').doc();
  batch.set(proNotifRef, {
    recipientId: templeId, recipientType: 'TEMPLE_ADMIN', type: 'SYSTEM',
    title: 'Recording Rejected',
    message: `Your recording for booking ${bookingId} has been rejected. Please re-upload.`,
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/recordings`
  });

  await batch.commit();
}

async function generateRecordingArchivedNotifications(db: any, eventData: any) {
  const batch = db.batch();
  const { payload } = eventData;
  const { bookingId, userId, templeId, recordingId } = payload;

  const userNotifRef = db.collection('notifications').doc();
  batch.set(userNotifRef, {
    recipientId: userId, recipientType: 'USER', type: 'SYSTEM',
    title: 'Recording Archived',
    message: 'Your pooja recording has been archived and is no longer available.',
    isRead: false, isDeleted: false, createdAt: firestore.FieldValue.serverTimestamp(),
    actionUrl: `/journey/${bookingId}`
  });

  await batch.commit();
}
