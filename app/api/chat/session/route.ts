// 세션별 메시지 조회
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  requireAuthWithSubscription,
  createUnauthorizedResponse,
} from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const searchParams = request.nextUrl.searchParams;
    const crewId = searchParams.get('crewId');
    const sessionId = searchParams.get('sessionId');

    if (!crewId && !sessionId) {
      return NextResponse.json(
        { error: 'crewId 또는 sessionId가 필요합니다.' },
        { status: 400 }
      );
    }

    let session = null;

    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: auth.userId,
        },
      });
    } else if (crewId) {
      // 크루와의 최근 세션 찾기
      const sessions = await prisma.chatSession.findMany({
        where: {
          type: 'direct',
          userId: auth.userId,
        },
        include: {
          messages: {
            where: {
              crewId: crewId,
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 1,
      });

      if (sessions.length > 0 && sessions[0].messages.length > 0) {
        session = sessions[0];
      }
    }

    if (!session) {
      return NextResponse.json({ messages: [] });
    }

    // 메시지 조회
    const messages = await prisma.message.findMany({
      where: {
        sessionId: session.id,
      },
      include: {
        crew: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ messages, sessionId: session.id });
  } catch (error) {
    console.error('메시지 조회 오류:', error);
    return NextResponse.json(
      { error: '메시지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}