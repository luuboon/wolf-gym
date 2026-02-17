import { InMemoryMemberRepository, InMemorySubscriptionRepository, InMemoryScheduleRepository } from './InMemoryRepositories';

type Store = {
  memberRepository: InMemoryMemberRepository;
  subscriptionRepository: InMemorySubscriptionRepository;
  scheduleRepository: InMemoryScheduleRepository;
  initialized: boolean;
};

const globalForStore = globalThis as unknown as { store: Store | undefined };

export const getStore = (): Store => {
  if (!globalForStore.store) {
    globalForStore.store = {
      memberRepository: new InMemoryMemberRepository(),
      subscriptionRepository: new InMemorySubscriptionRepository(),
      scheduleRepository: new InMemoryScheduleRepository(),
      initialized: false,
    };
  }
  return globalForStore.store;
};
