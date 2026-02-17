import { getStore } from '@/infrastructure/repositories/SingletonStore';
import { Schedule } from '@/domain/entities/Member';

export class ScheduleService {

  createSchedule(
    classId: string,
    className: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    room: string
  ): Schedule {
    const store = getStore();
    const id = `sched-${Date.now()}`;
    const schedule = new Schedule(id, classId, className, dayOfWeek, startTime, endTime, room);
    
    schedule.createMemento('CREATE', 'Horario creado');
    store.scheduleRepository.save(schedule);
    
    return schedule;
  }

  getAll(): Schedule[] {
    return getStore().scheduleRepository.findAll();
  }

  getByDay(day: number): Schedule[] {
    return getStore().scheduleRepository.findByDay(day);
  }

  getById(id: string): Schedule | null {
    return getStore().scheduleRepository.findById(id);
  }

  activate(id: string): Schedule {
    const store = getStore();
    const schedule = store.scheduleRepository.findById(id);
    if (!schedule) throw new Error('Horario no encontrado');
    
    schedule.activate();
    store.scheduleRepository.save(schedule);
    return schedule;
  }

  deactivate(id: string, reason?: string): Schedule {
    const store = getStore();
    const schedule = store.scheduleRepository.findById(id);
    if (!schedule) throw new Error('Horario no encontrado');
    
    schedule.deactivate(reason);
    store.scheduleRepository.save(schedule);
    return schedule;
  }

  update(id: string, data: Partial<Pick<Schedule, 'dayOfWeek' | 'startTime' | 'endTime' | 'room'>>): Schedule {
    const store = getStore();
    const schedule = store.scheduleRepository.findById(id);
    if (!schedule) throw new Error('Horario no encontrado');
    
    schedule.update(data);
    store.scheduleRepository.save(schedule);
    return schedule;
  }

  undo(id: string): { schedule: Schedule; message: string } {
    const store = getStore();
    const schedule = store.scheduleRepository.findById(id);
    if (!schedule) throw new Error('Horario no encontrado');

    const mementos = schedule.getMementos();
    if (mementos.length < 2) {
      throw new Error('No hay cambios para deshacer');
    }

    const previousMemento = mementos[mementos.length - 2];
    schedule.restoreFromMemento(previousMemento);
    store.scheduleRepository.save(schedule);

    return {
      schedule,
      message: 'Horario restaurado'
    };
  }

  getHistory(id: string) {
    const store = getStore();
    const schedule = store.scheduleRepository.findById(id);
    if (!schedule) throw new Error('Horario no encontrado');
    
    return schedule.getMementos().map(m => ({
      action: m.action,
      reason: m.reason,
      timestamp: m.getTimestamp(),
      state: m.getState()
    }));
  }
}

export const scheduleService = new ScheduleService();
