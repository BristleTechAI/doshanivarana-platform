import { EventType } from '../events/event.types';
import { EventStatus } from '../enums/status.enums';

export interface SystemEvent {
  id: string;
  eventType: EventType;
  entityId: string;
  entityType: string;
  payload: Record<string, any>;
  status: EventStatus;
  createdAt: Date;
  processedAt?: Date;
}
