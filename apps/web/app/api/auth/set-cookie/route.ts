import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, user } = body;

    if (!token || !user) {
      return NextResponse.json(
        { error: 'Missing token or user data' },
        { status: 400 }
      );
    }

    // Set httpOnly cookie for server-side authentication
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes to match backend
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set cookie error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}