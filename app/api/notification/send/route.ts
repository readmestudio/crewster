import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { sendKakaoNotification } from '@/lib/kakao';

export async function POST(request: NextRequest) {
  try {
    // 어드민 권한 확인 (실제로는 별도 인증 필요)
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, templateId, templateArgs } = await request.json();

    if (!phoneNumber || !templateId) {
      return NextResponse.json(
        { error: 'Phone number and template ID are required' },
        { status: 400 }
      );
    }

    await sendKakaoNotification(phoneNumber, templateId, templateArgs || {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification send API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
