import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 감정 체크인 데이터
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        userId: auth.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // 일기 데이터
    const diaryEntries = await prisma.diaryEntry.findMany({
      where: {
        userId: auth.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // 내재화 데이터
    const internalizations = await prisma.internalization.findMany({
      where: {
        userId: auth.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      checkIns,
      diaryEntries,
      internalizations,
    });
  } catch (error) {
    console.error('My data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
