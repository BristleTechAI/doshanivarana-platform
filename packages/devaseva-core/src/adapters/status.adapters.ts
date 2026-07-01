import { BookingStatus, DeliveryStatus, StreamStatus } from '../enums/status.enums';

// --- BOOKING STATUS ADAPTERS ---
export function mapBookingStatusFromDB(dbStatus: string | BookingStatus): BookingStatus {
  if (Object.values(BookingStatus).includes(dbStatus as BookingStatus)) {
    return dbStatus as BookingStatus;
  }
  
  switch (dbStatus?.toString().toLowerCase()) {
    case 'pending': return BookingStatus.CREATED;
    case 'created': return BookingStatus.CREATED;
    case 'confirmed': return BookingStatus.CONFIRMED;
    case 'scheduled': return BookingStatus.SCHEDULED;
    case 'in progress': return BookingStatus.LIVE;
    case 'live': return BookingStatus.LIVE;
    case 'completed': return BookingStatus.COMPLETED;
    case 'cancelled': return BookingStatus.CANCELLED;
    default: return BookingStatus.CREATED; // Fallback
  }
}

export function mapBookingStatusToDB(status: BookingStatus): string {
  // DB expects TitleCase for backwards compatibility
  switch (status) {
    case BookingStatus.CREATED: return 'Created';
    case BookingStatus.CONFIRMED: return 'Confirmed';
    case BookingStatus.SCHEDULED: return 'Scheduled';
    case BookingStatus.LIVE: return 'Live';
    case BookingStatus.COMPLETED: return 'Completed';
    case BookingStatus.CANCELLED: return 'Cancelled';
    default: return 'Created';
  }
}

// --- DELIVERY STATUS ADAPTERS ---
export function mapDeliveryStatusFromDB(dbStatus: string | DeliveryStatus): DeliveryStatus {
  if (Object.values(DeliveryStatus).includes(dbStatus as DeliveryStatus)) {
    return dbStatus as DeliveryStatus;
  }
  
  switch (dbStatus?.toString().toLowerCase()) {
    case 'processing': return DeliveryStatus.PACKED;
    case 'packed': return DeliveryStatus.PACKED;
    case 'shipped':
    case 'dispatched': // Legacy PRO handling
    case 'in transit':
      return DeliveryStatus.SHIPPED;
    case 'out for delivery': return DeliveryStatus.OUT_FOR_DELIVERY;
    case 'delivered': return DeliveryStatus.DELIVERED;
    case 'failed': return DeliveryStatus.RETURNED;
    case 'returned': return DeliveryStatus.RETURNED;
    default: return DeliveryStatus.PACKED;
  }
}

export function mapDeliveryStatusToDB(status: DeliveryStatus): string {
  // DB expects TitleCase
  switch (status) {
    case DeliveryStatus.PACKED: return 'Packed';
    case DeliveryStatus.SHIPPED: return 'Shipped';
    case DeliveryStatus.OUT_FOR_DELIVERY: return 'Out For Delivery';
    case DeliveryStatus.DELIVERED: return 'Delivered';
    case DeliveryStatus.RETURNED: return 'Returned';
    default: return 'Packed';
  }
}

// --- STREAM STATUS ADAPTERS ---
export function mapStreamStatusFromDB(dbStatus: string | StreamStatus): StreamStatus {
  if (Object.values(StreamStatus).includes(dbStatus as StreamStatus)) {
    return dbStatus as StreamStatus;
  }
  
  switch (dbStatus?.toString().toLowerCase()) {
    case 'scheduled': return StreamStatus.SCHEDULED;
    case 'starting': return StreamStatus.STARTING;
    case 'live': return StreamStatus.LIVE;
    case 'ended': return StreamStatus.ENDED;
    case 'in progress': return StreamStatus.LIVE; // legacy pro mapping
    case 'recording_available': return StreamStatus.RECORDING_AVAILABLE;
    case 'archived': return StreamStatus.RECORDING_AVAILABLE;
    default: return StreamStatus.SCHEDULED;
  }
}

export function mapStreamStatusToDB(status: StreamStatus): string {
  // DB expects TitleCase (except PRO uses 'LIVE'/'ENDED', but Admin uses 'Live'/'Ended')
  // We'll write TitleCase as Admin historically did, which PRO can read.
  switch (status) {
    case StreamStatus.SCHEDULED: return 'Scheduled';
    case StreamStatus.STARTING: return 'Starting';
    case StreamStatus.LIVE: return 'Live';
    case StreamStatus.ENDED: return 'Ended';
    case StreamStatus.RECORDING_AVAILABLE: return 'Recording Available';
    default: return 'Scheduled';
  }
}
