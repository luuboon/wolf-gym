import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'WOLF GYM API',
    version: '1.0.0',
    patterns: ['Repository', 'Memento'],
    architecture: 'Clean Architecture'
  });
}
