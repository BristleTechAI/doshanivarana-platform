import { firestoreProvider as firestore } from './firebaseProvider';

// ─── Helper: sanitise a value so Firestore never sees undefined ───────────────
function safe(val: any, fallback: string = 'unknown'): string {
  if (val === undefined || val === null || val === '') return fallback;
  return String(val);
}

// ─── Helper: build a notification payload, guaranteed no undefined fields ─────
function notif(fields: {
  recipientId: string;
  recipientType: 'USER' | 'TEMPLE_ADMIN' | 'ADMIN';
  title: string;
  message: string;
  actionUrl?: string;
}) {
  const obj: Record<string, any> = {
    recipientId: safe(fields.recipientId, 'unknown'),
    recipientType: fields.recipientType,
    type: 'SYSTEM',
    title: fields.title,
    message: fields.message,
    isRead: false,
    isDeleted: false,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };
  if (fields.actionUrl) obj.actionUrl = fields.actionUrl;
  return obj;
}

// ─── processSystemEvent ────────────────────────────────────────────────────────
export async function processSystemEvent(eventId: string) {
  const db = firestore();
  const eventRef = db.collection('systemEvents').doc(eventId);

  try {
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      console.warn('[NotifGen] Event not found, skipping:', eventId);
      return;
    }

    const eventData = eventDoc.data();
    if (!eventData) return;

    // Already handled — stop immediately so we don't retry forever
    if (eventData.status === 'PROCESSED' || eventData.status === 'FAILED' || eventData.status === 'SKIPPED') {
      return;
    }

    // Optimistically mark as IN_PROGRESS to prevent concurrent processing
    // by other instances (e.g. multiple app restarts)
    await eventRef.update({ status: 'IN_PROGRESS', startedAt: firestore.FieldValue.serverTimestamp() });

    switch (eventData.eventType) {
      case 'booking.created':
        await generateBookingCreatedNotifications(db, eventData);
        break;
      case 'booking.cancelled':
        await generateBookingCancelledNotifications(db, eventData);
        break;
      case 'pujari.assigned':
        await generatePujariAssignedNotifications(db, eventData);
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
        // Unknown type — mark SKIPPED so it won't loop
        console.log('[NotifGen] No handler for event type:', eventData.eventType, '— marking SKIPPED');
        await eventRef.update({ status: 'SKIPPED', processedAt: firestore.FieldValue.serverTimestamp() });
        return;
    }

    // Mark as processed so the listener won't pick it up again
    await eventRef.update({
      status: 'PROCESSED',
      processedAt: firestore.FieldValue.serverTimestamp(),
    });

  } catch (error) {
    console.error('[NotifGen] Error processing system event:', error);
    // Mark as FAILED so the listener won't retry it infinitely
    try {
      await eventRef.update({
        status: 'FAILED',
        failedAt: firestore.FieldValue.serverTimestamp(),
        error: String(error),
      });
    } catch (updateErr) {
      console.error('[NotifGen] Could not mark event as FAILED:', updateErr);
    }
  }
}

// ─── Notification generators ──────────────────────────────────────────────────

async function generateBookingCreatedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId, templeId, poojaName, templeName } = payload;

  // Skip if no real user (e.g. GUEST bookings from old data)
  if (!userId || userId === 'GUEST' || userId === 'unknown') {
    console.log('[NotifGen] Skipping notification for GUEST/unknown userId, bookingId:', bookingId);
    return;
  }

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Booking Confirmed 🙏',
    message: `Your booking for ${safe(poojaName, 'Pooja')} at ${safe(templeName, 'the temple')} has been confirmed. (ID: ${safe(bookingId)})`,
    actionUrl: `/journey/${bookingId}`,
  }));

  if (templeId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: templeId,
      recipientType: 'TEMPLE_ADMIN',
      title: 'New Booking Received',
      message: `A new booking has been received for ${safe(poojaName, 'Pooja')}. (ID: ${safe(bookingId)})`,
      actionUrl: `/bookings/${bookingId}`,
    }));
  }

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: 'admin_global',
    recipientType: 'ADMIN',
    title: 'New Booking Created',
    message: `A new booking (${safe(bookingId)}) was created at ${safe(templeName, 'temple')}.`,
    actionUrl: `/bookings/${bookingId}`,
  }));

  await batch.commit();
}

async function generateBookingCancelledNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId, templeId, reason } = payload;

  if (!userId || userId === 'GUEST') return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Booking Cancelled',
    message: `Your booking (ID: ${safe(bookingId)}) has been cancelled.`,
  }));

  if (templeId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: templeId,
      recipientType: 'TEMPLE_ADMIN',
      title: 'Booking Cancelled',
      message: `Booking (ID: ${safe(bookingId)}) cancelled. Reason: ${safe(reason, 'N/A')}`,
    }));
  }

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: 'admin_global',
    recipientType: 'ADMIN',
    title: 'Booking Cancelled',
    message: `Booking (${safe(bookingId)}) at temple ${safe(templeId)} was cancelled.`,
  }));

  await batch.commit();
}

