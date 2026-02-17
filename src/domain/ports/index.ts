import type { Member, Subscription, Schedule, SubscriptionMemento, ScheduleMemento } from '../entities/Member';

export interface IMemberRepository {
  findById(id: string): Member | null;
  findAll(): Member[];
  save(member: Member): void;
  delete(id: string): boolean;
}

export interface ISubscriptionRepository {
  findById(id: string): Subscription | null;
  findAll(): Subscription[];
  findByMemberId(memberId: string): Subscription[];
  save(subscription: Subscription): void;
  delete(id: string): boolean;
}

export interface IScheduleRepository {
  findById(id: string): Schedule | null;
  findAll(): Schedule[];
  findByDay(dayOfWeek: number): Schedule[];
  save(schedule: Schedule): void;
  delete(id: string): boolean;
}

export interface IMementoCaretaker<T, M> {
  save(memento: M): void;
  getHistory(): M[];
  getLatest(): M | null;
  getAt(index: number): M | null;
  undo(): M | null;
}

export type { Member, Subscription, Schedule, SubscriptionMemento, ScheduleMemento };
