# WOLF GYM

Sistema de gestion de gimnasio.

---

## Arquitectura: Cliente-Servidor

### Justificacion

Se eligio **Cliente-Servidor** sobre SOA (Service-Oriented Architecture) porque:

1. **Simplicidad**: La aplicacion tiene un unico cliente (web) que consume las APIs
2. **Escalabilidad suficiente**: Para un gimnasio, no se necesitan multiples servicios independientes
3. **Mantenibilidad**: Un solo servidor es mas facil de mantener y desplegar
4. **Patrones mas claros**: Repository y Memento se demuestran mejor sin la complejidad adicional de microservicios

### Donde se implementa

**CLIENTE:**
```
src/app/page.tsx
```
Interfaz de usuario que realiza peticiones HTTP al servidor.

**SERVIDOR:**
```
src/app/api/
├── members/route.ts      # API de miembros
├── subscriptions/route.ts # API de suscripciones
└── schedules/route.ts    # API de horarios
```

### Como funciona

```
┌─────────────────┐         HTTP          ┌─────────────────┐
│    CLIENTE      │  ──────────────────►  │    SERVIDOR     │
│  (Browser)      │  ◄──────────────────  │  (Next.js API)  │
│  page.tsx       │         JSON          │  api/*.ts       │
└─────────────────┘                       └─────────────────┘
```

El cliente hace fetch a las rutas de la API:
```typescript
const res = await fetch('/api/subscriptions', {
  method: 'POST',
  body: JSON.stringify({ action, subscriptionId })
});
```

El servidor responde con JSON:
```typescript
return NextResponse.json({ success: true, data: subscription });
```

---

## Patron Repository

### Justificacion

Se uso el patron **Repository** porque:

1. **Abstraccion de datos**: El codigo de negocio no sabe COMO se guardan los datos
2. **Facil cambio de implementacion**: Se puede cambiar de memoria a base de datos sin modificar servicios
3. **Testeabilidad**: Facil de hacer mock para pruebas unitarias
4. **Principio DIP**: Las capas superiores dependen de abstracciones, no de implementaciones concretas

### Donde se usa

**Interfaz (Contrato) - Domain Layer:**
```
src/domain/ports/index.ts
```
```typescript
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
```

**Implementacion - Infrastructure Layer:**
```
src/infrastructure/repositories/InMemoryRepositories.ts
```
```typescript
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
```

**Singleton Store - Infrastructure Layer:**
```
src/infrastructure/repositories/SingletonStore.ts
```
```typescript
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
```

> **Nota importante**: Se usa `globalThis` para garantizar que los repositorios sean verdaderos singletons. En Next.js, cada API route puede ejecutarse en contextos separados, lo que causaria que cada llamada usara una instancia diferente del repositorio.

**Uso en servicios - Application Layer:**
```
src/application/services/SubscriptionService.ts
```
```typescript
export class SubscriptionService {
  createSubscription(...) {
    const store = getStore();
    const member = store.memberRepository.findById(memberId);
    const subscription = new Subscription(...);
    store.subscriptionRepository.save(subscription);
    return subscription;
  }

  getAll(): Subscription[] {
    return getStore().subscriptionRepository.findAll();
  }
}
```

---

## Patron Memento

### Justificacion

Se uso el patron **Memento** porque:

1. **Historial de cambios**: Permite guardar estados anteriores de suscripciones y horarios
2. **Funcionalidad Undo**: El usuario puede deshacer la ultima accion
3. **Sin exponer estado interno**: El estado se encapsula en el Memento
4. **Auditoria**: Queda registro de todas las acciones realizadas con fecha y razon

### Donde se usa

**Memento (Snapshot) - Domain Layer:**
```
src/domain/entities/Member.ts
```
```typescript
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
```

**Originator (Crea y restaura) - Domain Layer:**
```
src/domain/entities/Member.ts
```
```typescript
export class Subscription {
  private _status: SubscriptionStatus = 'PENDING';
  private _mementos: SubscriptionMemento[] = [];

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

  pause(reason?: string): void {
    this.createMemento('PAUSE', reason || 'Pausada');
    this._status = 'PAUSED';
  }

  cancel(reason?: string): void {
    this.createMemento('CANCEL', reason || 'Cancelada');
    this._status = 'CANCELLED';
  }
}
```

