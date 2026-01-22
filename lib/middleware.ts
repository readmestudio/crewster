import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export async function requireAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

export function createUnauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
