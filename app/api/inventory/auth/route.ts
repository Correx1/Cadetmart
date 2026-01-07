import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateSessionToken, getSessionCookieConfig } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // Verify password
    if (!verifyPassword(password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Generate session token
    const sessionToken = generateSessionToken(password);

    // Create response with session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('inventory_session', sessionToken, getSessionCookieConfig());

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
