import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Vipps OAuth error:', error);
      return NextResponse.redirect('/login?error=vipps_auth_failed');
    }

    if (!code || !state) {
      return NextResponse.redirect('/login?error=missing_parameters');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.vipps.no/access-management-1.0/access/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.VIPPS_CLIENT_ID}:${process.env.VIPPS_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/vipps/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect('/login?error=token_exchange_failed');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://api.vipps.no/access-management-1.0/access/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('User info fetch failed:', await userResponse.text());
      return NextResponse.redirect('/login?error=userinfo_failed');
    }

    const userInfo = await userResponse.json();

    // Store user info in session (handled by NextAuth)
    // This will be processed by the Vipps provider profile function

    return NextResponse.redirect('/dashboard?vipps_success=true');
  } catch (error) {
    console.error('Vipps callback error:', error);
    return NextResponse.redirect('/login?error=callback_error');
  }
}