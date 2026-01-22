import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { ChatMessage } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();

    // 해당 날짜의 채팅 기록 가져오기
    const responses = await prisma.userResponse.findMany({
      where: {
        userId: auth.userId,
        date: date,
        context: 'chat',
      },
      orderBy: { createdAt: 'asc' },
    });

    const messages: ChatMessage[] = responses.map((r) => ({
      id: r.id,
      role: r.question === '사용자 메시지' ? 'user' : 'assistant',
      content: r.answer,
      timestamp: r.createdAt,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
