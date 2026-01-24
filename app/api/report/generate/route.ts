import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // 7일간의 데이터 수집
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        userId: auth.userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    const diaryEntries = await prisma.diaryEntry.findMany({
      where: {
        userId: auth.userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    const userResponses = await prisma.userResponse.findMany({
      where: {
        userId: auth.userId,
        date: { gte: start, lte: end },
      },
    });

    // 핵심 믿음 분석 (뜨거운 생각에서 자주 나타나는 패턴)
    const hotThoughts = diaryEntries
      .map((e) => e.hotThought)
      .filter((t): t is string => t !== null);

    // 감정 분석
    const emotions = checkIns.map((c) => ({
      emotion: c.emotion,
      intensity: c.intensity,
      date: c.date,
    }));

    // 감정 변화 추이
    const emotionChanges = emotions.map((e, index) => {
      const prev = index > 0 ? emotions[index - 1] : null;
      return {
        date: e.date,
        emotion: e.emotion,
        intensity: e.intensity,
        change: prev ? e.intensity - prev.intensity : 0,
      };
    });

    // 주요 감정 (빈도 기반)
    const emotionFrequency: Record<string, number> = {};
    emotions.forEach((e) => {
      emotionFrequency[e.emotion] = (emotionFrequency[e.emotion] || 0) + 1;
    });
    const mainEmotions = Object.entries(emotionFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion, count]) => ({ emotion, count }));

    // 리포트 데이터 구성
    const reportData = {
      checkIns,
      diaryEntries,
      emotions,
      emotionChanges,
      mainEmotions,
      hotThoughts,
      totalDays: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    };

    // 상담사 코멘트 가져오기
    const counselorComment = await prisma.counselorComment.findFirst({
      where: {
        userId: auth.userId,
        date: { gte: start, lte: end },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 기존 리포트 확인
    const existingReport = await prisma.report.findFirst({
      where: {
        userId: auth.userId,
        startDate: start,
        endDate: end,
      },
    });

    // 리포트 저장 또는 업데이트
    const report = existingReport
      ? await prisma.report.update({
          where: { id: existingReport.id },
          data: {
            coreBeliefs: JSON.stringify(hotThoughts),
            mainEmotions: JSON.stringify(mainEmotions),
            emotionChanges: JSON.stringify(emotionChanges),
            reportData: JSON.stringify(reportData),
            counselorComment: counselorComment?.comment || null,
          },
        })
      : await prisma.report.create({
          data: {
            userId: auth.userId,
            startDate: start,
            endDate: end,
            coreBeliefs: JSON.stringify(hotThoughts),
            mainEmotions: JSON.stringify(mainEmotions),
            emotionChanges: JSON.stringify(emotionChanges),
            reportData: JSON.stringify(reportData),
            counselorComment: counselorComment?.comment || null,
          },
        });

    return NextResponse.json({ report, reportData });
  } catch (error) {
    console.error('Report generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
