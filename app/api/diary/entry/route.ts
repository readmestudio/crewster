import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      category,
      beforeThoughts,
      afterThoughts,
      hotThought,
      balancedThought,
    } = await request.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 일기 엔트리 생성 또는 업데이트
    const diaryEntry = await prisma.diaryEntry.upsert({
      where: {
        userId_date: {
          userId: auth.userId,
          date: today,
        },
      },
      update: {
        category: category || null,
        beforeThoughts: beforeThoughts || null,
        afterThoughts: afterThoughts || null,
        hotThought: hotThought || null,
        balancedThought: balancedThought || null,
      },
      create: {
        userId: auth.userId,
        date: today,
        category: category || null,
        beforeThoughts: beforeThoughts || null,
        afterThoughts: afterThoughts || null,
        hotThought: hotThought || null,
        balancedThought: balancedThought || null,
      },
    });

    // 답변 저장
    if (beforeThoughts) {
      await prisma.userResponse.create({
        data: {
          userId: auth.userId,
          date: today,
          question: 'Before 생각',
          answer: beforeThoughts,
          context: 'diary_before',
        },
      });
    }

    if (afterThoughts) {
      await prisma.userResponse.create({
        data: {
          userId: auth.userId,
          date: today,
          question: 'After 생각',
          answer: afterThoughts,
          context: 'diary_after',
        },
      });
    }

    if (hotThought) {
      await prisma.userResponse.create({
        data: {
          userId: auth.userId,
          date: today,
          question: '뜨거운 생각',
          answer: hotThought,
          context: 'diary_hot',
        },
      });
    }

    if (balancedThought) {
      await prisma.userResponse.create({
        data: {
          userId: auth.userId,
          date: today,
          question: '균형잡힌 사고',
          answer: balancedThought,
          context: 'diary_balanced',
        },
      });
    }

    return NextResponse.json({ diaryEntry });
  } catch (error) {
    console.error('Diary entry API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();
    date.setHours(0, 0, 0, 0);

    const diaryEntry = await prisma.diaryEntry.findUnique({
      where: {
        userId_date: {
          userId: auth.userId,
          date: date,
        },
      },
    });

    return NextResponse.json({ diaryEntry });
  } catch (error) {
    console.error('Diary entry GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
