import { BookingStatus } from '../enums/status.enums';

export const BookingTransitions: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.CREATED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.SCHEDULED, BookingStatus.CANCELLED],
  [BookingStatus.SCHEDULED]: [BookingStatus.LIVE, BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.LIVE]: [BookingStatus.COMPLETED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: []
};

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return BookingTransitions[from]?.includes(to) ?? false;
}
