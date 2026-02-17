import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService, initializeData } from '@/interface/api';

export async function GET(request: NextRequest) {
  initializeData();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const history = searchParams.get('history');

  if (id && history === 'true') {
    try {
      const h = subscriptionService.getHistory(id);
      return NextResponse.json({ success: true, data: h });
    } catch (e: unknown) {
      const error = e as Error;
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
  }

  if (id) {
    const sub = subscriptionService.getById(id);
    if (!sub) {
      return NextResponse.json({ success: false, error: 'No encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: sub });
  }

  const all = subscriptionService.getAll();
  return NextResponse.json({ success: true, data: all });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, subscriptionId, reason, memberId, planId, planName, price, days } = body;

  try {
    if (!action && memberId) {
      const sub = subscriptionService.createSubscription(
        memberId, planId || 'plan-1', planName || 'Mensual', price || 500, days || 30
      );
      return NextResponse.json({ success: true, data: sub });
    }

    let result;
    switch (action) {
      case 'activate':
        result = subscriptionService.activate(subscriptionId);
        break;
      case 'pause':
        result = subscriptionService.pause(subscriptionId, reason);
        break;
      case 'cancel':
        result = subscriptionService.cancel(subscriptionId, reason);
        break;
      case 'reactivate':
        result = subscriptionService.reactivate(subscriptionId);
        break;
      case 'undo':
        result = subscriptionService.undo(subscriptionId);
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
