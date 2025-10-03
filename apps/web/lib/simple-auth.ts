import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: string;
  bankIdVerified: boolean;
  tokenBalance: number;
  onboardingStatus: string;
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User } | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? window.location.origin
        : 'http://localhost:3001');

    const response = await fetch(`${apiUrl}/api/auth/login-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export function getTokenFromCookie(): string | null {
  try {
    return cookies().get('token')?.value || null;
  } catch {
    return null;
  }
}

export function setTokenCookie(token: string) {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes to match backend
    path: '/',
  });
}

export function clearTokenCookie() {
  cookies().delete('token');
}

export async function getCurrentUser(token: string): Promise<User | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? window.location.origin
        : 'http://localhost:3001');

    const response = await fetch(`${apiUrl}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}