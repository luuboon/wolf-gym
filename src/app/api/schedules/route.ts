import { NextRequest, NextResponse } from 'next/server';
import { scheduleService, initializeData } from '@/interface/api';

export async function GET(request: NextRequest) {
  initializeData();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const history = searchParams.get('history');
  const day = searchParams.get('day');

  if (id && history === 'true') {
    try {
      const h = scheduleService.getHistory(id);
      return NextResponse.json({ success: true, data: h });
    } catch (e: unknown) {
      const error = e as Error;
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
  }

  if (id) {
    const s = scheduleService.getById(id);
    if (!s) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: s });
  }

  if (day !== null) {
    return NextResponse.json({ success: true, data: scheduleService.getByDay(parseInt(day)) });
  }

  return NextResponse.json({ success: true, data: scheduleService.getAll() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, scheduleId, reason, classId, className, dayOfWeek, startTime, endTime, room } = body;

  try {
    if (!action && classId) {
      const s = scheduleService.createSchedule(classId, className, dayOfWeek, startTime, endTime, room);
      return NextResponse.json({ success: true, data: s });
    }

    let result;
    switch (action) {
      case 'activate':
        result = scheduleService.activate(scheduleId);
        break;
      case 'deactivate':
        result = scheduleService.deactivate(scheduleId, reason);
        break;
      case 'undo':
        result = scheduleService.undo(scheduleId);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Accion invalida' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
