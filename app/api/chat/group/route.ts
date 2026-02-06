// 그룹 채팅 API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getGroupChatResponse } from '@/lib/crew-gemini';
import { requireAuth, requireAuthWithApiKey } from '@/lib/middleware';

// 그룹 세션 생성
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { crewIds, title } = body;

    if (!crewIds || !Array.isArray(crewIds) || crewIds.length === 0) {
      return NextResponse.json(
        { error: 'crewIds는 필수이며 배열이어야 합니다.' },
        { status: 400 }
      );
    }

    // 크루 존재 확인
    const crews = await prisma.crew.findMany({
      where: {
        id: { in: crewIds },
        userId: auth.userId,
      },
    });

    if (crews.length !== crewIds.length) {
      return NextResponse.json(
        { error: '일부 크루를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 그룹 세션 생성
    const session = await prisma.chatSession.create({
      data: {
        type: 'group',
        userId: auth.userId,
        title: title || `${crews.length}명의 크루 그룹`,
        crewMembers: {
          create: crewIds.map((crewId: string) => ({
            crewId,
          })),
        },
      },
      include: {
        crewMembers: {
          include: {
            crew: true,
          },
        },
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('그룹 세션 생성 오류:', error);
    return NextResponse.json(
      { error: '그룹 세션 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 그룹 메시지 전송
export async function PUT(request: NextRequest) {
  try {
    // API Key 확인
    const apiKeyResult = await requireAuthWithApiKey(request);
    if (!apiKeyResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ('error' in apiKeyResult) {
      return apiKeyResult.error;
    }
    const { auth, apiKey } = apiKeyResult;

    const body = await request.json();
    const { sessionId, content, targetCrewId, mentionedCrewIds } = body;

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: 'sessionId와 content는 필수입니다.' },
        { status: 400 }
      );
    }

    // 세션 조회
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
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

    // 사용자 메시지 저장
    const userMessage = await prisma.message.create({
      data: {
        sessionId: session.id,
        crewId: null,
        content,
        role: 'user',
      },
    });

    // 이전 메시지 조회
    const previousMessages = await prisma.message.findMany({
      where: {
        sessionId: session.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 20,
    });

    // 멘션된 크루가 있으면 해당 크루만, 없으면 타겟 크루 또는 모든 크루
    let targetCrews;
    if (mentionedCrewIds && mentionedCrewIds.length > 0) {
      targetCrews = session.crewMembers
        .filter((cm) => mentionedCrewIds.includes(cm.crewId))
        .map((cm) => cm.crew);

      if (targetCrews.length === 0) {
        return NextResponse.json(
          { error: '멘션된 크루를 그룹에서 찾을 수 없습니다.' },
          { status: 400 }
        );
      }
    } else if (targetCrewId) {
      targetCrews = session.crewMembers
        .filter((cm) => cm.crewId === targetCrewId)
        .map((cm) => cm.crew);
    } else {
      targetCrews = session.crewMembers.map((cm) => cm.crew);
    }

    // 각 멘션된 크루의 DM 세션 및 히스토리 조회
    const crewContextsWithDm = await Promise.all(
      targetCrews.map(async (crew) => {
        const dmSession = await prisma.chatSession.findFirst({
          where: {
            type: 'direct',
            userId: auth.userId,
            messages: {
              some: {
                crewId: crew.id,
              },
            },
          },
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc',
              },
              take: 40,
            },
          },
        });

        const dmHistory = dmSession?.messages
          ? dmSession.messages
              .filter((msg) => msg.crewId === crew.id || msg.role === 'user')
              .slice(-20)
              .map((msg) => ({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content,
              }))
          : [];

        return {
          crewId: crew.id,
          crewName: crew.name,
          role: crew.role,
          instructions: crew.instructions,
          sessionId: session.id,
          previousMessages: previousMessages.map((msg) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          })),
          dmHistory,
        };
      })
    );

    // 멀티 에이전트 응답 생성
    const responses = await getGroupChatResponse(
      apiKey,
      content,
      crewContextsWithDm,
      previousMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        crewId: msg.crewId || undefined,
      }))
    );

    // 각 크루의 응답 저장
    const assistantMessages = await Promise.all(
      responses.map((response) =>
        prisma.message.create({
          data: {
            sessionId: session.id,
            crewId: response.crewId,
            content: response.response,
            role: 'assistant',
          },
          include: {
            crew: true,
          },
        })
      )
    );

    // 세션 업데이트
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      userMessage,
      assistantMessages,
    });
  } catch (error) {
    console.error('그룹 메시지 전송 오류:', error);
    return NextResponse.json(
      { error: '그룹 메시지 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
