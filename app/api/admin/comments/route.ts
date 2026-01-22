import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) {
    return null;
  }
  // TODO: 실제 어드민 권한 확인 로직 추가
  return auth;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, date, comment } = await request.json();

    if (!userId || !comment) {
      return NextResponse.json(
        { error: 'User ID and comment are required' },
        { status: 400 }
      );
    }

    const commentDate = date ? new Date(date) : new Date();
    commentDate.setHours(0, 0, 0, 0);

    const counselorComment = await prisma.counselorComment.create({
      data: {
        userId,
        date: commentDate,
        comment,
        counselorId: auth.userId,
      },
    });

    return NextResponse.json({ counselorComment });
  } catch (error) {
    console.error('Admin comment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    const comments = await prisma.counselorComment.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            kakaoId: true,
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Admin comments GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
