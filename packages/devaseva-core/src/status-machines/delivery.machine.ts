import { DeliveryStatus } from '../enums/status.enums';

export const DeliveryTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.PACKED]: [DeliveryStatus.SHIPPED],
  [DeliveryStatus.SHIPPED]: [DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.RETURNED],
  [DeliveryStatus.OUT_FOR_DELIVERY]: [DeliveryStatus.DELIVERED, DeliveryStatus.RETURNED],
  [DeliveryStatus.DELIVERED]: [],
  [DeliveryStatus.RETURNED]: []
};

export function canTransitionDelivery(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return DeliveryTransitions[from]?.includes(to) ?? false;
}
