import { getStore } from '@/infrastructure/repositories/SingletonStore';
import { Subscription } from '@/domain/entities/Member';

export class SubscriptionService {
  
  createSubscription(
    memberId: string,
    planId: string,
    planName: string,
    price: number,
    durationDays: number
  ): Subscription {
    const store = getStore();
    const member = store.memberRepository.findById(memberId);
    if (!member) {
      throw new Error('Miembro no encontrado');
    }

    const id = `sub-${Date.now()}`;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const subscription = new Subscription(id, memberId, planId, startDate, endDate, planName, price);
    
    subscription.createMemento('CREATE', 'Suscripcion creada');
    
    store.subscriptionRepository.save(subscription);
    return subscription;
  }

  getAll(): Subscription[] {
    return getStore().subscriptionRepository.findAll();
  }

  getById(id: string): Subscription | null {
    return getStore().subscriptionRepository.findById(id);
  }

  activate(id: string): Subscription {
    const store = getStore();
    const sub = store.subscriptionRepository.findById(id);
    if (!sub) throw new Error('Suscripcion no encontrada');
    
    sub.activate();
    store.subscriptionRepository.save(sub);
    return sub;
  }

  pause(id: string, reason?: string): Subscription {
    const store = getStore();
    const sub = store.subscriptionRepository.findById(id);
    if (!sub) throw new Error('Suscripcion no encontrada');
    
    sub.pause(reason);
    store.subscriptionRepository.save(sub);
    return sub;
  }

  cancel(id: string, reason?: string): Subscription {
    const store = getStore();
    const sub = store.subscriptionRepository.findById(id);
    if (!sub) throw new Error('Suscripcion no encontrada');
    
    sub.cancel(reason);
    store.subscriptionRepository.save(sub);
    return sub;
  }

  reactivate(id: string): Subscription {
    const store = getStore();
    const sub = store.subscriptionRepository.findById(id);
    if (!sub) throw new Error('Suscripcion no encontrada');
    
    sub.reactivate();
    store.subscriptionRepository.save(sub);
    return sub;
  }

  undo(id: string): { subscription: Subscription; message: string } {
    const store = getStore();
    const sub = store.subscriptionRepository.findById(id);
    if (!sub) throw new Error('Suscripcion no encontrada');

    const mementos = sub.getMementos();
    if (mementos.length < 2) {
      throw new Error('No hay cambios para deshacer');
    }

    const previousMemento = mementos[mementos.length - 2];
    const previousState = previousMemento.getState();

    sub.restoreFromMemento(previousMemento);
    store.subscriptionRepository.save(sub);

    return {
      subscription: sub,
      message: `Estado restaurado: ${previousState.status}`
    };
  }

  getHistory(id: string) {
    const store = getStore();
    const sub = store.subscriptionRepository.findById(id);
    if (!sub) throw new Error('Suscripcion no encontrada');
    
    return sub.getMementos().map(m => ({
      action: m.action,
      reason: m.reason,
      timestamp: m.getTimestamp(),
      state: m.getState()
    }));
  }
}

export const subscriptionService = new SubscriptionService();
