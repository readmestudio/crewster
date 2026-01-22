import { NextResponse } from 'next/server';
import { getKakaoLoginUrl } from '@/lib/kakao';

export async function GET() {
  const loginUrl = getKakaoLoginUrl();
  return NextResponse.json({ loginUrl });
}