async function generatePujariAssignedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId, templeId, priestName, poojaName } = payload;

  if (!userId || userId === 'GUEST') return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Pujari Assigned 🙏',
    message: `${safe(priestName, 'A pujari')} has been assigned to conduct your ${safe(poojaName, 'pooja')} (Booking: ${safe(bookingId)}).`,
    actionUrl: `/journey/${bookingId}`,
  }));

  await batch.commit();
}

async function generateRescheduleRequestedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId, templeId, newDate, newTime } = payload;

  if (!templeId) return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: templeId,
    recipientType: 'TEMPLE_ADMIN',
    title: 'Reschedule Requested',
    message: `Devotee requested to reschedule booking ${safe(bookingId)} to ${safe(newDate)} at ${safe(newTime)}.`,
    actionUrl: `/bookings/${bookingId}`,
  }));

  await batch.commit();
}

async function generateRescheduleApprovedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId, newDate, newTime } = payload;

  if (!userId || userId === 'GUEST') return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Reschedule Approved ✅',
    message: `Your request to reschedule booking ${safe(bookingId)} to ${safe(newDate)} at ${safe(newTime)} has been approved.`,
    actionUrl: `/journey/${bookingId}`,
  }));

  await batch.commit();
}

async function generateRescheduleRejectedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId } = payload;

  if (!userId || userId === 'GUEST') return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Reschedule Declined',
    message: `Your reschedule request for booking ${safe(bookingId)} was declined by the temple.`,
    actionUrl: `/journey/${bookingId}`,
  }));

  await batch.commit();
}

async function generateRefundRequestedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { refundId, bookingId, amount } = payload;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: 'admin_global',
    recipientType: 'ADMIN',
    title: 'Refund Requested',
    message: `A refund of ₹${safe(amount, '0')} was requested for booking ${safe(bookingId)}.`,
    actionUrl: `/refunds`,
  }));

  await batch.commit();
}

async function generateRefundApprovedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId, amount } = payload;

  if (!userId || userId === 'GUEST') return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Refund Approved ✅',
    message: `Your refund of ₹${safe(amount, '0')} for booking ${safe(bookingId)} has been approved.`,
  }));

  await batch.commit();
}

// ─── Delivery notifications — look up userId from booking if not in payload ───

async function resolveUserId(db: any, bookingId: string, payloadUserId?: string): Promise<string | null> {
  if (payloadUserId && payloadUserId !== 'GUEST' && payloadUserId !== 'unknown') {
    return payloadUserId;
  }
  if (!bookingId) return null;
  try {
    const snap = await db.collection('bookings').doc(bookingId).get();
    if (!snap.exists) return null;
    const uid = snap.data().userId;
    if (!uid || uid === 'GUEST') return null;
    return uid;
  } catch {
    return null;
  }
}

async function generateDeliveryPackedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId: payloadUserId } = payload;

  const userId = await resolveUserId(db, bookingId, payloadUserId);
  if (!userId) return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Prasad Being Packed 📦',
    message: `Your Prasad for booking ${safe(bookingId)} has been packed and will be dispatched soon.`,
    actionUrl: `/journey/${bookingId}`,
  }));

  await batch.commit();
}

async function generateDeliveryShippedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId: payloadUserId, trackingNumber, courier } = payload;

  const userId = await resolveUserId(db, bookingId, payloadUserId);
  if (!userId) return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Prasad Shipped 🚚',
    message: `Your Prasad for booking ${safe(bookingId)} has been shipped via ${safe(courier)}. Tracking: ${safe(trackingNumber, 'pending')}`,
    actionUrl: `/journey/${bookingId}`,
  }));

  await batch.commit();
}

async function generateDeliveryOutNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId: payloadUserId } = payload;

  const userId = await resolveUserId(db, bookingId, payloadUserId);
  if (!userId) return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Prasad Out For Delivery 🛵',
    message: `Your Prasad for booking ${safe(bookingId)} is out for delivery today!`,
    actionUrl: `/journey/${bookingId}`,
  }));

  await batch.commit();
}

async function generateDeliveryDeliveredNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId: payloadUserId } = payload;

  const userId = await resolveUserId(db, bookingId, payloadUserId);
  if (!userId) return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Prasad Delivered 🙏',
    message: `Your Prasad for booking ${safe(bookingId)} has been delivered. May the blessings be with you!`,
    actionUrl: `/journey/${bookingId}`,
  }));

  await batch.commit();
}

async function generateFeedbackCreatedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId, templeId, feedbackId } = payload;

  const batch = db.batch();

  if (userId && userId !== 'GUEST') {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: userId,
      recipientType: 'USER',
      title: 'Feedback Received',
      message: 'Thank you for your feedback. It is pending moderation.',
      actionUrl: `/journey/${bookingId}`,
    }));
  }

  if (templeId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: templeId,
      recipientType: 'TEMPLE_ADMIN',
      title: 'New Feedback',
      message: `A devotee submitted feedback for booking ${safe(bookingId)}.`,
      actionUrl: `/feedback`,
    }));
  }

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: 'admin_global',
    recipientType: 'ADMIN',
    title: 'New Feedback Submitted',
    message: `Feedback ${safe(feedbackId)} requires moderation.`,
    actionUrl: `/feedback`,
  }));

  await batch.commit();
}

