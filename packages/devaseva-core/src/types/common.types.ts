export interface SoftDelete {
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string; // userId or 'SYSTEM'
}
