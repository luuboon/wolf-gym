import { NextRequest, NextResponse } from 'next/server';
import { memberService, initializeData } from '@/interface/api';

export async function GET() {
  initializeData();
  const members = memberService.getAll();
  return NextResponse.json({ success: true, data: members });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone } = body;
  
  if (!name || !email) {
    return NextResponse.json({ 
      success: false, 
      error: 'Nombre y email requeridos' 
    }, { status: 400 });
  }
  
  const member = memberService.createMember(name, email, phone);
  return NextResponse.json({ success: true, data: member });
}
