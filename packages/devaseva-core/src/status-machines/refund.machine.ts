import { RefundStatus } from '../enums/status.enums';

export const RefundTransitions: Record<RefundStatus, RefundStatus[]> = {
  [RefundStatus.REQUESTED]: [RefundStatus.REVIEWING, RefundStatus.APPROVED, RefundStatus.REJECTED],
  [RefundStatus.REVIEWING]: [RefundStatus.APPROVED, RefundStatus.REJECTED],
  [RefundStatus.APPROVED]: [RefundStatus.PROCESSED],
  [RefundStatus.REJECTED]: [],
  [RefundStatus.PROCESSED]: []
};

export function canTransitionRefund(from: RefundStatus, to: RefundStatus): boolean {
  return RefundTransitions[from]?.includes(to) ?? false;
}
