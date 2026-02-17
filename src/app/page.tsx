'use client';

import { useState, useEffect, useCallback } from 'react';

const COLORS = {
  bg: '#0F0F0F',
  text: '#FCFCFC',
  primary: '#D82800',
  secondary: '#0058F8',
  accent: '#00A800',
  yellow: '#F8B800',
  gray: '#7C7C7C',
  darkGray: '#2C2C2C',
};

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

export default function WolfGym() {
  const [tab, setTab] = useState<'members' | 'subs' | 'sched'>('members');
  const [subscriptions, setSubscriptions] = useState<unknown[]>([]);
  const [schedules, setSchedules] = useState<unknown[]>([]);
  const [members, setMembers] = useState<unknown[]>([]);
  const [history, setHistory] = useState<unknown[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>(['> Sistema iniciado']);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-9), `> ${msg}`]);
  }, []);

  const refreshData = useCallback(async () => {
    const [subRes, schedRes, membRes] = await Promise.all([
      fetch('/api/subscriptions'),
      fetch('/api/schedules'),
      fetch('/api/members')
    ]);
    const subData = await subRes.json();
    const schedData = await schedRes.json();
    const membData = await membRes.json();
    if (subData.success) setSubscriptions(subData.data);
    if (schedData.success) setSchedules(schedData.data);
    if (membData.success) setMembers(membData.data);
  }, []);

  useEffect(() => {
    const init = async () => {
      await refreshData();
      addLog('Datos cargados');
    };
    init();
  }, [addLog, refreshData]);

  const showHistory = async (type: 'sub' | 'sched', id: string) => {
    const url = type === 'sub' 
      ? `/api/subscriptions?id=${id}&history=true`
      : `/api/schedules?id=${id}&history=true`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      setHistory(data.data);
      setSelectedId(id);
    }
  };

  const createMember = async (name: string, email: string, phone: string) => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`[CREATE] Miembro: ${name}`);
        refreshData();
      } else {
        addLog(`ERROR: ${data.error}`);
      }
    } catch (e: unknown) {
      const error = e as Error;
      addLog(`ERROR: ${error.message}`);
    }
  };

  const subAction = async (action: string, id: string, reason?: string) => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, subscriptionId: id, reason })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`[MEMENTO] ${action.toUpperCase()}: ${id.slice(0, 10)}...`);
        refreshData();
        if (selectedId) showHistory('sub', selectedId);
      } else {
        addLog(`ERROR: ${data.error}`);
      }
    } catch (e: unknown) {
      const error = e as Error;
      addLog(`ERROR: ${error.message}`);
    }
  };

  const schedAction = async (action: string, id: string, reason?: string) => {
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, scheduleId: id, reason })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`[MEMENTO] ${action.toUpperCase()}: ${id.slice(0, 10)}...`);
        refreshData();
        if (selectedId) showHistory('sched', selectedId);
      } else {
        addLog(`ERROR: ${data.error}`);
      }
    } catch (e: unknown) {
      const error = e as Error;
      addLog(`ERROR: ${error.message}`);
    }
  };

  const createSub = async (memberId: string, planName: string, price: number, days: number) => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, planId: 'plan-new', planName, price, days })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`[CREATE] Nueva suscripcion`);
        refreshData();
      } else {
        addLog(`ERROR: ${data.error}`);
      }
    } catch (e: unknown) {
      const error = e as Error;
      addLog(`ERROR: ${error.message}`);
    }
  };

  const createSched = async (className: string, dayOfWeek: number, startTime: string, endTime: string, room: string) => {
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: `class-${Date.now()}`, className, dayOfWeek, startTime, endTime, room })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`[CREATE] Nuevo horario: ${className}`);
        refreshData();
      } else {
        addLog(`ERROR: ${data.error}`);
      }
    } catch (e: unknown) {
      const error = e as Error;
      addLog(`ERROR: ${error.message}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: 'monospace',
      padding: '16px',
    }}>
      <header style={{
        border: `4px solid ${COLORS.primary}`,
        padding: '16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          imageRendering: 'pixelated',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'repeat(12, 1fr)',
          gap: 0,
        }}>
          {renderPixelWolf()}
        </div>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            margin: 0,
            color: COLORS.primary,
            textShadow: `2px 2px ${COLORS.darkGray}`,
          }}>
            WOLF GYM
          </h1>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setTab('members')}
          style={{
            padding: '8px 16px',
            background: tab === 'members' ? COLORS.yellow : COLORS.darkGray,
            color: COLORS.bg,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          MIEMBROS
        </button>
        <button
          onClick={() => setTab('subs')}
          style={{
            padding: '8px 16px',
            background: tab === 'subs' ? COLORS.primary : COLORS.darkGray,
            color: COLORS.text,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          SUSCRIPCIONES
        </button>
        <button
          onClick={() => setTab('sched')}
          style={{
            padding: '8px 16px',
            background: tab === 'sched' ? COLORS.secondary : COLORS.darkGray,
            color: COLORS.text,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          HORARIOS
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
        <div style={{
          border: `2px solid ${COLORS.gray}`,
          padding: '12px',
          minHeight: '400px',
        }}>
          {tab === 'members' ? (
            <MemberPanel 
              data={members}
              onCreate={createMember}
            />
          ) : tab === 'subs' ? (
            <SubscriptionPanel 
              data={subscriptions}
              members={members}
              onAction={subAction}
              onHistory={(id) => showHistory('sub', id)}
              onCreate={createSub}
            />
          ) : (
            <SchedulePanel 
              data={schedules} 
              onAction={schedAction}
              onHistory={(id) => showHistory('sched', id)}
              onCreate={createSched}
            />
          )}
        </div>

        <div style={{
          border: `2px solid ${COLORS.accent}`,
          padding: '12px',
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: COLORS.accent,
            fontSize: '14px',
          }}>
            MEMENTO HISTORY
          </h3>
          {selectedId && history.length > 0 ? (
            <div style={{ fontSize: '11px' }}>
              {history.map((h, i) => {
                const item = h as { action: string; reason?: string; timestamp: Date };
                return (
                  <div key={i} style={{
                    padding: '8px',
                    marginBottom: '4px',
                    background: COLORS.darkGray,
                    borderLeft: `3px solid ${COLORS.accent}`,
                  }}>
                    <div style={{ color: COLORS.yellow }}>{item.action}</div>
                    <div style={{ color: COLORS.gray }}>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                    {item.reason && <div>{item.reason}</div>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: COLORS.gray, fontSize: '11px' }}>
              Click en H para ver historial
            </p>
          )}
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        border: `2px solid ${COLORS.darkGray}`,
        padding: '8px',
        height: '100px',
        overflow: 'auto',
        fontSize: '11px',
        color: COLORS.accent,
      }}>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}

function MemberPanel({ data, onCreate }: {
  data: unknown[];
  onCreate: (name: string, email: string, phone: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleCreate = () => {
    if (name && email) {
      onCreate(name, email, phone);
      setShowForm(false);
      setName('');
      setEmail('');
      setPhone('');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: COLORS.yellow, fontSize: '14px' }}>
          MIEMBROS [{data.length}]
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ ...btnStyle(COLORS.yellow), fontSize: '12px' }}
        >
          + NUEVO
        </button>
      </div>

      {showForm && (
        <div style={{ 
          background: COLORS.darkGray, 
          padding: '12px', 
          marginBottom: '12px',
          border: `1px solid ${COLORS.gray}`
        }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: COLORS.gray, fontSize: '10px' }}>NOMBRE:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Juan Perez"
              style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }} 
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: COLORS.gray, fontSize: '10px' }}>EMAIL:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="juan@email.com"
              style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }} 
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: COLORS.gray, fontSize: '10px' }}>TELEFONO:</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="555-1234"
              style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }} 
            />
          </div>
          <button onClick={handleCreate} style={{ ...btnStyle(COLORS.yellow), width: '100%' }}>
            CREAR MIEMBRO
          </button>
        </div>
      )}

      <div style={{ fontSize: '11px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 100px',
          gap: '4px',
          marginBottom: '8px',
          color: COLORS.gray,
          borderBottom: `1px solid ${COLORS.gray}`,
          paddingBottom: '4px',
        }}>
          <span>NOMBRE</span>
          <span>EMAIL</span>
          <span>ESTADO</span>
        </div>
        
        {data.length === 0 ? (
          <p style={{ color: COLORS.gray, textAlign: 'center', padding: '20px' }}>
            No hay miembros. Crea uno nuevo.
          </p>
        ) : (
          data.map((item) => {
            const member = item as { id: string; name: string; email: string; isActive: boolean };
            return (
              <div key={member.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 100px',
                gap: '4px',
                padding: '8px 0',
                borderBottom: `1px solid ${COLORS.darkGray}`,
              }}>
                <span style={{ color: COLORS.text }}>{member.name}</span>
                <span style={{ color: COLORS.gray }}>{member.email}</span>
                <span style={{ color: member.isActive ? COLORS.accent : COLORS.primary }}>
                  {member.isActive ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SubscriptionPanel({ data, members, onAction, onHistory, onCreate }: {
  data: unknown[];
  members: unknown[];
  onAction: (action: string, id: string, reason?: string) => void;
  onHistory: (id: string) => void;
  onCreate: (memberId: string, planName: string, price: number, days: number) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [planName, setPlanName] = useState('Mensual');
  const [price, setPrice] = useState('500');
  const [days, setDays] = useState('30');

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: COLORS.accent,
    PAUSED: COLORS.yellow,
    CANCELLED: COLORS.primary,
    PENDING: COLORS.secondary,
  };

  const handleCreate = () => {
    if (memberId) {
      onCreate(memberId, planName, parseFloat(price), parseInt(days));
      setShowForm(false);
      setMemberId('');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: COLORS.primary, fontSize: '14px' }}>
          SUSCRIPCIONES [{data.length}]
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ ...btnStyle(COLORS.accent), fontSize: '12px' }}
        >
          + NUEVA
        </button>
      </div>

      {showForm && (
        <div style={{ 
          background: COLORS.darkGray, 
          padding: '12px', 
          marginBottom: '12px',
          border: `1px solid ${COLORS.gray}`
        }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: COLORS.gray, fontSize: '10px' }}>MIEMBRO:</label>
            <select 
              value={memberId} 
              onChange={(e) => setMemberId(e.target.value)}
              style={{ 
                width: '100%', 
                background: COLORS.bg, 
                color: COLORS.text, 
                border: `1px solid ${COLORS.gray}`,
                padding: '4px',
                fontFamily: 'monospace'
              }}
            >
              <option value="">Seleccionar miembro...</option>
              {members.map((m) => {
                const member = m as { id: string; name: string };
                return <option key={member.id} value={member.id}>{member.name}</option>;
              })}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ color: COLORS.gray, fontSize: '10px' }}>PLAN:</label>
              <select 
                value={planName} 
                onChange={(e) => { setPlanName(e.target.value); setPrice(e.target.value === 'Mensual' ? '500' : '1200'); setDays(e.target.value === 'Mensual' ? '30' : '90'); }}
                style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }}
              >
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
              </select>
            </div>
            <div>
              <label style={{ color: COLORS.gray, fontSize: '10px' }}>PRECIO:</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ color: COLORS.gray, fontSize: '10px' }}>DIAS:</label>
              <input type="number" value={days} onChange={(e) => setDays(e.target.value)} style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }} />
            </div>
          </div>
          <button onClick={handleCreate} style={{ ...btnStyle(COLORS.accent), width: '100%' }}>
            CREAR SUSCRIPCION
          </button>
        </div>
      )}

      <div style={{ fontSize: '11px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 80px 130px',
          gap: '4px',
          marginBottom: '8px',
          color: COLORS.gray,
          borderBottom: `1px solid ${COLORS.gray}`,
          paddingBottom: '4px',
        }}>
          <span>ID</span>
          <span>PLAN</span>
          <span>STATUS</span>
          <span>ACCIONES</span>
        </div>
        
        {data.length === 0 ? (
          <p style={{ color: COLORS.gray, textAlign: 'center', padding: '20px' }}>
            No hay suscripciones. Crea una nueva.
          </p>
        ) : (
          data.map((item) => {
            const sub = item as { id: string; planName: string; status: string };
            return (
              <div key={sub.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px 130px',
                gap: '4px',
                padding: '8px 0',
                borderBottom: `1px solid ${COLORS.darkGray}`,
              }}>
                <span style={{ color: COLORS.text }}>{sub.id.slice(0, 18)}...</span>
                <span style={{ color: COLORS.yellow }}>{sub.planName}</span>
                <span style={{ color: STATUS_COLORS[sub.status] || COLORS.gray }}>
                  {sub.status}
                </span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {sub.status === 'ACTIVE' && (
                    <button onClick={() => onAction('pause', sub.id)} style={btnStyle(COLORS.yellow)} title="Pausar">||</button>
                  )}
                  {sub.status === 'PAUSED' && (
                    <button onClick={() => onAction('reactivate', sub.id)} style={btnStyle(COLORS.accent)} title="Reactivar">&gt;</button>
                  )}
                  {sub.status !== 'CANCELLED' && (
                    <button onClick={() => onAction('cancel', sub.id)} style={btnStyle(COLORS.primary)} title="Cancelar">X</button>
                  )}
                  <button onClick={() => onAction('undo', sub.id)} style={btnStyle(COLORS.secondary)} title="UNDO - Deshacer ultimo cambio">U</button>
                  <button onClick={() => onHistory(sub.id)} style={btnStyle(COLORS.accent)} title="Ver historial">H</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SchedulePanel({ data, onAction, onHistory, onCreate }: {
  data: unknown[];
  onAction: (action: string, id: string, reason?: string) => void;
  onHistory: (id: string) => void;
  onCreate: (className: string, dayOfWeek: number, startTime: string, endTime: string, room: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [className, setClassName] = useState('');
  const [day, setDay] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('Sala A');

  const handleCreate = () => {
    if (className) {
      onCreate(className, parseInt(day), startTime, endTime, room);
      setShowForm(false);
      setClassName('');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: COLORS.secondary, fontSize: '14px' }}>
          HORARIOS [{data.length}]
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ ...btnStyle(COLORS.accent), fontSize: '12px' }}
        >
          + NUEVO
        </button>
      </div>

      {showForm && (
        <div style={{ 
          background: COLORS.darkGray, 
          padding: '12px', 
          marginBottom: '12px',
          border: `1px solid ${COLORS.gray}`
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ color: COLORS.gray, fontSize: '10px' }}>CLASE:</label>
              <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Yoga" style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ color: COLORS.gray, fontSize: '10px' }}>DIA:</label>
              <select value={day} onChange={(e) => setDay(e.target.value)} style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }}>
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ color: COLORS.gray, fontSize: '10px' }}>INICIO:</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ color: COLORS.gray, fontSize: '10px' }}>FIN:</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ color: COLORS.gray, fontSize: '10px' }}>SALA:</label>
              <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} style={{ width: '100%', background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.gray}`, padding: '4px', fontFamily: 'monospace' }} />
            </div>
          </div>
          <button onClick={handleCreate} style={{ ...btnStyle(COLORS.accent), width: '100%' }}>
            CREAR HORARIO
          </button>
        </div>
      )}

      <div style={{ fontSize: '11px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 50px 80px 50px 130px',
          gap: '4px',
          marginBottom: '8px',
          color: COLORS.gray,
          borderBottom: `1px solid ${COLORS.gray}`,
          paddingBottom: '4px',
        }}>
          <span>CLASE</span>
          <span>DIA</span>
          <span>HORA</span>
          <span>ACT</span>
          <span>ACCIONES</span>
        </div>
        
        {data.length === 0 ? (
          <p style={{ color: COLORS.gray, textAlign: 'center', padding: '20px' }}>
            No hay horarios. Crea uno nuevo.
          </p>
        ) : (
          data.map((item) => {
            const sched = item as { id: string; className: string; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean };
            return (
              <div key={sched.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 50px 80px 50px 130px',
                gap: '4px',
                padding: '8px 0',
                borderBottom: `1px solid ${COLORS.darkGray}`,
                opacity: sched.isActive ? 1 : 0.5,
              }}>
                <span style={{ color: COLORS.text }}>{sched.className}</span>
                <span style={{ color: COLORS.yellow }}>{DAYS[sched.dayOfWeek]}</span>
                <span style={{ color: COLORS.gray }}>{sched.startTime}-{sched.endTime}</span>
                <span style={{ color: sched.isActive ? COLORS.accent : COLORS.primary }}>
                  {sched.isActive ? 'SI' : 'NO'}
                </span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button
                    onClick={() => onAction(sched.isActive ? 'deactivate' : 'activate', sched.id)}
                    style={btnStyle(sched.isActive ? COLORS.primary : COLORS.accent)}
                    title={sched.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {sched.isActive ? 'O' : '*'}
                  </button>
                  <button onClick={() => onAction('undo', sched.id)} style={btnStyle(COLORS.secondary)} title="UNDO - Deshacer">U</button>
                  <button onClick={() => onHistory(sched.id)} style={btnStyle(COLORS.accent)} title="Ver historial">H</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const btnStyle = (color: string): React.CSSProperties => ({
  background: 'transparent',
  border: `1px solid ${color}`,
  color: color,
  padding: '2px 6px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: '11px',
});

function renderPixelWolf() {
  const pixels = [
    '    GGGG    ',
    '   GGGGGG   ',
    '  GGGGGGGG  ',
    ' GGGGGGGGGGR',
    'GGRRGGRRGGGR',
    'GGGGGGGGGGGG',
    'GGGGGGGGGGGG',
    'GGGGGGGGGGGG',
    ' GGGGGGGGGG ',
    '  GGG  GGG  ',
    '  GGG  GGG  ',
    '   G    G   ',
  ];
  
  const colorMap: Record<string, string> = {
    'G': COLORS.gray,
    'R': COLORS.primary,
    ' ': 'transparent',
  };
  
  const elements: React.ReactNode[] = [];
  pixels.forEach((row, y) => {
    row.split('').forEach((pixel, x) => {
      elements.push(
        <div
          key={`${x}-${y}`}
          style={{
            background: colorMap[pixel],
            width: '4px',
            height: '4px',
          }}
        />
      );
    });
  });
  
  return elements;
}
