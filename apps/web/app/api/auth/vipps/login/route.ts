import { NextRequest, NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Trigger Vipps OAuth flow
    const result = await signIn('vipps', {
      redirect: false,
      phoneNumber,
    });

    if (result?.error) {
      return NextResponse.json(
        { error: 'Vipps authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vipps authentication initiated',
    });
  } catch (error) {
    console.error('Vipps login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}