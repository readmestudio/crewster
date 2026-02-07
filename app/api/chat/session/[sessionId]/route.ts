// 그룹 세션 조회
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  requireAuthWithSubscription,
  createUnauthorizedResponse,
} from '@/lib/middleware';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const session = await prisma.chatSession.findFirst({
      where: {
        id: params.sessionId,
        userId: auth.userId,
        type: 'group',
      },
      include: {
        crewMembers: {
          include: {
            crew: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('세션 조회 오류:', error);
    return NextResponse.json(
      { error: '세션 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}