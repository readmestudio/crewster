// 채팅 메시지 생성 및 스트리밍 응답
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCrewResponse } from '@/lib/crew-gemini';
import { withUsageLimit, requireAuthWithApiKey } from '@/lib/middleware';
import { logUsage } from '@/lib/usage';

export async function POST(request: NextRequest) {
  try {
    // 인증 및 메시지 제한 확인
    const result = await withUsageLimit(request, 'message_send');
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (result.error) {
      const errorData = await result.error.json();
      return new Response(JSON.stringify(errorData), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { auth } = result;

    // API Key 확인
    const apiKeyResult = await requireAuthWithApiKey(request);
    if (!apiKeyResult) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if ('error' in apiKeyResult) {
      const errorData = await apiKeyResult.error.json();
      return new Response(JSON.stringify(errorData), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { apiKey } = apiKeyResult;

    const body = await request.json();
    const { crewId, content, sessionId } = body;

    if (!crewId || !content) {
      return new Response(
        JSON.stringify({ error: 'crewId와 content는 필수입니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 크루 정보 조회
    const crew = await prisma.crew.findFirst({
      where: {
        id: crewId,
        userId: auth.userId,
      },
    });

    if (!crew) {
      return new Response(
        JSON.stringify({ error: '크루를 찾을 수 없습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 세션 조회 또는 생성
    let session = null;
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: auth.userId,
        },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          type: 'direct',
          userId: auth.userId,
          title: `${crew.name}와의 대화`,
        },
      });
    }

    // 사용량 로깅
    await logUsage(auth.userId, 'message_send');

    // 사용자 메시지 저장
    const userMessage = await prisma.message.create({
      data: {
        sessionId: session.id,
        crewId: null,
        content,
        role: 'user',
      },
    });

    // 이전 메시지 조회 (컨텍스트용)
    const previousMessages = await prisma.message.findMany({
      where: {
        sessionId: session.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 20,
    });

    // Gemini 응답 생성 (스트리밍)
    const context = {
      crewId: crew.id,
      crewName: crew.name,
      role: crew.role,
      instructions: crew.instructions,
      sessionId: session.id,
      previousMessages: previousMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
    };

    const stream = await getCrewResponse(apiKey, content, context);

    // 스트리밍 응답 반환
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let assistantContent = '';
        let messageId = '';

        try {
          const reader = stream.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;

            // SSE 형식으로 전송
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
          }

          // 응답 메시지 저장
          const assistantMessage = await prisma.message.create({
            data: {
              sessionId: session.id,
              crewId: crew.id,
              content: assistantContent,
              role: 'assistant',
            },
          });

          messageId = assistantMessage.id;

          // 세션 업데이트
          await prisma.chatSession.update({
            where: { id: session.id },
            data: { updatedAt: new Date() },
          });

          // 최종 메시지 ID 전송
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ messageId, sessionId: session.id })}\n\n`
            )
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('스트리밍 오류:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('채팅 API 오류:', error);
    return new Response(
      JSON.stringify({ error: '메시지 전송 중 오류가 발생했습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
