
export enum RsvpStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  FAILED = 'FAILED',
}

export interface ProcessedResponse {
  status: RsvpStatus;
  attendeesCount: number | null;
}
