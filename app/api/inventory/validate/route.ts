import { NextRequest, NextResponse } from 'next/server';
import { validateSessionToken } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('inventory_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const isValid = validateSessionToken(sessionToken);

    if (!isValid) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Logout endpoint
  const response = NextResponse.json({ success: true });
  response.cookies.delete('inventory_session');
  return response;
}
