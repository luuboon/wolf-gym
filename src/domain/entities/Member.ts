import type { SubscriptionStatus, SubscriptionState, ScheduleState } from './types';

export class Member {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public phone: string | null,
    public isActive: boolean = true
  ) {}

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }
}

export class Subscription {
  private _status: SubscriptionStatus = 'PENDING';
  private _mementos: SubscriptionMemento[] = [];

  constructor(
    public readonly id: string,
    public readonly memberId: string,
    public readonly planId: string,
    public startDate: Date,
    public endDate: Date,
    public planName: string,
    public price: number
  ) {}

  get status(): SubscriptionStatus {
    return this._status;
  }

  createMemento(action: string, reason?: string): SubscriptionMemento {
    const state: SubscriptionState = {
      id: this.id,
      status: this._status,
      endDate: this.endDate,
      timestamp: new Date()
    };
    
    const memento = new SubscriptionMemento(state, action, reason);
    this._mementos.push(memento);
    return memento;
  }

  restoreFromMemento(memento: SubscriptionMemento): void {
    const state = memento.getState();
    this._status = state.status;
    this.endDate = state.endDate;
    this.createMemento('RESTORE', 'Restaurado desde snapshot');
  }

  getMementos(): SubscriptionMemento[] {
    return [...this._mementos];
  }

  activate(): void {
    this.createMemento('ACTIVATE', `Cambio: ${this._status} -> ACTIVE`);
    this._status = 'ACTIVE';
  }

  pause(reason?: string): void {
    this.createMemento('PAUSE', reason || 'Suscripcion pausada');
    this._status = 'PAUSED';
  }

  cancel(reason?: string): void {
    this.createMemento('CANCEL', reason || 'Suscripcion cancelada');
    this._status = 'CANCELLED';
  }

  reactivate(reason?: string): void {
    this.createMemento('REACTIVATE', reason || 'Suscripcion reactivada');
    this._status = 'ACTIVE';
  }

  extend(days: number): void {
    this.createMemento('EXTEND', `Extendida ${days} dias`);
    const newEndDate = new Date(this.endDate);
    newEndDate.setDate(newEndDate.getDate() + days);
    this.endDate = newEndDate;
  }
}

export class SubscriptionMemento {
  constructor(
    private readonly state: SubscriptionState,
    public readonly action: string,
    public readonly reason?: string
  ) {}

  getState(): SubscriptionState {
    return { ...this.state };
  }

  getTimestamp(): Date {
    return this.state.timestamp;
  }
}

export class Schedule {
  private _isActive: boolean = true;
  private _mementos: ScheduleMemento[] = [];

  constructor(
    public readonly id: string,
    public readonly classId: string,
    public className: string,
    public dayOfWeek: number,
    public startTime: string,
    public endTime: string,
    public room: string
  ) {}

  get isActive(): boolean {
    return this._isActive;
  }

  createMemento(action: string, reason?: string): ScheduleMemento {
    const state: ScheduleState = {
      id: this.id,
      dayOfWeek: this.dayOfWeek,
      startTime: this.startTime,
      endTime: this.endTime,
      room: this.room,
      isActive: this._isActive,
      timestamp: new Date()
    };

    const memento = new ScheduleMemento(state, action, reason);
    this._mementos.push(memento);
    return memento;
  }

  restoreFromMemento(memento: ScheduleMemento): void {
    const state = memento.getState();
    this.dayOfWeek = state.dayOfWeek;
    this.startTime = state.startTime;
    this.endTime = state.endTime;
    this.room = state.room;
    this._isActive = state.isActive;
    this.createMemento('RESTORE', 'Restaurado desde snapshot');
  }

  getMementos(): ScheduleMemento[] {
    return [...this._mementos];
  }

  activate(): void {
    this.createMemento('ACTIVATE', 'Horario activado');
    this._isActive = true;
  }

  deactivate(reason?: string): void {
    this.createMemento('DEACTIVATE', reason || 'Horario desactivado');
    this._isActive = false;
  }

  update(data: Partial<Pick<Schedule, 'dayOfWeek' | 'startTime' | 'endTime' | 'room'>>): void {
    this.createMemento('UPDATE', 'Horario modificado');
    if (data.dayOfWeek !== undefined) this.dayOfWeek = data.dayOfWeek;
    if (data.startTime !== undefined) this.startTime = data.startTime;
    if (data.endTime !== undefined) this.endTime = data.endTime;
    if (data.room !== undefined) this.room = data.room;
  }
}

export class ScheduleMemento {
  constructor(
    private readonly state: ScheduleState,
    public readonly action: string,
    public readonly reason?: string
  ) {}

  getState(): ScheduleState {
    return { ...this.state };
  }

  getTimestamp(): Date {
    return this.state.timestamp;
  }
}
