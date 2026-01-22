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

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        dailyCheckIns: {
          orderBy: { date: 'desc' },
          take: 7,
        },
        diaryEntries: {
          orderBy: { date: 'desc' },
          take: 7,
        },
        internalizations: {
          orderBy: { date: 'desc' },
          take: 7,
        },
        reports: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin user detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