async function generateFeedbackApprovedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId, templeId } = payload;

  const batch = db.batch();

  if (userId && userId !== 'GUEST') {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: userId,
      recipientType: 'USER',
      title: 'Feedback Approved ✅',
      message: 'Your feedback has been approved and is now public.',
      actionUrl: `/journey/${bookingId}`,
    }));
  }

  if (templeId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: templeId,
      recipientType: 'TEMPLE_ADMIN',
      title: 'Feedback Published',
      message: `New feedback has been approved for your temple.`,
      actionUrl: `/feedback`,
    }));
  }

  await batch.commit();
}

async function generateFeedbackRejectedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { userId } = payload;

  if (!userId || userId === 'GUEST') return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Feedback Hidden',
    message: 'Your recent feedback was hidden as it did not meet our community guidelines.',
  }));

  await batch.commit();
}

async function generateStreamStartedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId: payloadUserId, templeId, streamId } = payload;

  const userId = await resolveUserId(db, bookingId, payloadUserId);

  const batch = db.batch();

  if (userId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: userId,
      recipientType: 'USER',
      title: '🔴 Your Pooja is Live!',
      message: 'Your pooja is now broadcasting live. Join now!',
      actionUrl: `/live/${bookingId}`,
    }));
  }

  if (templeId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: templeId,
      recipientType: 'TEMPLE_ADMIN',
      title: 'Stream Started',
      message: `Stream ${safe(streamId)} for booking ${safe(bookingId)} is now live.`,
      actionUrl: `/livestream`,
    }));
  }

  await batch.commit();
}

async function generateStreamEndedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId: payloadUserId, templeId, streamId } = payload;

  const userId = await resolveUserId(db, bookingId, payloadUserId);

  const batch = db.batch();

  if (userId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: userId,
      recipientType: 'USER',
      title: 'Pooja Broadcast Completed',
      message: 'Your pooja broadcast has concluded. The recording will be available soon.',
      actionUrl: `/journey/${bookingId}`,
    }));
  }

  if (templeId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: templeId,
      recipientType: 'TEMPLE_ADMIN',
      title: 'Stream Ended',
      message: `Stream ${safe(streamId)} has concluded.`,
      actionUrl: `/livestream`,
    }));
  }

  await batch.commit();
}

async function generateRecordingUploadedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { recordingId } = payload;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: 'admin_global',
    recipientType: 'ADMIN',
    title: 'Recording Uploaded',
    message: `A new recording ${safe(recordingId)} is ready for review.`,
    actionUrl: `/recordings`,
  }));

  await batch.commit();
}

async function generateRecordingPublishedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId: payloadUserId } = payload;

  const userId = await resolveUserId(db, bookingId, payloadUserId);
  if (!userId) return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: '🎬 Pooja Recording Available',
    message: 'The recording of your pooja is now available to watch.',
    actionUrl: `/live/${bookingId}`,
  }));

  await batch.commit();
}

async function generateRecordingApprovedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId: payloadUserId, templeId } = payload;

  const userId = await resolveUserId(db, bookingId, payloadUserId);
  const batch = db.batch();

  if (templeId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: templeId,
      recipientType: 'TEMPLE_ADMIN',
      title: 'Recording Approved',
      message: `The recording for booking ${safe(bookingId)} has been approved and published.`,
      actionUrl: `/recordings`,
    }));
  }

  if (userId) {
    batch.set(db.collection('notifications').doc(), notif({
      recipientId: userId,
      recipientType: 'USER',
      title: '🎬 Pooja Recording Available',
      message: 'The recording of your pooja is now available to watch.',
      actionUrl: `/live/${bookingId}`,
    }));
  }

  await batch.commit();
}

async function generateRecordingRejectedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, templeId } = payload;

  if (!templeId) return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: templeId,
    recipientType: 'TEMPLE_ADMIN',
    title: 'Recording Rejected',
    message: `The recording for booking ${safe(bookingId)} was rejected. Please re-upload.`,
    actionUrl: `/recordings`,
  }));

  await batch.commit();
}

async function generateRecordingArchivedNotifications(db: any, eventData: any) {
  const { payload = {} } = eventData;
  const { bookingId, userId: payloadUserId } = payload;

  const userId = await resolveUserId(db, bookingId, payloadUserId);
  if (!userId) return;

  const batch = db.batch();

  batch.set(db.collection('notifications').doc(), notif({
    recipientId: userId,
    recipientType: 'USER',
    title: 'Recording Archived',
    message: 'Your pooja recording has been archived and is no longer available.',
    actionUrl: `/journey/${bookingId}`,
  }));

  await batch.commit();
}
