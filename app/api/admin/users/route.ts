import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

// 어드민 권한 확인 (실제로는 별도 어드민 인증 필요)
async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) {
    return null;
  }
  // TODO: 실제 어드민 권한 확인 로직 추가
  return auth;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            dailyCheckIns: true,
            diaryEntries: true,
            reports: true,
          },
        },
      },
    });

    const total = await prisma.user.count();

    return NextResponse.json({
      users,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