**Uso en servicios (Undo) - Application Layer:**
```
src/application/services/SubscriptionService.ts
```
```typescript
undo(id: string): { subscription: Subscription; message: string } {
  const store = getStore();
  const sub = store.subscriptionRepository.findById(id);
  const mementos = sub.getMementos();
  const previousMemento = mementos[mementos.length - 2];
  sub.restoreFromMemento(previousMemento);
  store.subscriptionRepository.save(sub);
  return { subscription: sub, message: 'Restaurado' };
}

getHistory(id: string) {
  const store = getStore();
  const sub = store.subscriptionRepository.findById(id);
  return sub.getMementos().map(m => ({
    action: m.action,
    reason: m.reason,
    timestamp: m.getTimestamp(),
    state: m.getState()
  }));
}
```

---

## Clean Architecture

### Justificacion

Se implemento **Clean Architecture** porque:

1. **Independencia de frameworks**: El dominio no depende de Next.js
2. **Testeabilidad**: Las reglas de negocio se pueden probar sin UI, base de datos, etc.
3. **Independencia de UI**: Se podria cambiar la interfaz sin afectar la logica
4. **Independencia de datos**: Se puede cambiar de memoria a base de datos facilmente

### Estructura de capas

```
src/
├── domain/                  # CAPA DE DOMINIO (sin dependencias externas)
│   ├── entities/           # Entidades con logica de negocio pura
│   │   ├── Member.ts       # Member, Subscription, Schedule + Mementos
│   │   ├── types.ts        # Tipos
│   │   └── index.ts
│   └── ports/              # Interfaces (contratos)
│       └── index.ts        # IMemberRepository, ISubscriptionRepository, IScheduleRepository
│
├── application/            # CAPA DE APLICACION (casos de uso)
│   └── services/           # Orquesta el flujo de datos
│       ├── MemberService.ts
│       ├── SubscriptionService.ts
│       ├── ScheduleService.ts
│       └── index.ts
│
├── infrastructure/         # CAPA DE INFRAESTRUCTURA (detalles tecnicos)
│   └── repositories/       # Implementacion de interfaces de dominio
│       ├── InMemoryRepositories.ts
│       ├── SingletonStore.ts
│       └── index.ts
│
└── interface/              # CAPA DE INTERFACE (puntos de entrada)
    └── api/                # REST API
        └── index.ts        # Inicializacion y exports
```

### Flujo de dependencias (Regla de Dependencia)

```
Interface → Application → Domain ← Infrastructure
   │            │            │           │
   │            │            │           │
   ▼            ▼            ▼           ▼
 Controllers  Use Cases   Entities   Repositories
                              ▲
                              │
                    Implementan interfaces
```

**Regla**: Las capas internas no dependen de las externas. Infrastructure implementa las interfaces definidas en Domain.

---

## API

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /api/members | Listar miembros |
| POST | /api/members | Crear miembro |
| GET | /api/subscriptions | Listar suscripciones |
| GET | /api/subscriptions?id=X | Obtener una |
| GET | /api/subscriptions?id=X&history=true | Historial memento |
| POST | /api/subscriptions | Accion: activate, pause, cancel, reactivate, undo |
| GET | /api/schedules | Listar horarios |
| POST | /api/schedules | Accion: activate, deactivate, undo |

---

## Ejecutar

```bash
bun run dev
```

---

## Resumen de Patrones

| Patron | Ubicacion | Proposito |
|--------|-----------|-----------|
| Repository | domain/ports + infrastructure/repositories | Abstraer acceso a datos |
| Memento | domain/entities (Subscription, Schedule) | Guardar historial y permitir undo |
| Singleton | infrastructure/repositories/SingletonStore.ts | Garantizar instancia unica en Next.js |
| Dependency Injection | application/services | Servicios reciben repositorios via getStore() |
