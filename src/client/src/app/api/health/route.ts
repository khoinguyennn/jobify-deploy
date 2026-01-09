import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'jobify-client',
      version: '1.0.0',
    },
    { status: 200 }
  );
}


















