import type { IMemberRepository, ISubscriptionRepository, IScheduleRepository } from '@/domain/ports';
import type { Member, Subscription, Schedule } from '@/domain/entities/Member';

export class InMemoryMemberRepository implements IMemberRepository {
  private members: Map<string, Member> = new Map();

  findById(id: string): Member | null {
    return this.members.get(id) || null;
  }

  findAll(): Member[] {
    return Array.from(this.members.values());
  }

  save(member: Member): void {
    this.members.set(member.id, member);
  }

  delete(id: string): boolean {
    return this.members.delete(id);
  }
}

export class InMemorySubscriptionRepository implements ISubscriptionRepository {
  private subscriptions: Map<string, Subscription> = new Map();

  findById(id: string): Subscription | null {
    return this.subscriptions.get(id) || null;
  }

  findAll(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  findByMemberId(memberId: string): Subscription[] {
    return this.findAll().filter(s => s.memberId === memberId);
  }

  save(subscription: Subscription): void {
    this.subscriptions.set(subscription.id, subscription);
  }

  delete(id: string): boolean {
    return this.subscriptions.delete(id);
  }
}

export class InMemoryScheduleRepository implements IScheduleRepository {
  private schedules: Map<string, Schedule> = new Map();

  findById(id: string): Schedule | null {
    return this.schedules.get(id) || null;
  }

  findAll(): Schedule[] {
    return Array.from(this.schedules.values());
  }

  findByDay(dayOfWeek: number): Schedule[] {
    return this.findAll().filter(s => s.dayOfWeek === dayOfWeek);
  }

  save(schedule: Schedule): void {
    this.schedules.set(schedule.id, schedule);
  }

  delete(id: string): boolean {
    return this.schedules.delete(id);
  }
}

export const memberRepository = new InMemoryMemberRepository();
export const subscriptionRepository = new InMemorySubscriptionRepository();
export const scheduleRepository = new InMemoryScheduleRepository();
