import { memberService, subscriptionService, scheduleService } from '@/application/services';
import { getStore } from '@/infrastructure/repositories/SingletonStore';

export function initializeData() {
  const store = getStore();
  
  if (store.initialized) return;
  if (store.memberRepository.findAll().length > 0) return;
  
  const m1 = memberService.createMember('Juan Perez', 'juan@email.com', '555-1234');
  const m2 = memberService.createMember('Maria Garcia', 'maria@email.com', '555-5678');
  const m3 = memberService.createMember('Carlos Lopez', 'carlos@email.com');
  
  const s1 = subscriptionService.createSubscription(m1.id, 'plan-1', 'Mensual', 500, 30);
  const s2 = subscriptionService.createSubscription(m2.id, 'plan-2', 'Trimestral', 1200, 90);
  const s3 = subscriptionService.createSubscription(m3.id, 'plan-1', 'Mensual', 500, 30);
  
  subscriptionService.activate(s1.id);
  subscriptionService.activate(s2.id);
  
  scheduleService.createSchedule('class-yoga', 'Yoga', 1, '07:00', '08:00', 'Sala A');
  scheduleService.createSchedule('class-spinning', 'Spinning', 1, '18:00', '19:00', 'Sala B');
  scheduleService.createSchedule('class-crossfit', 'CrossFit', 3, '19:00', '20:00', 'Box');
  scheduleService.createSchedule('class-pilates', 'Pilates', 5, '08:00', '09:00', 'Sala A');
  
  store.initialized = true;
}

export { memberService, subscriptionService, scheduleService };
