import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const response = NextResponse.json({ success: true });
  response.cookies.delete('token');
  return response;
}
