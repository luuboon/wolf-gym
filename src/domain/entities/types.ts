export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface SubscriptionState {
  id: string;
  status: SubscriptionStatus;
  endDate: Date;
  timestamp: Date;
}

export interface ScheduleState {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  isActive: boolean;
  timestamp: Date;
}
