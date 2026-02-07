import { NextRequest, NextResponse } from 'next/server';
import { getKakaoLoginUrl } from '@/lib/kakao';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const loginUrl = getKakaoLoginUrl();
  return NextResponse.json({ loginUrl });
}
