export enum EventType {
  BOOKING_CREATED = 'booking.created',
  BOOKING_CANCELLED = 'booking.cancelled',
  RESCHEDULE_REQUESTED = 'reschedule.requested',
  RESCHEDULE_APPROVED = 'reschedule.approved',
  RESCHEDULE_REJECTED = 'reschedule.rejected',
  REFUND_REQUESTED = 'refund.requested',
  REFUND_PROCESSED = 'refund.processed',
  LIVE_STREAM_STARTED = 'stream.started',
  DELIVERY_STATUS_CHANGED = 'delivery.status_changed',
  FEEDBACK_SUBMITTED = 'feedback.submitted'
}

export interface BaseEvent {
  eventId: string;
  type: EventType;
  timestamp: Date;
}

export interface BookingCreatedEvent extends BaseEvent {
  type: EventType.BOOKING_CREATED;
  payload: {
    bookingId: string;
    userId: string;
    poojaId: string;
  };
}

export interface RescheduleRequestedEvent extends BaseEvent {
  type: EventType.RESCHEDULE_REQUESTED;
  payload: {
    bookingId: string;
    userId: string;
    requestedDate: string;
    reason?: string;
  };
}

export interface RescheduleApprovedEvent extends BaseEvent {
  type: EventType.RESCHEDULE_APPROVED;
  payload: {
    bookingId: string;
    approvedByProId: string;
    newDate: string;
  };
}

export interface LiveStreamStartedEvent extends BaseEvent {
  type: EventType.LIVE_STREAM_STARTED;
  payload: {
    streamId: string;
    poojaId: string;
    templeId: string;
    streamUrl: string;
  };
}

export type DomainEvent = 
  | BookingCreatedEvent 
  | RescheduleRequestedEvent 
  | RescheduleApprovedEvent 
  | LiveStreamStartedEvent;
