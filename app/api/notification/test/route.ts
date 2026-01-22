import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

// 테스트용: 수동으로 알림 발송
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 오늘 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘 아직 체크인하지 않은 사용자 확인
    const checkIn = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId: auth.userId,
          date: today,
        },
      },
    });

    if (checkIn) {
      return NextResponse.json({
        message: '이미 오늘 체크인을 완료했습니다.',
        checkIn,
      });
    }

    // 알림 발송 로직 (실제 구현 시)
    return NextResponse.json({
      message: '알림이 발송되었습니다.',
      userId: auth.userId,
    });
  } catch (error) {
    console.error('Test notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
