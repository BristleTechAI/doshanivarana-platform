import { firestore } from './firebase';
import { processSystemEvent } from './notificationGenerator';

export async function createBookingTransaction(
  slotId: string,
  userId: string,
  bookingData: any
): Promise<string> {
  const db = firestore();
  const slotRef = db.collection('slots').doc(slotId);
  const bookingRef = db.collection('bookings').doc(); // Auto-generate ID
  const eventRef = db.collection('systemEvents').doc(); // System Event ID

  await db.runTransaction(async (transaction) => {
    const slotDoc = await transaction.get(slotRef);

    if (!slotDoc.exists) {
      throw new Error('Slot does not exist');
    }

    const slotData = slotDoc.data();
    if (!slotData || slotData.availableSeats <= 0) {
      throw new Error('Slot is fully booked');
    }

    if (slotData.status !== 'AVAILABLE') {
      throw new Error('Slot is no longer available');
    }

    // Decrement available capacity
    const newAvailableSeats = slotData.availableSeats - 1;

    // Create the booking document
    const newBooking = {
      ...bookingData,
      id: bookingRef.id,
      userId,
      poojaId: slotData.poojaId,
      templeId: slotData.templeId,
      scheduledDate: slotData.date,
      scheduledTime: slotData.startTime,
      status: 'CONFIRMED', // Based on BookingStatus enum or your logic
      paymentStatus: 'PAID', // Skipping payment gateway integration for now
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      isDeleted: false
    };

    transaction.set(bookingRef, newBooking);

    if (bookingData.hasPrasadDelivery) {
      const deliveryRef = db.collection('deliveries').doc();
      transaction.set(deliveryRef, {
        id: deliveryRef.id,
        bookingId: bookingRef.id,
        userId,
        templeId: slotData.templeId,
        poojaId: slotData.poojaId,
        status: 'PACKED',
        shippingAddress: bookingData.shippingAddress || null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
    }

    transaction.update(slotRef, {
      availableSeats: newAvailableSeats,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      status: newAvailableSeats === 0 ? 'FULL' : 'AVAILABLE'
    });

    // Create System Event
    const systemEvent = {
      id: eventRef.id,
      eventType: 'booking.created',
      entityId: bookingRef.id,
      entityType: 'booking',
      payload: {
        bookingId: bookingRef.id,
        userId,
        templeId: slotData.templeId,
        poojaId: slotData.poojaId,
        poojaName: bookingData.poojaName,
        templeName: bookingData.templeName
      },
      status: 'PENDING',
      createdAt: firestore.FieldValue.serverTimestamp()
    };
    
    transaction.set(eventRef, systemEvent);
  });

  // Trigger Notification Generator (simulating cloud function trigger)
  // Fire and forget so we don't block the UI
  processSystemEvent(eventRef.id).catch(console.error);

  return bookingRef.id;
}

export async function cancelBooking(bookingId: string, userId: string, reason: string): Promise<void> {
  const db = firestore();
  const bookingRef = db.collection('bookings').doc(bookingId);
  const eventRef = db.collection('systemEvents').doc();

  await db.runTransaction(async (transaction) => {
    const bookingDoc = await transaction.get(bookingRef);
    if (!bookingDoc.exists) throw new Error('Booking not found');
    const bookingData = bookingDoc.data();
    if (bookingData?.userId !== userId) throw new Error('Unauthorized');
    
    transaction.update(bookingRef, {
      status: 'CANCELLED',
      cancellationReason: reason,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    const systemEvent = {
      id: eventRef.id,
      eventType: 'booking.cancelled',
      entityId: bookingId,
      entityType: 'booking',
      payload: {
        bookingId,
        userId,
        templeId: bookingData?.templeId,
        poojaId: bookingData?.poojaId,
        reason
      },
      status: 'PENDING',
      createdAt: firestore.FieldValue.serverTimestamp()
    };
    transaction.set(eventRef, systemEvent);
  });

  processSystemEvent(eventRef.id).catch(console.error);
}

export async function requestReschedule(bookingId: string, userId: string, newDate: string, newTime: string, reason: string): Promise<void> {
  const db = firestore();
  const bookingRef = db.collection('bookings').doc(bookingId);
  const eventRef = db.collection('systemEvents').doc();

  await db.runTransaction(async (transaction) => {
    const bookingDoc = await transaction.get(bookingRef);
    if (!bookingDoc.exists) throw new Error('Booking not found');
    const bookingData = bookingDoc.data();
    if (bookingData?.userId !== userId) throw new Error('Unauthorized');
    
    transaction.update(bookingRef, {
      rescheduleRequest: {
        newDate,
        newTime,
        reason,
        status: 'PENDING'
      },
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    const systemEvent = {
      id: eventRef.id,
      eventType: 'reschedule.requested',
      entityId: bookingId,
      entityType: 'booking',
      payload: {
        bookingId,
        userId,
        templeId: bookingData?.templeId,
        poojaId: bookingData?.poojaId,
        newDate,
        newTime,
        reason
      },
      status: 'PENDING',
      createdAt: firestore.FieldValue.serverTimestamp()
    };
    transaction.set(eventRef, systemEvent);
  });

  processSystemEvent(eventRef.id).catch(console.error);
}

export async function requestRefund(bookingId: string, userId: string, reason: string, amount: number): Promise<void> {
  const db = firestore();
  const bookingRef = db.collection('bookings').doc(bookingId);
  const refundRef = db.collection('refunds').doc();
  const eventRef = db.collection('systemEvents').doc();

  await db.runTransaction(async (transaction) => {
    const bookingDoc = await transaction.get(bookingRef);
    if (!bookingDoc.exists) throw new Error('Booking not found');
    const bookingData = bookingDoc.data();
    if (bookingData?.userId !== userId) throw new Error('Unauthorized');

    const refundDoc = {
      id: refundRef.id,
      bookingId,
      userId,
      amount,
      reason,
      status: 'REQUESTED',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    };
    transaction.set(refundRef, refundDoc);

    const systemEvent = {
      id: eventRef.id,
      eventType: 'refund.requested',
      entityId: refundRef.id,
      entityType: 'refund',
      payload: {
        refundId: refundRef.id,
        bookingId,
        userId,
        amount,
        reason
      },
      status: 'PENDING',
      createdAt: firestore.FieldValue.serverTimestamp()
    };
    transaction.set(eventRef, systemEvent);
  });

  processSystemEvent(eventRef.id).catch(console.error);
}
