import { UserRole } from './roles.enums';

export enum Action {
  MANAGE_TEMPLES = 'MANAGE_TEMPLES',
  MANAGE_POOJAS = 'MANAGE_POOJAS',
  CREATE_SLOT = 'CREATE_SLOT',
  APPROVE_RESCHEDULE = 'APPROVE_RESCHEDULE',
  REQUEST_RESCHEDULE = 'REQUEST_RESCHEDULE',
  REQUEST_REFUND = 'REQUEST_REFUND',
  APPROVE_REFUND = 'APPROVE_REFUND',
  START_LIVE_STREAM = 'START_LIVE_STREAM',
  MODERATE_RECORDING = 'MODERATE_RECORDING',
  SUBMIT_FEEDBACK = 'SUBMIT_FEEDBACK',
  MANAGE_DELIVERY = 'MANAGE_DELIVERY'
}

export const RolePermissions: Record<UserRole, Action[]> = {
  [UserRole.SUPER_ADMIN]: [
    Action.MANAGE_TEMPLES,
    Action.MANAGE_POOJAS,
    Action.APPROVE_REFUND,
    Action.MODERATE_RECORDING
  ],
  [UserRole.TEMPLE_ADMIN]: [
    Action.MANAGE_POOJAS,
    Action.APPROVE_REFUND
  ],
  [UserRole.PRO]: [
    Action.CREATE_SLOT,
    Action.APPROVE_RESCHEDULE,
    Action.START_LIVE_STREAM,
    Action.MANAGE_DELIVERY
  ],
  [UserRole.USER]: [
    Action.REQUEST_RESCHEDULE,
    Action.REQUEST_REFUND,
    Action.SUBMIT_FEEDBACK
  ]
};

export function hasPermission(role: UserRole, action: Action): boolean {
  return RolePermissions[role]?.includes(action) ?? false;
}
