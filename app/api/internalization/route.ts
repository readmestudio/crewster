import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { positiveStatement } = await request.json();

    if (!positiveStatement || typeof positiveStatement !== 'string') {
      return NextResponse.json(
        { error: 'Positive statement is required' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 내재화 문장 저장
    const internalization = await prisma.internalization.create({
      data: {
        userId: auth.userId,
        date: today,
        positiveStatement,
      },
    });

    // 답변 저장
    await prisma.userResponse.create({
      data: {
        userId: auth.userId,
        date: today,
        question: '내재화 긍정 구문',
        answer: positiveStatement,
        context: 'internalization',
      },
    });

    return NextResponse.json({ internalization });
  } catch (error) {
    console.error('Internalization API error:', error);
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
    const limit = parseInt(searchParams.get('limit') || '30');

    const internalizations = await prisma.internalization.findMany({
      where: {
        userId: auth.userId,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json({ internalizations });
  } catch (error) {
    console.error('Internalization GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
