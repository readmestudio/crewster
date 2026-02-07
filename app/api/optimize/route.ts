// 프롬프트 최적화 API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCrewResponseNonStreaming } from '@/lib/crew-gemini';
import { requireAuthWithApiKey } from '@/lib/middleware';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 'ai');
    if (limited) return limited;

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
    const { crewId, conversationContext, reason } = body;

    if (!crewId || !conversationContext) {
      return NextResponse.json(
        { error: 'crewId와 conversationContext는 필수입니다.' },
        { status: 400 }
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
      return NextResponse.json(
        { error: '크루를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Gemini를 사용하여 지침 최적화
    const optimizationPrompt = `다음은 현재 크루의 지침입니다:

${crew.instructions}

다음은 최근 대화 내용입니다:

${conversationContext}

이 대화 내용을 바탕으로 크루의 지침을 개선하고 최적화해주세요.
기존 지침의 핵심은 유지하면서, 대화에서 나타난 사용자의 선호도나 요구사항을 반영하여 지침을 업데이트하세요.
개선된 지침만 반환해주세요.`;

    const optimizedInstructions = await getCrewResponseNonStreaming(apiKey, optimizationPrompt, {
      crewId: crew.id,
      crewName: crew.name,
      role: '지침 최적화 전문가',
      instructions: '사용자의 대화 내용을 분석하여 크루의 지침을 개선하고 최적화합니다.',
      sessionId: '',
    });

    // 최적화 히스토리 저장
    await prisma.optimization.create({
      data: {
        crewId: crew.id,
        previousInstructions: crew.instructions,
        newInstructions: optimizedInstructions,
        reason: reason || '사용자 요청에 의한 최적화',
      },
    });

    // 크루 지침 업데이트
    const updatedCrew = await prisma.crew.update({
      where: { id: crewId },
      data: {
        instructions: optimizedInstructions,
      },
    });

    return NextResponse.json({
      crew: updatedCrew,
      optimization: {
        previous: crew.instructions,
        new: optimizedInstructions,
      },
    });
  } catch (error) {
    console.error('최적화 오류:', error);
    return NextResponse.json(
      { error: '지침 최적화 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
