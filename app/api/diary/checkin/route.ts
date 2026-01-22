import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emotion, intensity, memo } = await request.json();

    if (!emotion || typeof intensity !== 'number' || intensity < 0 || intensity > 100) {
      return NextResponse.json(
        { error: 'Invalid emotion or intensity' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 기존 체크인 확인 및 업데이트 또는 생성
    const checkIn = await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId: auth.userId,
          date: today,
        },
      },
      update: {
        emotion,
        intensity,
        memo: memo || null,
      },
      create: {
        userId: auth.userId,
        date: today,
        emotion,
        intensity,
        memo: memo || null,
      },
    });

    // 답변 저장
    await prisma.userResponse.create({
      data: {
        userId: auth.userId,
        date: today,
        question: '감정 체크인',
        answer: JSON.stringify({ emotion, intensity, memo }),
        context: 'checkin',
      },
    });

    return NextResponse.json({ checkIn });
  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
